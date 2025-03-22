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

  const { txt, ctx } = req.body;

  if (!txt) {
    return res.status(400).json({ message: "Prompt is required" });
  }

  try {
    if (ctx.trim()) {
      console.log("Generating code with extra context");
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
      const results = await vectorStore.similaritySearch(txt, 3);

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
      ${txt}

      Generate Aptos smart contract code based on the provided context and task. 
      Ensure the code is compatible with the Aptos blockchain and follows best practices.
      Return both, contract.move smart contract code and Move.toml manifest code. 
      Avoid any additional text, details, suggestions or instructions.
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
    } else {
      console.log("Generating code without extra context");
      // Generate code using Claude Sonnet
      const model = new ChatAnthropic({
        apiKey: process.env.ANTHROPIC_API_KEY,
        modelName: "claude-3-5-sonnet-20241022", // claude-3-7-sonnet-20250219
        temperature: 0.1,
      });

      const prompt = `
        Task:
        ${txt}
  
        Ensure the code is compatible with the Aptos blockchain and follows best practices.
        Return both, contract.move smart contract code and Move.toml manifest code. 
        Avoid any additional text, details, suggestions or instructions.
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
    }
  } catch (error: any) {
    console.error("Error generating code:", error);
    res
      .status(500)
      .json({ message: "Failed to generate code", error: error?.message });
  }
}
