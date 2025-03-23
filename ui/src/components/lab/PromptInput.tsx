import React, { useState, useRef, ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Beaker, Code, ArrowRight, Upload, X, FileText } from "lucide-react";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ContractTemplate {
  id: string;
  name: string;
  description: string;
}

interface AgentTemplate {
  id: string;
  name: string;
  description: string;
}

const CONTRACT_TEMPLATES: ContractTemplate[] = [
  {
    id: "fungible-token",
    name: "Fungible Token",
    description: "Standard fungible token with transfer capabilities",
  },
  {
    id: "nft",
    name: "NFT Collection",
    description: "Non-fungible token with metadata and minting functions",
  },
  {
    id: "marketplace",
    name: "NFT Marketplace",
    description: "Marketplace for buying and selling NFTs",
  },
  {
    id: "staking",
    name: "Staking Contract",
    description: "Token staking with rewards distribution",
  },
  {
    id: "dao",
    name: "DAO Governance",
    description: "Decentralized governance with proposal and voting",
  },
];

const AGENT_TEMPLATES: AgentTemplate[] = [
  {
    id: "check-balance",
    name: "Check Balance",
    description: "Agent that checks APT balance",
  },
  {
    id: "llm-joule",
    name: "LLM Joule Deposit",
    description: "Agent that deposits APT on Joule",
  },
  {
    id: "custom-tool",
    name: "Custom Tool",
    description: "Agent code for adding custom tool",
  },
  {
    id: "tg-bot",
    name: "Telegram Bot Simple",
    description: "Agent that can interact with Telegram user",
  },
];

interface PromptInputProps {
  onSubmit: (
    prompt: string,
    context: string,
    promptType: "contract" | "agent"
  ) => void;
  isGenerating: boolean;
  onPromptTypeChange: (type: "contract" | "agent") => void;
  onTemplateSelect: (
    templateId: string,
    promptType: "contract" | "agent"
  ) => void;
  promptType: "contract" | "agent";
  prompt: string;
  setPrompt: (prompt: string) => void;
}

const PromptInput: React.FC<PromptInputProps> = ({
  onSubmit,
  isGenerating,
  onPromptTypeChange,
  onTemplateSelect,
  promptType,
  prompt,
  setPrompt,
}) => {
  const [context, setContext] = useState<string>("");
  const [contextFile, setContextFile] = useState<File | null>(null);
  const [showTemplates, setShowTemplates] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePromptTypeChange = (value: string) => {
    const type = value as "contract" | "agent";
    onPromptTypeChange(type);
    setShowTemplates(false); // Hide templates when switching tabs
  };

  const handleSubmit = async () => {
    console.log("Submit prompt");
    if (!prompt.trim()) return;
    await onSubmit(prompt, context, promptType);
  };

  const handleFileSelect = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      setContext(text);
      setContextFile(file);
      toast.success(`File "${file.name}" added as context`);
    } catch (error) {
      console.error("Error reading file:", error);
      toast.error("Failed to read file");
    }
  };

  const handleRemoveFile = () => {
    setContext("");
    setContextFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleTemplateClick = (templateId: string) => {
    onTemplateSelect(templateId, promptType);
    setShowTemplates(false);
    toast.success(`Template "${templateId}" selected`);
  };

  const toggleTemplates = () => {
    setShowTemplates(!showTemplates);
  };

  return (
    <div className="glass-card p-4 flex flex-col gap-4 animate-fade-in">
      <Tabs
        defaultValue="contract"
        value={promptType}
        onValueChange={handlePromptTypeChange}
      >
        <div className="flex flex-col xl:flex-row items-center justify-between mb-2">
          <h2 className="text-lg font-medium">AI Prompt</h2>
          <TabsList>
            <TabsTrigger value="contract" className="flex items-center gap-2">
              <Beaker className="h-4 w-4" />
              <span>Aptos Contract</span>
            </TabsTrigger>
            <TabsTrigger value="agent" className="flex items-center gap-2">
              <Code className="h-4 w-4" />
              <span>Move Agent Kit</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="contract" className="space-y-4 mt-0">
          <div className="space-y-2">
            <Textarea
              placeholder="Describe the smart contract you want to create... (e.g., 'Create a hello world contract')"
              className="min-h-[120px] resize-y max-h-[350px]"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              disabled={isGenerating}
            />
          </div>
        </TabsContent>

        <TabsContent value="agent" className="space-y-4 mt-0">
          <div className="space-y-2">
            <Textarea
              placeholder="Describe the Move Agent you want to create... (e.g., 'Create an agent that transfers token')"
              className="min-h-[120px] resize-y max-h-[350px]"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              disabled={isGenerating}
            />
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex flex-wrap items-center gap-2">
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          onChange={handleFileChange}
          accept=".txt,.move,.toml"
        />

        {contextFile ? (
          <div className="flex items-center gap-2 border rounded-md px-3 py-1.5 bg-muted/50">
            <span className="text-sm truncate max-w-[150px]">
              {contextFile.name}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={handleRemoveFile}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        ) : (
          <Button
            variant="outline"
            size="sm"
            className="text-muted-foreground hover:text-foreground transition-colors"
            onClick={handleFileSelect}
          >
            <Upload className="h-4 w-4 mr-2" />
            <span>Add Context File</span>
          </Button>
        )}

        <Button
          variant="outline"
          size="sm"
          className="text-muted-foreground hover:text-foreground transition-colors"
          onClick={toggleTemplates}
        >
          <FileText className="h-4 w-4 mr-2" />
          <span>Templates</span>
        </Button>

        <div className="flex-grow"></div>

        <Button
          onClick={handleSubmit}
          disabled={isGenerating || !prompt.trim()}
          className="bg-lab-blue hover:bg-lab-blue/90 text-white"
        >
          {isGenerating ? (
            <>Generating...</>
          ) : (
            <>
              <ArrowRight className="h-4 w-4 mr-2" />
              <span>Generate</span>
            </>
          )}
        </Button>
      </div>

      {showTemplates && (
        <div className="mt-2 border rounded-md overflow-hidden">
          <div className="bg-muted/50 p-2 border-b">
            <h3 className="text-sm font-medium">
              {promptType === "contract"
                ? "Contract Templates"
                : "Agent Templates"}
            </h3>
          </div>
          <ScrollArea className="h-48">
            <div className="p-2 space-y-1">
              {promptType === "contract"
                ? CONTRACT_TEMPLATES.map((template) => (
                    <div
                      key={template.id}
                      className="p-2 hover:bg-muted/70 rounded cursor-pointer"
                      onClick={() => handleTemplateClick(template.id)}
                    >
                      <div className="font-medium text-sm">{template.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {template.description}
                      </div>
                    </div>
                  ))
                : AGENT_TEMPLATES.map((template) => (
                    <div
                      key={template.id}
                      className="p-2 hover:bg-muted/70 rounded cursor-pointer"
                      onClick={() => handleTemplateClick(template.id)}
                    >
                      <div className="font-medium text-sm">{template.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {template.description}
                      </div>
                    </div>
                  ))}
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  );
};

export default PromptInput;
