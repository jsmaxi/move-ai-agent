import { NextApiRequest, NextApiResponse } from "next";
import { ChatAnthropic } from "@langchain/anthropic";
import { PromptTemplate } from "@langchain/core/prompts";
import { loadAndProcessDocs } from "../../lib/loadDocs";
import { RunnableSequence } from "@langchain/core/runnables";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    const { userRequest } = req.body;

    if (!userRequest) {
      return res.status(400).json({ message: "User prompt is required" });
    }

    try {
      const generatedCode = await generateCode(userRequest);
      res.status(200).json({ output: generatedCode });
    } catch (error: any) {
      res.status(500).json({ error: error?.message });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}

const model = new ChatAnthropic({
  anthropicApiKey: process.env.ANTHROPIC_API_KEY,
  modelName: "claude-3-5-sonnet-20241022",
  temperature: 0.1,
});

const prompt = PromptTemplate.fromTemplate(`
  You are a programming assistant. Your task is to generate javascript code based on the following documentation and javascript examples:
  
  {documentation}
  
  If the documentation contains sufficient information to answer the user's request, use it to generate the code.
  If the documentation is insufficient but you can reason from documentation to answer the request, generate the suggested code. 
  If neither the documentation nor your reasoning is sufficient, respond with: "I don't have enough information to generate the code. Please refer to the documentation here: {docsLink}."
  
  User request: {request}
`);

const chain = RunnableSequence.from([prompt, model]);

async function generateCode(userRequest: string) {
  const vectorStore = await loadAndProcessDocs();
  const relevantDocs = await vectorStore.similaritySearch(userRequest, 5); // Retrieve top 5 relevant sections
  const documentation = relevantDocs
    .map((doc: any) => doc.pageContent)
    .join("\n\n");

  const response = await chain.invoke({
    documentation,
    request: userRequest,
    docsLink: "https://metamove.gitbook.io/move-agent-kit",
  });

  return response.content;
}
