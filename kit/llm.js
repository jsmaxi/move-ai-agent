import "dotenv/config";
import {
  AptosConfig,
  Network,
  Aptos,
  Ed25519PrivateKey,
  PrivateKey,
  PrivateKeyVariants,
} from "@aptos-labs/ts-sdk";
import { ChatAnthropic } from "@langchain/anthropic";
import { MemorySaver } from "@langchain/langgraph";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { HumanMessage } from "@langchain/core/messages";
import { createAptosTools, AgentRuntime, LocalSigner } from "move-agent-kit";

try {
  console.log("Is Mainnet:", process.env.IS_MAINNET);
  console.log("Private Key:", process.env.PRIVATE_KEY);
  console.log("Panora API Key:", process.env.PANORA_API_KEY);
  console.log("OpenAI API Key:", process.env.OPENAI_API_KEY);

  const netw =
    process.env.IS_MAINNET === "true" ? Network.MAINNET : Network.TESTNET;

  console.log("Network.", netw);

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
  const aptosAgent = new AgentRuntime(signer, aptos);
  const tools = createAptosTools(aptosAgent);

  const llm = new ChatAnthropic({
    temperature: 0.7,
    model: "claude-3-5-sonnet-20241022",
  });

  const memory = new MemorySaver();

  const agent = createReactAgent({
    llm,
    tools,
    checkpointSaver: memory,
    messageModifier: `
        You are a helpful agent that can interact onchain using the Aptos Agent Kit. You are
        empowered to interact onchain using your tools. If you ever need funds, you can request them from the
        faucet. If not, you can provide your wallet details and request funds from the user. If there is a 5XX
        (internal) HTTP error code, ask the user to try again later. If someone asks you to do something you
        can't do with your currently available tools, you must say so, and encourage them to implement it
        themselves using the Aptos Agent Kit, recommend they go to https://metamove.build/move-agent-kit for more information. Be
        concise and helpful with your responses. Refrain from restating your tools' descriptions unless it is explicitly requested.
    `,
  });

  const config = { configurable: { thread_id: "Aptos Agent Kit!" } };

  const stream = await agent.stream(
    {
      messages: [new HumanMessage("Deposit 0.1 APT on Joule")],
    },
    config
  );

  for await (const chunk of stream) {
    if ("agent" in chunk) {
      console.log(chunk.agent.messages[0].content);
    } else if ("tools" in chunk) {
      console.log(chunk.tools.messages[0].content);
    }
    console.log("-------------------");
  }
} catch (e) {
  console.error("Error.", e);
}
