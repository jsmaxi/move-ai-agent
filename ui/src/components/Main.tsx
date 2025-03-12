import { useState, useEffect } from "react";
import MainLayout from "@/components/layout/MainLayout";
import PromptInput from "@/components/lab/PromptInput";
import CodeDisplay from "@/components/lab/CodeDisplay";
import Terminal, { LogEntry } from "@/components/lab/Terminal";
import { CodeFile } from "@/utils/codeHighlight";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";
import RAGBotDialog from "@/components/lab/RAGBotDialog";
import { HistoryItem } from "@/types/history";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Github } from "lucide-react";

const CONTRACT_TEMPLATES: Record<string, CodeFile[]> = {
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

const AGENT_TEMPLATES: Record<string, CodeFile[]> = {
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

const DEMO_CONTRACT_FILES: CodeFile[] = CONTRACT_TEMPLATES["fungible-token"];
const DEMO_AGENT_FILES: CodeFile[] = AGENT_TEMPLATES["transfer-monitor"];

const Index = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [generatedFiles, setGeneratedFiles] = useState<CodeFile[]>([]);
  const [isCodeFullscreen, setIsCodeFullscreen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [promptType, setPromptType] = useState<"contract" | "agent">(
    "contract"
  );
  const [isRagBotOpen, setIsRagBotOpen] = useState(false);

  useEffect(() => {
    setGeneratedFiles(
      promptType === "contract" ? DEMO_CONTRACT_FILES : DEMO_AGENT_FILES
    );

    if (logs.length === 0) {
      addLog(
        `Ready to generate ${
          promptType === "contract" ? "Aptos smart contract" : "Move Agent Kit"
        } code...`,
        "info"
      );
    }
  }, [promptType]);

  const addLog = (message: string, type: LogEntry["type"] = "info") => {
    const newLog: LogEntry = {
      id: uuidv4(),
      timestamp: new Date(),
      message,
      type,
    };
    setLogs((prevLogs) => [...prevLogs, newLog]);
  };

  const clearLogs = () => {
    setLogs([]);
    addLog(
      `Ready to generate ${
        promptType === "contract" ? "Aptos smart contract" : "Move Agent Kit"
      } code...`,
      "info"
    );
  };

  const handleDeleteFile = (fileName: string) => {
    setGeneratedFiles((files) =>
      files.filter((file) => file.name !== fileName)
    );
    addLog(`Deleted file: ${fileName}`, "info");
  };

  const handleRenameFile = (oldFileName: string, newFileName: string) => {
    setGeneratedFiles((files) =>
      files.map((file) =>
        file.name === oldFileName ? { ...file, name: newFileName } : file
      )
    );
    addLog(`Renamed file: ${oldFileName} to ${newFileName}`, "info");
  };

  const handleEditFile = (fileName: string, content: string) => {
    setGeneratedFiles((files) =>
      files.map((file) =>
        file.name === fileName ? { ...file, content } : file
      )
    );
    addLog(`Edited file: ${fileName}`, "info");
  };

  const handlePromptTypeChange = (type: "contract" | "agent") => {
    setPromptType(type);
    addLog(
      `Switched to ${
        type === "contract" ? "Aptos smart contract" : "Move Agent Kit"
      } generation`,
      "info"
    );
  };

  const handleContractAction = (
    action: "findBugs" | "compile" | "deploy" | "prove"
  ) => {
    const actionCosts = {
      findBugs: 0.3,
      compile: 0.1,
      deploy: 0.2,
      prove: 0.1,
    };

    const cost = actionCosts[action];
    const actionName = action.charAt(0).toUpperCase() + action.slice(1);

    addLog(`Performing ${actionName} action...`, "info");

    setTimeout(() => {
      addLog(
        `${actionName} completed successfully. Cost: ${cost} APT`,
        "success"
      );

      if (action === "findBugs") {
        addLog("No critical bugs found in the contract", "success");
        addLog(
          "Security check: All validations are properly implemented",
          "info"
        );
      } else if (action === "compile") {
        addLog("Contract successfully compiled", "success");
        addLog("Bytecode size: 2.4KB", "info");
      } else if (action === "deploy") {
        addLog(
          "Contract deployed to testnet address: 0x1a2b3c4d5e6f...",
          "success"
        );
        addLog("Transaction hash: 0xabcdef1234567890...", "info");
      } else if (action === "prove") {
        addLog("Formal verification successful", "success");
        addLog("All assertions proved correctly", "info");
      }
    }, 1500);
  };

  const handleTemplateSelect = (
    templateId: string,
    type: "contract" | "agent"
  ) => {
    if (type === "contract") {
      const template = CONTRACT_TEMPLATES[templateId];
      if (template) {
        setGeneratedFiles(template);
        addLog(`Loaded contract template: ${templateId}`, "success");
      }
    } else {
      const template = AGENT_TEMPLATES[templateId];
      if (template) {
        setGeneratedFiles(template);
        addLog(`Loaded agent template: ${templateId}`, "success");
      }
    }
  };

  const handlePromptSubmit = async (
    prompt: string,
    context: string,
    type: "contract" | "agent"
  ) => {
    setIsGenerating(true);
    setPromptType(type);

    addLog(
      `Generating ${
        type === "contract" ? "Aptos smart contract" : "Move Agent Kit"
      } code...`,
      "info"
    );

    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));

      if (type === "contract") {
        const templateIds = Object.keys(CONTRACT_TEMPLATES);
        const randomTemplateId =
          templateIds[Math.floor(Math.random() * templateIds.length)];
        setGeneratedFiles(CONTRACT_TEMPLATES[randomTemplateId]);
        addLog("Generated Aptos contract code", "success");
        addLog(`Contract type: ${randomTemplateId}`, "info");
      } else {
        const templateIds = Object.keys(AGENT_TEMPLATES);
        const randomTemplateId =
          templateIds[Math.floor(Math.random() * templateIds.length)];
        setGeneratedFiles(AGENT_TEMPLATES[randomTemplateId]);
        addLog("Generated Move Agent Kit code", "success");
        addLog(`Agent type: ${randomTemplateId}`, "info");
      }

      toast.success("Code generated successfully");
    } catch (error) {
      console.error("Error generating code:", error);
      addLog("Failed to generate code", "error");
      toast.error("Failed to generate code");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleHistoryItemClick = (item: HistoryItem) => {
    setPromptType(item.type);

    const templates =
      item.type === "contract" ? CONTRACT_TEMPLATES : AGENT_TEMPLATES;

    const templateIds = Object.keys(templates);
    if (templateIds.length > 0) {
      const firstTemplate = templates[templateIds[0]];
      setGeneratedFiles(firstTemplate);
    }

    addLog(`Loaded ${item.type} prompt: ${item.prompt}`, "info");
  };

  return (
    <MainLayout onHistoryItemClick={handleHistoryItemClick}>
      <div className="space-y-6">
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <PromptInput
            onSubmit={handlePromptSubmit}
            isGenerating={isGenerating}
            onPromptTypeChange={handlePromptTypeChange}
            onTemplateSelect={handleTemplateSelect}
          />

          <div className="h-[500px]">
            <CodeDisplay
              files={generatedFiles}
              defaultExpandedFile={
                promptType === "agent" ? "agent.js" : "token.move"
              }
              isFullscreen={isCodeFullscreen}
              onToggleFullscreen={() => setIsCodeFullscreen(!isCodeFullscreen)}
              onDeleteFile={handleDeleteFile}
              onRenameFile={handleRenameFile}
              onEditFile={handleEditFile}
              promptType={promptType}
              onContractAction={handleContractAction}
            />
          </div>
        </section>

        <section className="w-1/2">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-medium">Logs</h2>
          </div>
          <Terminal logs={logs} onClear={clearLogs} />
        </section>

        <section className="flex justify-center gap-4 mt-8">
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              window.open(
                "https://github.com/jsmaxi/move-ai-agent/issues/new",
                "_blank"
              )
            }
          >
            <Github className="mr-2 h-4 w-4" /> Report an Issue
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              window.open("https://github.com/jsmaxi/move-ai-agent", "_blank")
            }
          >
            <Github className="mr-2 h-4 w-4" /> Explore Codebase
          </Button>
        </section>

        <footer className="mt-8 space-y-4 text-center">
          <div className="p-4 rounded-lg border border-yellow-200 text-yellow-800 text-sm flex items-center justify-center gap-2">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            <span>
              <strong>Disclaimer:</strong> This is experimental software. Please
              consult with blockchain security professionals before deploying
              any code to mainnet or using it with real funds.
            </span>
          </div>
          <div className="text-sm text-muted-foreground py-4">
            2025 Aptos PlayLab © All Rights Reserved
          </div>
        </footer>
      </div>

      <RAGBotDialog open={isRagBotOpen} onOpenChange={setIsRagBotOpen} />
    </MainLayout>
  );
};

export default Index;
