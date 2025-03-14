import fs from 'fs';
import path from 'path';
import { Document } from '@langchain/core/documents';
import { OpenAIEmbeddings } from '@langchain/openai';
import { MemoryVectorStore } from 'langchain/vectorstores/memory';

// Define the structure of a documentation section
interface DocSection {
  title: string;
  content: string;
}

// Define the structure of the documentation file
interface DocsData {
  sections: DocSection[];
}

// Module-level cache for the vector store
let cachedVectorStore: MemoryVectorStore | null = null;

// Load the documentation from a local file
const docsFilePath = path.join(process.cwd(), 'data', 'docs.json');

export async function loadAndProcessDocs(): Promise<MemoryVectorStore> {
  // Check if the vector store is already cached
  if (cachedVectorStore) {
    return cachedVectorStore;
  }

  // Load the documentation file
  const docsData: DocsData = JSON.parse(fs.readFileSync(docsFilePath, 'utf-8'));

  // Convert the documentation into LangChain Documents
  const docs = docsData.sections.map(
    (section) =>
      new Document({
        pageContent: section.content,
        metadata: { title: section.title },
      })
  );

  // Create embeddings and store them in a memory vector store
  const embeddings = new OpenAIEmbeddings({
    openAIApiKey: process.env.OPENAI_API_KEY,
  });
  const vectorStore = await MemoryVectorStore.fromDocuments(docs, embeddings);

  // Cache the vector store in memory
  cachedVectorStore = vectorStore;

  return vectorStore;
}