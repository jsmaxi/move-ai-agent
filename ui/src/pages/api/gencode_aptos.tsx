import { ChatAnthropic } from "@langchain/anthropic";
import { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Only POST requests allowed" });
  }

  const { query } = req.body;

  if (!query) {
    return res.status(400).json({ message: "Query is required" });
  }

  try {
    // Read the Move AI Agent documentation directly from file
    const moveAgentDocsPath = path.join(
      process.cwd(),
      "data",
      "aptos_smart_contract.txt"
    );
    const moveAgentDocs = fs.readFileSync(moveAgentDocsPath, "utf-8");

    // Generate code using Claude Sonnet
    const model = new ChatAnthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
      modelName: "claude-3-5-sonnet-20241022", // claude-3-7-sonnet-20250219
      temperature: 0.1,
    });

    const prompt = `
      Context:
      ${moveAgentDocs}

      Query:
      ${query}

      Generate Aptos smart contract code based on the provided context and query. Ensure the code is compatible with the Aptos blockchain and follows best practices.Return both, contract.move smart contract code and Move.toml manifest code. 
      Avoid any additional text, details, suggestions or instructions.
      Avoid unresolved addresses in Move.toml manifest.
      Make sure that output is properly escaped JSON string, adhering to this format:
        {
            \"contract\": \"move contract code\",
            \"manifest\": \"toml manifest code\"
        }
      `

    const response = await model.invoke(prompt);
    console.log("Response length.", response?.content?.length);
    console.log(
      "Usage.",
      "Input tokens: " + response?.usage_metadata?.input_tokens,
      ". " + "Output tokens: " + response?.usage_metadata?.output_tokens
    );
    res.status(200).json({ output: response.content });
  } catch (error: any) {
    console.error("Error generating code:", error);
    res
      .status(500)
      .json({ message: "Failed to generate code", error: error?.message });
  }
}