import { ChatAnthropic } from "@langchain/anthropic";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Only POST requests allowed" });
  }

  const { moveCode } = req.body;

  if (!moveCode) {
    return res.status(400).json({
      message: "Move smart contract code is required",
    });
  }

  try {
    // Generate code using Claude Sonnet
    const model = new ChatAnthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
      modelName: "claude-3-5-sonnet-20241022", // claude-3-7-sonnet-20250219
      temperature: 0.1,
    });

    const prompt = `
      You are Aptos Move smart contract developer and security expert.

      Audit provided Aptos move smart contract code. 
      Ensure the code is compatible with the Aptos blockchain and follows best practices.
      Avoid starting the response with phrases like 'I'll audit', start with the findings immediately.
      Avoid mentioning possitive aspects or suggestions for future development. Mention issues, vulnerabilities, and possible improvements you found.

      Move smart contract code:
      ${moveCode}
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
    console.error("Error auditor:", error);
    res
      .status(500)
      .json({ message: "Failed to audit the code", error: error?.message });
  }
}
