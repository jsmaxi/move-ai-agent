"use client";

import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Copy,
  Download,
  Edit,
  Maximize,
  Minimize,
  Trash,
  FileEdit,
  Share2,
  Bug,
  Check,
  Upload,
  ShieldCheck,
  Play,
  Search,
  ExternalLink,
  CheckCircle,
} from "lucide-react";
import {
  CodeFile,
  copyToClipboard,
  highlightCode,
} from "@/utils/codeHighlight";
import { toast } from "sonner";
import Prism from "prismjs";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-toml";
import "prismjs/themes/prism-tomorrow.css";
import "@/utils/prism-move";

interface CodeDisplayProps {
  files: CodeFile[];
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  defaultExpandedFile?: string;
  onDeleteFile?: (fileName: string) => void;
  onRenameFile?: (oldFileName: string, newFileName: string) => void;
  onEditFile?: (fileName: string, content: string) => void;
  promptType: "contract" | "agent";
  onContractAction?: (
    action: "findBugs" | "compile" | "deploy" | "prove"
  ) => void;
}

type ContractStatus = "none" | "compiled" | "deployed" | "audited" | "proved";

const CodeDisplay: React.FC<CodeDisplayProps> = ({
  files,
  isFullscreen,
  onToggleFullscreen,
  defaultExpandedFile,
  onDeleteFile,
  onRenameFile,
  onEditFile,
  promptType,
  onContractAction,
}) => {
  const [activeTab, setActiveTab] = useState<string>(
    defaultExpandedFile && files.find((f) => f.name === defaultExpandedFile)
      ? defaultExpandedFile
      : files[0]?.name || ""
  );
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState("");
  const [isRenaming, setIsRenaming] = useState(false);
  const [newFileName, setNewFileName] = useState("");
  const [highlightedContent, setHighlightedContent] = useState<
    Record<string, string>
  >({});
  const [contractStatus, setContractStatus] = useState<ContractStatus>("none");

  useEffect(() => {
    if (files.length > 0) {
      const highlighted: Record<string, string> = {};

      files.forEach((file) => {
        highlighted[file.name] = highlightCode(file.content, file.language);
      });

      setHighlightedContent(highlighted);
    }

    setTimeout(() => {
      Prism.highlightAll();
    }, 0);
  }, [files, activeTab]);

  if (files.length === 0) {
    return (
      <div className="glass-card p-6 h-full flex items-center justify-center text-muted-foreground animate-fade-in">
        <p className="text-center">Code will appear here after generating</p>
      </div>
    );
  }

  const activeFile = files.find((file) => file.name === activeTab) || files[0];

  const handleContractAction = (
    action: "findBugs" | "compile" | "deploy" | "prove" | "prove"
  ) => {
    console.log(action);
    if (onContractAction) {
      onContractAction(action);
    }
    if (action === "compile") {
      setContractStatus("compiled");
      toast.success("Contract successfully compiled");
    } else if (action === "deploy") {
      setContractStatus("deployed");
      toast.success("Contract successfully deployed");
    } else if (action === "findBugs") {
      setContractStatus("audited");
      toast.success("Contract successfully audited");
    } else if (action === "prove") {
      setContractStatus("proved");
      toast.success("Contract successfully proved");
    }
  };

  const handleDelete = () => {
    if (!onDeleteFile) return;

    if (confirm(`Are you sure you want to delete ${activeFile.name}?`)) {
      onDeleteFile(activeFile.name);
      toast.success(`Deleted ${activeFile.name}`);
    }
  };

  const handleStartRename = () => {
    setNewFileName(activeFile.name);
    setIsRenaming(true);
  };

  const handleRename = () => {
    if (!onRenameFile || !newFileName.trim()) return;

    onRenameFile(activeFile.name, newFileName);
    setIsRenaming(false);
    toast.success(`Renamed to ${newFileName}`);
  };

  const handleStartEdit = () => {
    setEditContent(activeFile.content);
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    if (!onEditFile) return;

    onEditFile(activeFile.name, editContent);
    setIsEditing(false);
    toast.success(`Updated ${activeFile.name}`);
  };

  const handleShare = async () => {
    try {
      const shareText = `Check out this ${activeFile.language.toUpperCase()} code:\n\n${
        activeFile.content
      }`;

      if (navigator.share) {
        await navigator.share({
          title: activeFile.name,
          text: shareText,
        });
      } else {
        await copyToClipboard(shareText);
        toast.success("Code copied to clipboard for sharing");
      }
    } catch (error) {
      console.error("Error sharing code:", error);
      toast.error("Failed to share code");
    }
  };

  const openInSandbox = () => {
    const filesContent = encodeURIComponent(JSON.stringify(files));
    const packageName =
      promptType === "agent"
        ? "move-agent-kit-sandbox"
        : "aptos-contract-sandbox";
    const url = `https://stackblitz.com/edit/${packageName}?files=${filesContent}`;
    window.open(url, "_blank");
    toast.success("Opening code in Sandbox");
  };

  const getLanguageClass = (language: string) => {
    switch (language) {
      case "move":
        return "language-move";
      case "toml":
        return "language-toml";
      case "javascript":
        return "language-javascript";
      default:
        return "language-plaintext";
    }
  };

  return (
    <div
      className={`glass-card card-pattern p-4 flex flex-col gap-2 animate-fade-in ${
        isFullscreen ? "fixed inset-4 z-50" : "h-full overflow-hidden"
      }`}
    >
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium">Generated Code</h2>
        <div className="flex items-center gap-2">
          {onDeleteFile && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDelete}
              title="Delete file"
            >
              <Trash className="h-4 w-4" />
            </Button>
          )}
          {onRenameFile && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleStartRename}
              title="Rename file"
            >
              <FileEdit className="h-4 w-4" />
            </Button>
          )}
          {onEditFile && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleStartEdit}
              title="Edit file"
            >
              <Edit className="h-4 w-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => copyToClipboard(activeFile.content)}
            title="Copy to clipboard"
          >
            <Copy className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleShare}
            title="Share code"
          >
            <Share2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              const blob = new Blob([activeFile.content], {
                type: "text/plain",
              });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = activeFile.name;
              a.click();
              URL.revokeObjectURL(url);
            }}
            title="Download file"
          >
            <Download className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleFullscreen}
            title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
          >
            {isFullscreen ? (
              <Minimize className="h-4 w-4" />
            ) : (
              <Maximize className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {promptType === "agent" && (
        <div className="mt-1 mb-3">
          <Button
            variant="outline"
            size="sm"
            onClick={openInSandbox}
            title="Open in StackBlitz Sandbox"
            className="w-full justify-center"
          >
            <ExternalLink className="h-4 w-4 mr-1" /> Open in Sandbox
          </Button>
        </div>
      )}

      {promptType === "contract" && (
        <div className="flex flex-col gap-4 mt-1 mb-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Status:</span>
            {contractStatus === "none" ? (
              <span className="text-sm text-muted-foreground">
                Not Compiled
              </span>
            ) : contractStatus === "compiled" ? (
              <span className="text-sm flex items-center gap-1 text-green-600">
                <Check className="h-3.5 w-3.5" /> Compiled
              </span>
            ) : contractStatus === "deployed" ? (
              <span className="text-sm flex items-center gap-1 text-blue-600">
                <Upload className="h-3.5 w-3.5" /> Deployed
              </span>
            ) : contractStatus === "proved" ? (
              <span className="text-sm flex items-center gap-1 text-orange-600">
                <CheckCircle className="h-3.5 w-3.5" /> Proved
              </span>
            ) : (
              <span className="text-sm flex items-center gap-1 text-purple-600">
                <ShieldCheck className="h-3.5 w-3.5" /> Audited
              </span>
            )}
          </div>
        </div>
      )}

      {promptType === "contract" && (
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <Button
            variant="outline"
            size="sm"
            className="text-xs h-7 bg-red-50 text-red-700 hover:bg-red-100 border-red-200"
            onClick={() => handleContractAction("findBugs")}
          >
            <Bug className="h-3.5 w-3.5 mr-1" /> Audit (0.3 APT)
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="text-xs h-7 bg-green-50 text-green-700 hover:bg-green-100 border-green-200"
            onClick={() => handleContractAction("compile")}
          >
            <Play className="h-3.5 w-3.5 mr-1" /> Compile (0.1 APT)
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="text-xs h-7 bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200"
            onClick={() => handleContractAction("deploy")}
          >
            <Upload className="h-3.5 w-3.5 mr-1" /> Deploy (0.2 APT)
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="text-xs h-7 bg-purple-50 text-purple-700 hover:bg-purple-100 border-purple-200"
            onClick={() => handleContractAction("prove")}
          >
            <Search className="h-3.5 w-3.5 mr-1" /> Prove (0.1 APT)
          </Button>
        </div>
      )}

      {isRenaming ? (
        <div className="flex items-center gap-2 mt-2">
          <input
            type="text"
            value={newFileName}
            onChange={(e) => setNewFileName(e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
            autoFocus
          />
          <Button onClick={handleRename}>Save</Button>
          <Button variant="outline" onClick={() => setIsRenaming(false)}>
            Cancel
          </Button>
        </div>
      ) : isEditing ? (
        <div className="flex flex-col gap-2 mt-2">
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="flex h-[300px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background font-mono"
            autoFocus
          />
          <div className="flex items-center gap-2">
            <Button onClick={handleSaveEdit}>Save</Button>
            <Button variant="outline" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full flex-grow overflow-hidden flex flex-col"
        >
          <TabsList className="w-full justify-start overflow-x-auto">
            {files.map((file) => (
              <TabsTrigger key={file.name} value={file.name}>
                {file.name}
              </TabsTrigger>
            ))}
          </TabsList>

          <div className="flex-grow overflow-hidden">
            {files.map((file) => (
              <TabsContent
                key={file.name}
                value={file.name}
                className="mt-2 h-full"
              >
                <div className="relative w-full h-full overflow-auto rounded-md border bg-[#2d2d2d] p-4">
                  <pre className="text-sm font-mono">
                    <code
                      className={getLanguageClass(file.language)}
                      dangerouslySetInnerHTML={{
                        __html: highlightedContent[file.name] || file.content,
                      }}
                    />
                  </pre>
                </div>
              </TabsContent>
            ))}
          </div>
        </Tabs>
      )}
    </div>
  );
};

export default CodeDisplay;
