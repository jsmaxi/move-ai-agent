import "dotenv/config";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import {
  AptosAccountAddressTool,
  AptosBalanceTool,
  AptosGetTokenDetailTool,
  AptosGetTokenPriceTool,
  AptosTransactionTool,
  JouleGetPoolDetails,
  LocalSigner,
  AgentRuntime,
} from "move-agent-kit";
import {
  Network,
  AptosConfig,
  Aptos,
  Ed25519PrivateKey,
  PrivateKey,
  PrivateKeyVariants,
} from "@aptos-labs/ts-sdk";
import { BaseMessage } from "@langchain/core/messages";
import { Annotation, messagesStateReducer } from "@langchain/langgraph";
import { ChatAnthropic } from "@langchain/anthropic";

const llm = new ChatAnthropic({
  model: "claude-3-5-sonnet-latest",
  anthropicApiKey: process.env.ANTHROPIC_API_KEY,
});

const setupAgentKit = async () => {
  const netw =
    process.env.IS_MAINNET === "true" ? Network.MAINNET : Network.TESTNET;

  const aptosConfig = new AptosConfig({
    network: netw,
  });
  const aptos = new Aptos(aptosConfig);
  const account = await aptos.deriveAccountFromPrivateKey({
    privateKey: new Ed25519PrivateKey(
      PrivateKey.formatPrivateKey(
        process.env.PRIVATE_KEY,
        PrivateKeyVariants.Ed25519
      )
    ),
  });
  const signer = new LocalSigner(account, netw);
  const agentRuntime = new AgentRuntime(signer, aptos);

  return {
    agentRuntime,
    llm,
  };
};

const createAptosReadAgent = async () => {
  const { agentRuntime, llm } = await setupAgentKit();

  const readAgentTools = [
    new AptosBalanceTool(agentRuntime),
    new AptosGetTokenDetailTool(agentRuntime),
    new AptosAccountAddressTool(agentRuntime),
    new AptosTransactionTool(agentRuntime),
    new AptosGetTokenPriceTool(agentRuntime),
    new JouleGetPoolDetails(agentRuntime),
  ];

  const readAgent = createReactAgent({
    tools: readAgentTools,
    llm: llm,
  });

  return readAgent;
};

const aptosReadNode = async (state) => {
  const { messages } = state;

  const readAgent = await createAptosReadAgent();

  const result = await readAgent.invoke({ messages });

  return {
    messages: [...result.messages],
  };
};

const StateAnnotation = Annotation.Root({
  messages: {
    reducer: messagesStateReducer,
    default: () => [],
  },
  isAptosReadQuery: {
    reducer: (x, y) => y ?? x ?? false,
    default: () => false,
  },
  isWriterQuery: {
    reducer: (x, y) => y ?? x ?? false,
    default: () => false,
  },
  isXPostQuery: {
    reducer: (x, y) => y ?? x ?? false,
    default: () => false,
  },
});
