import { CodeFile } from "@/utils/codeHighlight";

export const pkg: CodeFile = {
  name: "package.json",
  language: "javascript",
  content: `{
  "name": "PlayLab",
  "version": "1.0.0",
  "description": "Move agent kit PlayLab",
  "main": "agent.ts",
  "type": "module",
  "private": true,
  "scripts": {
  },
  "keywords": ["aptos", "blockchain", "monitoring", "agent"],
  "author": "Aptos PlayLab",
  "license": "MIT",
  "dependencies": {
    "@aptos-labs/ts-sdk": "^1.35.0",
    "@langchain/anthropic": "^0.3.15",
    "@langchain/core": "^0.3.42",
    "@langchain/langgraph": "^0.2.55",
    "dotenv": "^16.4.7",
    "move-agent-kit": "^0.2.0",
    "typescript": "^5.8.2"
  },
  "devDependencies": {
    "@types/node": "^22.13.10"
  }
}`,
};
