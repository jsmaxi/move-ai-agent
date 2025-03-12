import React, { useState, useRef, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bot, Send, Loader2, BrainCircuit } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";

interface RAGBotDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface Message {
  sender: "user" | "bot";
  text: string;
}

const RAGBotDialog: React.FC<RAGBotDialogProps> = ({ open, onOpenChange }) => {
  const [promptType, setPromptType] = useState<"aptos" | "move-agent">("aptos");
  const [prompt, setPrompt] = useState("");
  const [aptosMessages, setAptosMessages] = useState<Message[]>([]);
  const [moveAgentMessages, setMoveAgentMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const aptosScrollAreaRef = useRef<HTMLDivElement>(null);
  const moveAgentScrollAreaRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const messages = promptType === "aptos" ? aptosMessages : moveAgentMessages;
  const setMessages =
    promptType === "aptos" ? setAptosMessages : setMoveAgentMessages;
  const currentScrollRef =
    promptType === "aptos" ? aptosScrollAreaRef : moveAgentScrollAreaRef;

  useEffect(() => {
    if (currentScrollRef.current) {
      const scrollContainer = currentScrollRef.current.querySelector(
        "[data-radix-scroll-area-viewport]"
      );
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages, currentScrollRef]);

  useEffect(() => {
    if (!isLoading && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isLoading]);

  const handleSubmit = () => {
    if (!prompt.trim() || isLoading) return;

    setMessages((prev) => [...prev, { sender: "user", text: prompt }]);

    setIsLoading(true);

    setTimeout(() => {
      let botResponse = "";

      if (promptType === "aptos") {
        if (prompt.toLowerCase().includes("what is aptos")) {
          botResponse =
            "Aptos is a Layer 1 blockchain that was created by former Meta (Facebook) employees who worked on the Diem blockchain project. It uses the Move programming language and offers high throughput and low latency transactions.";
        } else if (prompt.toLowerCase().includes("move language")) {
          botResponse =
            "Move is a programming language initially developed at Facebook for the Libra blockchain. It's designed with safety and security as primary goals, and provides resource types with semantics inspired by linear logic, which means that resources can be moved but not copied.";
        } else {
          botResponse = `Based on the Aptos documentation, ${prompt} relates to the Aptos blockchain's architecture which provides high throughput, low latency, and a secure execution environment using the Move language.`;
        }
      } else {
        if (prompt.toLowerCase().includes("what is move agent kit")) {
          botResponse =
            "Move Agent Kit is a framework for building autonomous agents that can interact with Move-based blockchains like Aptos and Sui. It allows developers to create bots that can monitor, analyze, and respond to on-chain events.";
        } else if (prompt.toLowerCase().includes("how to monitor")) {
          botResponse =
            'To monitor events with Move Agent Kit, you can use the agent.on() method to subscribe to specific events. For example: agent.on("tokenTransfer", (event) => { /* handle event */ });';
        } else {
          botResponse = `The Move Agent Kit documentation says that for "${prompt}", you would typically implement an agent that listens to specific events and then executes logic in response to those events.`;
        }
      }

      setMessages((prev) => [...prev, { sender: "bot", text: botResponse }]);
      setIsLoading(false);
      setPrompt("");
    }, 1500);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] tech-card border-lab-border p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-lab-gradient text-white">
              <BrainCircuit className="h-4 w-4" />
            </div>
            <span>Documentation Assistant</span>
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Ask questions about Aptos or Move Agent Kit documentation
          </DialogDescription>
        </DialogHeader>

        <Tabs
          defaultValue="aptos"
          value={promptType}
          onValueChange={(value) =>
            setPromptType(value as "aptos" | "move-agent")
          }
          className="w-full px-6"
        >
          <TabsList className="w-full grid grid-cols-2 mb-2">
            <TabsTrigger value="aptos" className="rounded-l-md">
              <span className="font-medium">Aptos Docs</span>
            </TabsTrigger>
            <TabsTrigger value="move-agent" className="rounded-r-md">
              <span className="font-medium">Move Agent Kit</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="aptos" className="mt-2 pb-2">
            <ScrollArea
              ref={aptosScrollAreaRef}
              className="h-[300px] border border-lab-border rounded-md p-4 bg-white/40 backdrop-blur-sm"
            >
              {aptosMessages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground space-y-2">
                  <Bot className="h-8 w-8 text-muted-foreground/50" />
                  <p>Start chatting with the Aptos documentation assistant</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {aptosMessages.map((message, index) => (
                    <div
                      key={index}
                      className={`flex ${
                        message.sender === "user"
                          ? "justify-end"
                          : "justify-start"
                      } animate-fade-in-up`}
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      <div
                        className={`max-w-[80%] p-3 rounded-xl shadow-sm ${
                          message.sender === "user"
                            ? "bg-lab-gradient text-white"
                            : "bg-white border border-lab-border"
                        }`}
                      >
                        {message.text}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="move-agent" className="mt-2 pb-2">
            <ScrollArea
              ref={moveAgentScrollAreaRef}
              className="h-[300px] border border-lab-border rounded-md p-4 bg-white/40 backdrop-blur-sm"
            >
              {moveAgentMessages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground space-y-2">
                  <Bot className="h-8 w-8 text-muted-foreground/50" />
                  <p>
                    Start chatting with the Move Agent Kit documentation
                    assistant
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {moveAgentMessages.map((message, index) => (
                    <div
                      key={index}
                      className={`flex ${
                        message.sender === "user"
                          ? "justify-end"
                          : "justify-start"
                      } animate-fade-in-up`}
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      <div
                        className={`max-w-[80%] p-3 rounded-xl shadow-sm ${
                          message.sender === "user"
                            ? "bg-lab-gradient text-white"
                            : "bg-white border border-lab-border"
                        }`}
                      >
                        {message.text}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>

        <div className="flex relative px-6 pb-6 pt-2">
          <div className="w-full relative">
            <Textarea
              ref={textareaRef}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={`Ask about ${
                promptType === "aptos" ? "Aptos" : "Move Agent Kit"
              } documentation...`}
              className="resize-none pr-12 border-lab-border bg-white/40 placeholder:text-muted-foreground/70 focus-visible:ring-lab-blue/30"
              disabled={isLoading}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
            />
            <Button
              size="sm"
              onClick={handleSubmit}
              disabled={isLoading || !prompt.trim()}
              className="absolute bottom-2 right-2 bg-lab-gradient hover:bg-lab-gradient hover:opacity-90 transition-opacity"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RAGBotDialog;
