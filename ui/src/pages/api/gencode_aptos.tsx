import { ChatAnthropic } from "@langchain/anthropic";
import { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";
import { OpenAIEmbeddings } from "@langchain/openai";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Only POST requests allowed" });
  }

  const { query, ctx } = req.body;

  if (!query) {
    return res.status(400).json({ message: "Query is required" });
  }

  try {
    // Read the Move AI Agent documentation directly from file
    const aptosDocsPath = path.join(
      process.cwd(),
      "data",
      "aptos_smart_contract.txt"
    );
    const aptosDocs = fs.readFileSync(aptosDocsPath, "utf-8");

    let userContext: string = "User Context:\n";

    if (ctx && ctx.trim()) {
      console.log("Generating code with extra user context");
      // Split the data into chunks
      const textSplitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000,
        chunkOverlap: 200,
      });
      const docs = await textSplitter.createDocuments([ctx as string]);

      // Generate embeddings and store them
      const embeddings = new OpenAIEmbeddings({
        apiKey: process.env.OPENAI_API_KEY,
        model: "text-embedding-3-large",
      });
      // Add documents to the vector store
      const vectorStore = await MemoryVectorStore.fromDocuments(
        docs,
        embeddings
      );

      // Retrieve relevant documents
      const results = await vectorStore.similaritySearch(query, 3);

      userContext += results
        .map((result: any) => result.pageContent)
        .join("\n\n");
    }

    // Generate code using Claude Sonnet
    const model = new ChatAnthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
      modelName: "claude-3-5-sonnet-20241022", // claude-3-7-sonnet-20250219
      temperature: 0.1,
    });

    const prompt = `
      ${userContext}

      Context:
      ${aptosDocs}

      Query:
      ${query}

      Generate Aptos smart contract code based on the provided context and query. 
      Ensure the code is compatible with the Aptos blockchain and follows best practices.
      Return both, contract.move smart contract code and Move.toml manifest code. 
      Avoid any additional text, details, suggestions or instructions.
      Avoid unresolved addresses in Move.toml manifest.

      Make sure that output is properly escaped JSON string, adhering to this format:
        {
            \"contract\": \"move contract code\",
            \"manifest\": \"toml manifest code\"
        }
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
