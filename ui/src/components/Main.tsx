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
import { AlertTriangle, Github, BugIcon } from "lucide-react";
import { AGENT_TEMPLATES, CONTRACT_TEMPLATES } from "@/lib/templates";
import { GeneratedCode, GeneratedKit } from "@/types/generatedCode";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { pkg } from "@/types/pkg";

// const DEMO_CONTRACT_FILES: CodeFile[] = CONTRACT_TEMPLATES["fungible-token"];
// const DEMO_AGENT_FILES: CodeFile[] = AGENT_TEMPLATES["transfer-monitor"];

const Index = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [generatedFiles, setGeneratedFiles] = useState<CodeFile[]>([]);
  const [isCodeFullscreen, setIsCodeFullscreen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRagBotOpen, setIsRagBotOpen] = useState(false);
  const [isActionInProgress, setIsActionInProgress] = useState(false);
  const [balance, setBalance] = useState<number>(10); // Initial balance for testing
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [prompt, setPrompt] = useState<string>("");
  const [promptType, setPromptType] = useState<"contract" | "agent">(
    "contract"
  );

  const { connected } = useWallet();

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
    console.log("Clearing logs...");
    setLogs([]);
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

  const handleContractAction = async (
    action: "findBugs" | "compile" | "deploy" | "prove"
  ) => {
    if (!connected) {
      alert("Please connect your Aptos wallet first!");
      return;
    }

    const actionCosts = {
      findBugs: 0.3,
      compile: 0.1,
      deploy: 0.2,
      prove: 0.1,
    };

    const cost = actionCosts[action];
    const actionName = action.charAt(0).toUpperCase() + action.slice(1);

    addLog(
      `Performing ${
        actionName === "FindBugs" ? "Audit" : actionName
      } action...`,
      "info"
    );

    try {
      setIsActionInProgress(true);
      if (action === "findBugs") {
        const moveCode = generatedFiles[0]?.content;
        const tomlManifest = generatedFiles[1]?.content;

        const response = await fetch("/api/audit", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ moveCode, tomlManifest }),
        });

        const data = await response.json();

        if (response.ok) {
          console.log("audited");
          console.log(data.output);
          addLog(data.output, "warning");
          addLog("Audit executed", "success");
          setBalance(balance - cost);
        } else {
          console.log("Error:", data.message);
          addLog(data.message, "error");
          addLog(data.error, "error");
          toast.error("An error occurred! Please check console for details.");
        }
      } else if (action === "compile") {
        const moveCode = generatedFiles[0]?.content;
        const tomlManifest = generatedFiles[1]?.content;

        const response = await fetch("/api/compile", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ moveCode, tomlManifest }),
        });

        const data = await response.json();

        if (response.ok) {
          console.log("compiled");
          console.log(data.output);
          addLog(data.output, "warning");
          addLog("Compile executed", "success");
          setBalance(balance - cost);
        } else {
          console.log("Error:", data.message);
          addLog(data.message, "error");
          addLog(data.error, "error");
          toast.error("An error occurred! Please check console for details.");
        }
      } else if (action === "deploy") {
        const moveCode = generatedFiles[0]?.content;
        const tomlManifest = generatedFiles[1]?.content;

        const response = await fetch("/api/deploy", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ moveCode, tomlManifest }),
        });

        const data = await response.json();

        if (response.ok) {
          console.log("deploy");
          console.log(data.output);
          addLog(data.output, "warning");
          addLog("Deploy executed", "success");
          setBalance(balance - cost);
        } else {
          console.log("Error:", data.message);
          addLog(data.message, "error");
          addLog(data.error, "error");
          toast.error("An error occurred! Please check console for details.");
        }
      } else if (action === "prove") {
        const moveCode = generatedFiles[0]?.content;
        const tomlManifest = generatedFiles[1]?.content;

        const response = await fetch("/api/prove", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ moveCode, tomlManifest }),
        });

        const data = await response.json();

        if (response.ok) {
          console.log("proved");
          console.log(data.output);
          addLog(data.output, "info");
          addLog("Prove executed", "success");
          setBalance(balance - cost);
        } else {
          console.log("Error:", data.message);
          addLog(data.message, "error");
          addLog(data.error, "error");
          toast.error("An error occurred! Please check console for details.");
        }
      }
    } finally {
      setIsActionInProgress(false);
    }
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

    const item: HistoryItem = {
      id: uuidv4(),
      timestamp: new Date(),
      prompt: prompt,
      type: type,
    };

    setHistoryItems([...historyItems, item]);

    try {
      if (type === "contract") {
        const query = prompt;
        const ctx = context;

        const response = await fetch("/api/_aptos", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ query, ctx }),
        });

        const data = await response.json();

        if (response.ok) {
          console.log("response ok");
          const code = data.output;
          console.log(JSON.stringify(code));

          console.log("parsing...");
          const parsedData: GeneratedCode = JSON.parse(code);
          console.log("parsed");
          console.log(parsedData);

          const contractFile: CodeFile = {
            name: "contract.move",
            language: "move",
            content: parsedData?.contract,
          };

          const manifestFile: CodeFile = {
            name: "Move.toml",
            language: "toml",
            content: parsedData?.manifest,
          };

          console.log("generated");
          setGeneratedFiles([contractFile, manifestFile]);
          addLog("Generated Aptos smart contract code", "success");
        } else {
          console.log("Error:", data.message);
          addLog(data?.message, "error");
          addLog(data?.error, "error");
          toast.error("An error occurred! Please check console for details.");
        }
      } else {
        const query = prompt;
        const ctx = context;

        const response = await fetch("/api/gencode_agent", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ query, ctx }),
        });

        const data = await response.json();

        if (response.ok) {
          console.log("response ok");
          const code = data.output;
          console.log(JSON.stringify(code));

          console.log("parsing...");
          const parsedData: GeneratedKit = JSON.parse(code);
          console.log("parsed");
          console.log(parsedData);

          const kitFile: CodeFile = {
            name: "agent.ts",
            language: "typescript",
            content: parsedData?.agent,
          };

          const pkgFile: CodeFile = pkg;

          console.log("generated");
          setGeneratedFiles([kitFile, pkgFile]);
          addLog("Generated Move Agent Kit code", "success");
        } else {
          console.log("Error:", data.message);
          addLog(data?.message, "error");
          addLog(data?.error, "error");
          toast.error("An error occurred! Please check console for details.");
        }
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
    setPrompt(item.prompt);

    // const templates =
    //   item.type === "contract" ? CONTRACT_TEMPLATES : AGENT_TEMPLATES;

    // const templateIds = Object.keys(templates);
    // if (templateIds.length > 0) {
    //   const firstTemplate = templates[templateIds[0]];
    //   setGeneratedFiles(firstTemplate);
    // }

    addLog(`Loaded ${item.type} prompt: ${item.prompt}`, "info");
  };

  return (
    <MainLayout
      onHistoryItemClick={handleHistoryItemClick}
      historyItems={historyItems}
      balance={balance}
    >
      <div className="space-y-6">
        <section className="grid grid-cols-1 lg:grid-cols-5 gap-4 auto-rows-auto">
          <div className="h-auto lg:col-span-2">
            <PromptInput
              onSubmit={handlePromptSubmit}
              isGenerating={isGenerating}
              onPromptTypeChange={handlePromptTypeChange}
              onTemplateSelect={handleTemplateSelect}
              promptType={promptType}
              prompt={prompt}
              setPrompt={setPrompt}
            />
            <br></br>
            <section>
              <Terminal logs={logs} onClear={clearLogs} />
            </section>
          </div>

          <div className="min-h-[300px] h-auto lg:col-span-3">
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
              isActionInProgress={isActionInProgress}
            />
          </div>
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
            <BugIcon className="mr-2 h-4 w-4" /> Report an Issue
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
          <div className="p-4 rounded-lg border text-sm flex items-center justify-center gap-2">
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
