import { ChatAnthropic } from "@langchain/anthropic";
import { OpenAIEmbeddings } from "@langchain/openai";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
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
    // Fetch documentation and examples from a remote source
    // const aptosDocs = await fetchData(
    //   "https://cdn.jsdelivr.net/gh/jsmaxi/llm-embeddings/test.txt"
    // );
    const aptosExamples = await fetchData(
      "https://cdn.jsdelivr.net/gh/jsmaxi/llm-embeddings/examples.txt"
    );

    // Split the data into chunks
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });
    const docs = await textSplitter.createDocuments([
      /*aptosDocs, */ aptosExamples,
    ]);

    // Generate embeddings and store them
    const embeddings = new OpenAIEmbeddings({
      apiKey: process.env.OPENAI_API_KEY,
      model: "text-embedding-3-large",
    });
    // Add documents to the vector store
    const vectorStore = await MemoryVectorStore.fromDocuments(docs, embeddings);

    // Retrieve relevant documents
    const results = await vectorStore.similaritySearch(query, 3);

    const context = results
      .map((result: any) => result.pageContent)
      .join("\n\n");

    // Generate code using Claude Sonnet
    const model = new ChatAnthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
      modelName: "claude-3-5-sonnet-20241022", // claude-3-7-sonnet-20250219
      temperature: 0.1,
    });

    const prompt = `
      Context:
      ${context}

      Task:
      ${query}

      Generate Aptos smart contract code based on the provided context. Ensure the code is compatible with the Aptos blockchain and follows best practices.
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

async function fetchData(url: string) {
  const response = await fetch(url);
  if (!response.ok) {
    console.log(response?.status, response?.statusText);
    throw new Error(`Failed to fetch data from ${url}`);
  }
  return await response.text();
}
