import { pkg } from "@/types/pkg";
import { CodeFile } from "@/utils/codeHighlight";

export const CONTRACT_TEMPLATES: Record<string, CodeFile[]> = {
    "greet-dog": [
      {
        name: "contract.move",
        language: "move",
        content: `module dog_greeter::greet {
  use std::string::{Self, String};
  use aptos_framework::account;
  use aptos_framework::event;
  
  /// Struct to store greeting information
  struct DogGreeting has key {
      dog_name: String,
      greeting_message: String,
      greetings_count: u64,
      greeting_events: event::EventHandle<GreetingEvent>,
  }
  
  /// Event emitted when a dog is greeted
  struct GreetingEvent has drop, store {
      dog_name: String,
      greeting_message: String,
      greeter: address,
  }
  
  /// Error codes
  const E_DOG_GREETING_NOT_INITIALIZED: u64 = 1;
  
  /// Initialize the dog greeting module for the account
  public entry fun initialize(account: &signer, dog_name: String) {
      let account_addr = account::get_address(account);
      
      // Create a new dog greeting resource
      let greeting_handle = event::new_event_handle<GreetingEvent>(account);
      
      move_to(account, DogGreeting {
          dog_name,
          greeting_message: string::utf8(b"Hello, good dog!"),
          greetings_count: 0,
          greeting_events: greeting_handle,
      });
  }
  
  /// Greet the dog with a custom message
  public entry fun greet_dog(account: &signer, greeting_message: String) acquires DogGreeting {
      let account_addr = account::get_address(account);
      
      // Ensure the dog greeting resource exists
      assert!(exists<DogGreeting>(account_addr), E_DOG_GREETING_NOT_INITIALIZED);
      
      // Get a mutable reference to the dog greeting resource
      let dog_greeting = borrow_global_mut<DogGreeting>(account_addr);
      
      // Update the greeting message
      dog_greeting.greeting_message = greeting_message;
      
      // Increment the greetings count
      dog_greeting.greetings_count = dog_greeting.greetings_count + 1;
      
      // Emit a greeting event
      event::emit_event(&mut dog_greeting.greeting_events, GreetingEvent {
          dog_name: dog_greeting.dog_name,
          greeting_message,
          greeter: account_addr,
      });
  }
  
  /// Get the current greeting message for the dog
  #[view]
  public fun get_greeting(owner: address): String acquires DogGreeting {
      assert!(exists<DogGreeting>(owner), E_DOG_GREETING_NOT_INITIALIZED);
      let dog_greeting = borrow_global<DogGreeting>(owner);
      dog_greeting.greeting_message
  }
  
  /// Get the dog's name
  #[view]
  public fun get_dog_name(owner: address): String acquires DogGreeting {
      assert!(exists<DogGreeting>(owner), E_DOG_GREETING_NOT_INITIALIZED);
      let dog_greeting = borrow_global<DogGreeting>(owner);
      dog_greeting.dog_name
  }
  
  /// Get the total number of times the dog has been greeted
  #[view]
  public fun get_greetings_count(owner: address): u64 acquires DogGreeting {
      assert!(exists<DogGreeting>(owner), E_DOG_GREETING_NOT_INITIALIZED);
      let dog_greeting = borrow_global<DogGreeting>(owner);
      dog_greeting.greetings_count
  }
}`,
      },
      {
        name: "Move.toml",
        language: "toml",
        content: `
[package]
name = "DogGreeter"
version = "1.0.0"
authors = ["Your Name"]

[addresses]
dog_greeter = "0x1"

[dependencies]
AptosFramework = { git = "https://github.com/aptos-labs/aptos-core.git", subdir = "aptos-move/framework/aptos-framework/", rev = "main" }
`,
      },
    ],
    "counter": [
      {
        name: "contract.move",
        language: "move",
        content: `module simple_counter::counter {
  use std::signer;
  use aptos_framework::event;
  use aptos_framework::account;

  /// Resource to store counter data for each account
  struct CounterData has key {
      value: u64,
      increment_events: event::EventHandle<IncrementEvent>,
      decrement_events: event::EventHandle<DecrementEvent>,
      reset_events: event::EventHandle<ResetEvent>,
  }

  /// Event emitted when counter is incremented
  struct IncrementEvent has drop, store {
      counter_owner: address,
      old_value: u64,
      new_value: u64,
  }

  /// Event emitted when counter is decremented
  struct DecrementEvent has drop, store {
      counter_owner: address,
      old_value: u64,
      new_value: u64,
  }

  /// Event emitted when counter is reset
  struct ResetEvent has drop, store {
      counter_owner: address,
      old_value: u64,
  }

  /// Error codes
  const E_COUNTER_NOT_INITIALIZED: u64 = 1;
  const E_COUNTER_ALREADY_EXISTS: u64 = 2;

  /// Initialize a new counter for the account
  public entry fun initialize(account: &signer) {
      let account_addr = signer::address_of(account);
      
      // Check that the counter doesn't already exist
      assert!(!exists<CounterData>(account_addr), E_COUNTER_ALREADY_EXISTS);
      
      // Create new counter resource
      move_to(account, CounterData {
          value: 0,
          increment_events: account::new_event_handle<IncrementEvent>(account),
          decrement_events: account::new_event_handle<DecrementEvent>(account),
          reset_events: account::new_event_handle<ResetEvent>(account),
      });
  }

  /// Increment the counter by 1
  public entry fun increment(account: &signer) acquires CounterData {
      let account_addr = signer::address_of(account);
      
      // Check that the counter exists
      assert!(exists<CounterData>(account_addr), E_COUNTER_NOT_INITIALIZED);
      
      // Increment counter
      let counter = borrow_global_mut<CounterData>(account_addr);
      let old_value = counter.value;
      counter.value = counter.value + 1;
      
      // Emit event
      event::emit_event(&mut counter.increment_events, IncrementEvent {
          counter_owner: account_addr,
          old_value,
          new_value: counter.value,
      });
  }

  /// Decrement the counter by 1
  public entry fun decrement(account: &signer) acquires CounterData {
      let account_addr = signer::address_of(account);
      
      // Check that the counter exists
      assert!(exists<CounterData>(account_addr), E_COUNTER_NOT_INITIALIZED);
      
      // Decrement counter, but don't go below zero
      let counter = borrow_global_mut<CounterData>(account_addr);
      let old_value = counter.value;
      
      if (counter.value > 0) {
          counter.value = counter.value - 1;
      };
      
      // Emit event
      event::emit_event(&mut counter.decrement_events, DecrementEvent {
          counter_owner: account_addr,
          old_value,
          new_value: counter.value,
      });
  }

  /// Reset the counter to 0
  public entry fun reset(account: &signer) acquires CounterData {
      let account_addr = signer::address_of(account);
      
      // Check that the counter exists
      assert!(exists<CounterData>(account_addr), E_COUNTER_NOT_INITIALIZED);
      
      // Reset counter
      let counter = borrow_global_mut<CounterData>(account_addr);
      let old_value = counter.value;
      counter.value = 0;
      
      // Emit event
      event::emit_event(&mut counter.reset_events, ResetEvent {
          counter_owner: account_addr,
          old_value,
      });
  }

  /// Get the current counter value
  #[view]
  public fun get_value(account_addr: address): u64 acquires CounterData {
      assert!(exists<CounterData>(account_addr), E_COUNTER_NOT_INITIALIZED);
      borrow_global<CounterData>(account_addr).value
  }
}`,
      },
      {
        name: "Move.toml",
        language: "toml",
        content: `[package]
name = "SimpleCounter"
version = "1.0.0"
authors = ["Your Name"]

[addresses]
simple_counter = "0x1"

[dependencies]
AptosFramework = { git = "https://github.com/aptos-labs/aptos-core.git", subdir = "aptos-move/framework/aptos-framework/", rev = "main" }
`,
      },
    ],
    "nft": [
      {
        name: "contract.move",
        language: "move",
        content: `module simple_nft::basic_nft {
  use std::error;
  use std::signer;
  use std::string::{Self, String};
  use std::vector;
  use aptos_framework::account;
  use aptos_framework::event::{Self, EventHandle};
  use aptos_framework::object::{Self, Object, ObjectId};
  use aptos_token_objects::collection;
  use aptos_token_objects::token;
  use aptos_token_objects::token::TokenId;

  // Error codes
  const E_NOT_INITIALIZED: u64 = 1;
  const E_ALREADY_INITIALIZED: u64 = 2;
  const E_NOT_CREATOR: u64 = 3;
  const E_NOT_OWNER: u64 = 4;
  const E_COLLECTION_ALREADY_EXISTS: u64 = 5;
  const E_MAX_SUPPLY_REACHED: u64 = 6;

  // Resource to track collection info
  struct CollectionData has key {
      collection_name: String,
      description: String,
      uri: String,
      max_supply: u64,
      minted: u64,
      burned: u64,
      mint_events: EventHandle<MintEvent>,
      burn_events: EventHandle<BurnEvent>,
  }

  // Event emitted when a new NFT is minted
  struct MintEvent has drop, store {
      token_id: TokenId,
      creator: address,
      receiver: address,
      token_name: String,
      token_uri: String,
  }

  // Event emitted when an NFT is burned
  struct BurnEvent has drop, store {
      token_id: TokenId,
      owner: address,
      token_name: String,
  }

  // Initialize the module with a new collection
  public entry fun initialize_collection(
      account: &signer,
      collection_name: String,
      description: String,
      collection_uri: String,
      max_supply: u64
  ) {
      let account_addr = signer::address_of(account);
      
      // Ensure this account hasn't already initialized
      assert!(!exists<CollectionData>(account_addr), error::already_exists(E_ALREADY_INITIALIZED));
      
      // Create the collection
      let constructor_ref = collection::create_unlimited_collection(
          account,
          description,
          collection_name,
          option::some(collection_uri),
          true, // mutable description
          true, // mutable royalty
          true, // mutable uri
          true, // mutable token name
          true, // mutable token properties
          true, // mutable token description
          true  // mutable token uri
      );
      
      // Store the collection data
      move_to(account, CollectionData {
          collection_name,
          description,
          uri: collection_uri,
          max_supply,
          minted: 0,
          burned: 0,
          mint_events: account::new_event_handle<MintEvent>(account),
          burn_events: account::new_event_handle<BurnEvent>(account),
      });
  }

  // Mint a new NFT
  public entry fun mint_nft(
      creator: &signer,
      receiver_addr: address,
      token_name: String,
      token_description: String,
      token_uri: String
  ) acquires CollectionData {
      let creator_addr = signer::address_of(creator);
      
      // Check if collection exists
      assert!(exists<CollectionData>(creator_addr), error::not_found(E_NOT_INITIALIZED));
      
      // Get collection data
      let collection_data = borrow_global_mut<CollectionData>(creator_addr);
      
      // Check if max supply reached
      let current_supply = collection_data.minted - collection_data.burned;
      assert!(current_supply < collection_data.max_supply, error::resource_exhausted(E_MAX_SUPPLY_REACHED));
      
      // Mint the token
      let constructor_ref = token::create_named_token(
          creator,
          collection_data.collection_name,
          token_description,
          token_name,
          option::some(token_uri),
          vector::empty<String>(), // property_keys
          vector::empty<vector<u8>>(), // property_values
          vector::empty<String>() // property_types
      );
      
      // Get token object and ID
      let token_obj = object::object_from_constructor_ref(&constructor_ref);
      let token_id = token::get_token_id(&token_obj);
      
      // Transfer the token to the receiver if different from creator
      if (receiver_addr != creator_addr) {
          object::transfer(creator, token_obj, receiver_addr);
      };
      
      // Increment minted count
      collection_data.minted = collection_data.minted + 1;
      
      // Emit mint event
      event::emit_event(
          &mut collection_data.mint_events,
          MintEvent {
              token_id,
              creator: creator_addr,
              receiver: receiver_addr,
              token_name,
              token_uri,
          }
      );
  }
  
  // Burn an NFT
  public entry fun burn_nft(
      owner: &signer,
      creator_addr: address,
      collection_name: String,
      token_name: String
  ) acquires CollectionData {
      let owner_addr = signer::address_of(owner);
      
      // Check if collection exists
      assert!(exists<CollectionData>(creator_addr), error::not_found(E_NOT_INITIALIZED));
      
      // Get token address from creator, collection, and token name
      let token_address = token::create_token_address(
          &creator_addr,
          &collection_name,
          &token_name
      );
      
      // Get token object
      let token_obj = object::address_to_object<token::Token>(token_address);
      
      // Verify ownership
      assert!(object::is_owner(token_obj, owner_addr), error::permission_denied(E_NOT_OWNER));
      
      // Get token ID before burning
      let token_id = token::get_token_id(&token_obj);
      
      // Burn the token
      token::burn(owner, token_obj);
      
      // Update collection data
      let collection_data = borrow_global_mut<CollectionData>(creator_addr);
      collection_data.burned = collection_data.burned + 1;
      
      // Emit burn event
      event::emit_event(
          &mut collection_data.burn_events,
          BurnEvent {
              token_id,
              owner: owner_addr,
              token_name,
          }
      );
  }
  
  // Get current supply of NFTs (minted - burned)
  #[view]
  public fun get_current_supply(creator_addr: address): u64 acquires CollectionData {
      assert!(exists<CollectionData>(creator_addr), error::not_found(E_NOT_INITIALIZED));
      let collection_data = borrow_global<CollectionData>(creator_addr);
      collection_data.minted - collection_data.burned
  }
  
  // Get max supply of NFTs
  #[view]
  public fun get_max_supply(creator_addr: address): u64 acquires CollectionData {
      assert!(exists<CollectionData>(creator_addr), error::not_found(E_NOT_INITIALIZED));
      let collection_data = borrow_global<CollectionData>(creator_addr);
      collection_data.max_supply
  }
  
  // Get total minted NFTs (including burned ones)
  #[view]
  public fun get_total_minted(creator_addr: address): u64 acquires CollectionData {
      assert!(exists<CollectionData>(creator_addr), error::not_found(E_NOT_INITIALIZED));
      let collection_data = borrow_global<CollectionData>(creator_addr);
      collection_data.minted
  }
  
  // Get total burned NFTs
  #[view]
  public fun get_total_burned(creator_addr: address): u64 acquires CollectionData {
      assert!(exists<CollectionData>(creator_addr), error::not_found(E_NOT_INITIALIZED));
      let collection_data = borrow_global<CollectionData>(creator_addr);
      collection_data.burned
  }
}`,
      },
      {
        name: "Move.toml",
        language: "toml",
        content: `[package]
name = "SimpleNFT"
version = "1.0.0"
authors = ["Your Name"]

[addresses]
simple_nft = "0x1"

[dependencies]
AptosFramework = { git = "https://github.com/aptos-labs/aptos-core.git", subdir = "aptos-move/framework/aptos-framework/", rev = "main" }
AptosTokenObjects = { git = "https://github.com/aptos-labs/aptos-core.git", subdir = "aptos-move/framework/aptos-token-objects/", rev = "main" }
`,
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