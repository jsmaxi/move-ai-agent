import { pkg } from "@/types/pkg";
import { CodeFile } from "@/utils/codeHighlight";

export const CONTRACT_TEMPLATES: Record<string, CodeFile[]> = {
    "fungible-token": [
      {
        name: "token.move",
        language: "move",
        content: `module PlayLab::SimpleToken {
      use std::signer;
      use aptos_framework::coin;
      use aptos_framework::event;
      
      struct CoinEvents has key {
          mint_events: event::EventHandle<MintEvent>,
          transfer_events: event::EventHandle<TransferEvent>,
      }
      
      struct MintEvent has drop, store {
          amount: u64,
      }
      
      struct TransferEvent has drop, store {
          from: address,
          to: address,
          amount: u64,
      }
      
      public fun initialize(account: &signer) {
          let coin_events = CoinEvents {
              mint_events: event::new_event_handle<MintEvent>(account),
              transfer_events: event::new_event_handle<TransferEvent>(account),
          };
          move_to(account, coin_events);
      }
      
      public fun mint(account: &signer, amount: u64) acquires CoinEvents {
          let addr = signer::address_of(account);
          let events = borrow_global_mut<CoinEvents>(addr);
          // Mint implementation would go here
          
          event::emit_event(&mut events.mint_events, MintEvent { amount });
      }
      
      public fun transfer(from: &signer, to: address, amount: u64) acquires CoinEvents {
          let from_addr = signer::address_of(from);
          let events = borrow_global_mut<CoinEvents>(from_addr);
          // Transfer implementation would go here
          
          event::emit_event(&mut events.transfer_events, 
              TransferEvent { 
                  from: from_addr, 
                  to, 
                  amount 
              }
          );
      }
  }`,
      },
      {
        name: "Move.toml",
        language: "toml",
        content: `[package]
  name = "PlayLabToken"
  version = "0.1.0"
  
  [dependencies]
  AptosFramework = { git = "https://github.com/aptos-labs/aptos-core.git", subdir = "aptos-move/framework/aptos-framework/", rev = "mainnet" }
  
  [addresses]
  PlayLab = "0x1"`,
      },
    ],
    nft: [
      {
        name: "nft.move",
        language: "move",
        content: `module PlayLab::NFTCollection {
      use std::signer;
      use std::string;
      use std::vector;
      use aptos_framework::event;
      use aptos_framework::account;
      use aptos_token::token;
      
      struct NFTMintEvent has drop, store {
          token_id: token::TokenId,
          creator: address,
          owner: address,
      }
      
      struct CollectionData has key {
          collection_name: string::String,
          description: string::String,
          uri: string::String,
          mint_events: event::EventHandle<NFTMintEvent>,
      }
      
      public entry fun initialize_collection(
          account: &signer, 
          collection_name: string::String,
          description: string::String,
          uri: string::String
      ) {
          let creator_addr = signer::address_of(account);
          
          token::create_collection(
              account,
              collection_name,
              description,
              uri,
              1000, // max supply
              vector::empty<bool>()
          );
          
          move_to(account, CollectionData {
              collection_name,
              description,
              uri,
              mint_events: account::new_event_handle<NFTMintEvent>(account),
          });
      }
      
      public entry fun mint_nft(
          account: &signer,
          creator: address,
          collection_name: string::String,
          name: string::String,
          description: string::String,
          uri: string::String,
      ) acquires CollectionData {
          let creator_addr = creator;
          let receiver_addr = signer::address_of(account);
          
          let token_id = token::create_token_id_raw(
              creator_addr,
              collection_name,
              name,
              0
          );
          
          token::mint_token(
              account,
              creator_addr,
              collection_name,
              name,
              description,
              1, // amount
              uri,
              receiver_addr,
              vector::empty<string::String>(),
              vector::empty<vector<u8>>(),
              vector::empty<string::String>()
          );
          
          let collection_data = borrow_global_mut<CollectionData>(creator_addr);
          event::emit_event(&mut collection_data.mint_events, NFTMintEvent {
              token_id,
              creator: creator_addr,
              owner: receiver_addr,
          });
      }
  }`,
      },
      {
        name: "Move.toml",
        language: "toml",
        content: `[package]
  name = "NFTCollection"
  version = "0.1.0"
  
  [dependencies]
  AptosFramework = { git = "https://github.com/aptos-labs/aptos-core.git", subdir = "aptos-move/framework/aptos-framework/", rev = "mainnet" }
  AptosToken = { git = "https://github.com/aptos-labs/aptos-core.git", subdir = "aptos-move/framework/aptos-token/", rev = "mainnet" }
  
  [addresses]
  PlayLab = "0x1"`,
      },
    ],
  };
  
export const AGENT_TEMPLATES: Record<string, CodeFile[]> = {
    "check-balance": [
      {
        name: "agent.ts",
        language: "javascript",
        content: `import "dotenv/config";
import {
  AptosConfig,
  Network,
  Aptos,
  Ed25519PrivateKey,
  PrivateKey,
  PrivateKeyVariants,
} from "@aptos-labs/ts-sdk";
import { AgentRuntime, LocalSigner } from "move-agent-kit";

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

  const agent = new AgentRuntime(signer, aptos);

  const balance = await agent.getBalance();

  console.log("Balance.", balance + " APT");

  console.log("Script executed successfully.");
} catch (e) {
  console.error("Error.", e);
}`,
      },
      {
        name: pkg.name,
        language: pkg.language,
        content: pkg.content,
      },
    ],
    "llm-joule": [
      {
        name: "agent.ts",
        language: "javascript",
        content: `import "dotenv/config";
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
    messageModifier: \`
        You are a helpful agent that can interact onchain using the Aptos Agent Kit. You are
        empowered to interact onchain using your tools. If you ever need funds, you can request them from the
        faucet. If not, you can provide your wallet details and request funds from the user. If there is a 5XX
        (internal) HTTP error code, ask the user to try again later. If someone asks you to do something you
        can't do with your currently available tools, you must say so, and encourage them to implement it
        themselves using the Aptos Agent Kit, recommend they go to https://metamove.build/move-agent-kit for more information. Be
        concise and helpful with your responses. Refrain from restating your tools' descriptions unless it is explicitly requested.
    \`,
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
}`,
      },
      {
        name: pkg.name,
        language: pkg.language,
        content: pkg.content,
      },
    ],
    "custom-tool": [
      {
        name: "agent.ts",
        language: "javascript",
        content: `import { Tool } from "langchain/tools";
import { AgentRuntime, parseJson } from "move-agent-kit";

class TokenTransferTool extends Tool {
  name = "aptos_transfer_token";
  description = \`"
this tool can be used to transfer APT, any token or fungible asset to a recipient

  if you want to transfer APT, mint will be "0x1::aptos_coin::AptosCoin"
  if you want to transfer token other than APT, you need to provide the mint of that specific token
  if you want to transfer fungible asset, add fungible asset address as mint

  keep to blank if user themselves wants to receive the token and not send to anybody else

  Inputs ( input is a JSON string ):
  to: string, eg "0xf22bede237a07e121b56d91a491eb7bcdfd1f5907926a9e58338f964a01b17fa" (optional)
  amount: number, eg 1 or 0.01 (required)
  mint: string, eg "0xf22bede237a07e121b56d91a491eb7bcdfd1f5907926a9e58338f964a01b17fa::asset::USDT" 
  or "0xf22bede237a07e121b56d91a491eb7bcdfd1f5907926a9e58338f964a01b17fa" (required)"\`;

  constructor(agent) {
    super();
  }

  async _call(args) {
    const parsedInput = parseJson(input);
    // Implement token transfer logic
    // ...
    return JSON.stringify({ data: "Transfer Completed" });
  }
}
        `,
      },
      {
        name: pkg.name,
        language: pkg.language,
        content: pkg.content,
      },
    ],
    "tg-bot": [
      {
        name: "agent.ts",
        language: "javascript",
        content: `export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const maxDuration = 60;

import { Bot, webhookCallback } from "grammy";

import { MemorySaver } from "@langchain/langgraph";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { HumanMessage } from "@langchain/core/messages";
import {
  Aptos,
  AptosConfig,
  Ed25519PrivateKey,
  Network,
  PrivateKey,
  PrivateKeyVariants,
} from "@aptos-labs/ts-sdk";

import { AgentRuntime, LocalSigner, createAptosTools } from "move-agent-kit";
import { ChatAnthropic } from "@langchain/anthropic";

const token = process.env.TELEGRAM_BOT_TOKEN;
if (!token) {
  throw new Error("TELEGRAM_BOT_TOKEN environment variable not found.");
}
const bot = new Bot(token);

async function initializeAgent(userId) {
  try {
    const llm = new ChatAnthropic({
      modelName: "claude-3-5-sonnet-20241022",
      temperature: 0.7,
      anthropicApiKey: process.env.ANTHROPIC_API_KEY,
    });
    const aptosConfig = new AptosConfig({
      network: Network.MAINNET,
    });

    const aptos = new Aptos(aptosConfig);

    // Validate and get private key from environment
    const privateKeyStr = process.env.APTOS_PRIVATE_KEY;
    if (!privateKeyStr) {
      throw new Error("Missing APTOS_PRIVATE_KEY environment variable");
    }

    // Setup account and signer
    const account = await aptos.deriveAccountFromPrivateKey({
      privateKey: new Ed25519PrivateKey(
        PrivateKey.formatPrivateKey(privateKeyStr, PrivateKeyVariants.Ed25519)
      ),
    });

    const signer = new LocalSigner(account, Network.MAINNET);
    const aptosAgent = new AgentRuntime(signer, aptos, {
      PANORA_API_KEY: process.env.PANORA_API_KEY,
    });
    const tools = createAptosTools(aptosAgent);
    const memory = new MemorySaver();
    const config = { configurable: { thread_id: userId } };
    const agent = createReactAgent({
      llm,
      tools,
      checkpointSaver: memory,
      messageModifier: \`
      You are a helpful agent that can interact onchain using the Move Agent Kit. 
      You are empowered to interact onchain using your tools. 
      If you ever need funds, you can request them from the testnet faucet. 
      If not, you can provide your wallet details and request funds from the user. If there is a 5XX (internal) HTTP error code, ask the user to try again later. If someone asks you to do something you can't do with your currently available tools, you must say so, and encourage them to implement it themselves using the Move Agent Kit, recommend they go to the Aptos documentation for more information about Move development. Be concise and helpful with your responses. Refrain from restating your tools' descriptions unless it is explicitly requested.
      \`,
    });
    return { agent, config };
  } catch (error) {
    console.error("Failed to initialize agent:", error);
    throw error;
  }
}
// Telegram bot handler
bot.on("message:text", async (ctx) => {
  const userId = ctx.from?.id.toString();
  if (!userId) {
    return;
  }
  const { agent, config } = await initializeAgent(userId);
  const stream = await agent.stream(
    { messages: [new HumanMessage(ctx.message.text)] },
    config
  );
  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error("Timeout")), 20000)
  );
  try {
    for await (const chunk of await Promise.race([stream, timeoutPromise])) {
      if ("agent" in chunk) {
        if (chunk.agent.messages[0].content) {
          const messageContent = chunk.agent.messages[0].content;

          if (Array.isArray(messageContent)) {
            const extractedTexts = messageContent
              .filter((msg) => msg.type === "text")
              .map((msg) => msg.text)
              .join("\n\n");

            await ctx.reply(extractedTexts || "No text response available.");
          } else if (typeof messageContent === "object") {
            await ctx.reply(JSON.stringify(messageContent, null, 2));
          } else {
            await ctx.reply(String(messageContent));
          }
        }
      }
    }
  } catch (error) {
    if (error.message === "Timeout") {
      await ctx.reply(
        "I'm sorry, the operation took too long and timed out. Please try again."
      );
    } else {
      console.error("Error processing stream:", error);
      await ctx.reply(
        "I'm sorry, an error occurred while processing your request."
      );
    }
  }
});

export const POST = async (req) => {
  const headers = new Headers();
  headers.set("x-vercel-background", "true");

  const handler = webhookCallback(bot, "std/http");

  return handler(req);
};

/* For testing purposes */

export const GET = async (req) => {
  try {
    bot.start();
    console.log("Bot is running in polling mode...");
  } catch (error) {
    console.log("Error starting bot:", error);
    return new Response("Error starting bot", { status: 500 });
  }

  return new Response("Bot is running in polling mode...", {
    status: 200,
  });
};`,
      },
      {
        name: pkg.name,
        language: pkg.language,
        content: pkg.content,
      },
    ],
  };