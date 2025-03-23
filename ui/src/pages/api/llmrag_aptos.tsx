import { ChatAnthropic } from "@langchain/anthropic";
import { NextApiRequest, NextApiResponse } from "next";

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
    const model = new ChatAnthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
      modelName: "claude-3-5-sonnet-20241022", // claude-3-7-sonnet-20250219
      temperature: 0.1,
    });

    const prompt = `
      You are an expert in Aptos blockchain and the Move programming language. 
      Please answer the following question thoroughly and professionally, referencing official documentation and reliable resources. 
      Keep your response under 500 characters unless specifically requested more details.

      Question:
      ${query}
    `;

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
