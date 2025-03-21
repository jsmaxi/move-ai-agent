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
    "transfer-monitor": [
      {
        name: "agent.js",
        language: "javascript",
        content: `import { AptosClient } from "aptos";
  import { MoveAgentKit } from "move-agent-kit";
  
  // Initialize the Move Agent Kit
  const client = new AptosClient("https://testnet.aptoslabs.com/v1");
  const agent = new MoveAgentKit({ client });
  
  // Monitor token transfers
  agent.on("tokenTransfer", async (event) => {
    console.log("Token transfer detected:", event);
    
    // Agent logic here
    const { from, to, amount } = event;
    
    // Example: Log large transfers
    if (amount > 1000) {
      console.log("Large transfer detected!");
      // Take action...
    }
  });
  
  // Start the agent
  agent.start().then(() => {
    console.log("Agent is running and monitoring token transfers");
  }).catch(error => {
    console.error("Failed to start agent:", error);
  });`,
      },
      {
        name: "package.json",
        language: "javascript",
        content: `{
    "name": "transfer-monitor-agent",
    "version": "1.0.0",
    "description": "Aptos token transfer monitoring agent",
    "main": "agent.js",
    "scripts": {
      "start": "node agent.js",
      "test": "echo \\"Error: no test specified\\" && exit 1"
    },
    "dependencies": {
      "aptos": "^1.10.0",
      "move-agent-kit": "^0.5.2"
    },
    "keywords": ["aptos", "blockchain", "monitoring", "agent"],
    "author": "Aptos PlayLab",
    "license": "MIT"
  }`,
      },
    ],
    "price-oracle": [
      {
        name: "price-oracle.js",
        language: "javascript",
        content: `import { AptosClient } from "aptos";
  import { MoveAgentKit } from "move-agent-kit";
  import axios from "axios";
  
  // Initialize the Move Agent Kit
  const client = new AptosClient("https://testnet.aptoslabs.com/v1");
  const agent = new MoveAgentKit({ client });
  
  // Price data cache
  let priceCache = {};
  
  // Fetch price from external API
  async function fetchPrice(symbol) {
    try {
      const response = await axios.get(\`https://api.example.com/prices/\${symbol}\`);
      return response.data.price;
    } catch (error) {
      console.error(\`Failed to fetch price for \${symbol}:\`, error);
      return null;
    }
  }
  
  // Update price cache periodically
  async function updatePrices() {
    const symbols = ["APT", "BTC", "ETH"];
    
    for (const symbol of symbols) {
      const price = await fetchPrice(symbol);
      if (price !== null) {
        priceCache[symbol] = price;
        console.log(\`Updated price for \${symbol}: \${price}\`);
      }
    }
    
    // Schedule next update
    setTimeout(updatePrices, 60000); // Update every minute
  }
  
  // Initialize price cache
  updatePrices();
  
  // Respond to price requests
  agent.on("priceRequest", async (event) => {
    const { symbol, requestor } = event;
    console.log(\`Price request for \${symbol} from \${requestor}\`);
    
    if (priceCache[symbol]) {
      // Send price to requestor
      await agent.submitTransaction({
        function: "0x1::oracle::publish_price",
        arguments: [symbol, priceCache[symbol], requestor],
        typeArguments: []
      });
      
      console.log(\`Sent price \${priceCache[symbol]} for \${symbol} to \${requestor}\`);
    } else {
      console.log(\`No price available for \${symbol}\`);
    }
  });
  
  // Start the agent
  agent.start().then(() => {
    console.log("Price oracle agent is running");
  }).catch(error => {
    console.error("Failed to start price oracle agent:", error);
  });`,
      },
      {
        name: "package.json",
        language: "javascript",
        content: `{
    "name": "price-oracle-agent",
    "version": "1.0.0",
    "description": "Aptos price oracle agent",
    "main": "price-oracle.js",
    "scripts": {
      "start": "node price-oracle.js",
      "test": "echo \\"Error: no test specified\\" && exit 1"
    },
    "dependencies": {
      "aptos": "^1.10.0",
      "move-agent-kit": "^0.5.2",
      "axios": "^1.6.0"
    },
    "keywords": ["aptos", "blockchain", "oracle", "price", "agent"],
    "author": "Aptos PlayLab",
    "license": "MIT"
  }`,
      },
    ],
  };