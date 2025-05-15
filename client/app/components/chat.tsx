"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import * as React from "react";
import { Send, Bot, Download, Loader2 } from "lucide-react";
import { ScrollArea } from "../../components/ui/scroll-area";
import { useUser } from "@clerk/nextjs";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import ReactMarkdown from "react-markdown";

interface Doc {
  pageContent?: string;
  metadata?: {
    loc?: {
      pageNumber?: number;
    };
    source?: string;
    filename?: string;
  };
}

interface IMessage {
  role: "assistant" | "user";
  content?: string;
  documents?: Doc[];
}

const ChatComponent: React.FC = () => {
  const [message, setMessage] = React.useState<string>("");
  const [messages, setMessages] = React.useState<IMessage[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const { user } = useUser();
  const [uploadedPDFs, setUploadedPDFs] = React.useState<
    {
      name: string;
      storedFilename: string;
      timestamp: string;
      status: "success" | "error";
    }[]
  >([]);

  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  React.useEffect(() => {
    const stored = localStorage.getItem("uploadedPDFs");
    if (stored) {
      setUploadedPDFs(JSON.parse(stored));
    }
  }, []);

  const handleSendChatMessage = async () => {
    if (!message.trim()) return;

    setIsLoading(true);
    setMessages((prev) => [...prev, { role: "user", content: message }]);
    setMessage("");

    try {
      const res = await fetch(
        `http://localhost:8000/chat?message=${encodeURIComponent(message)}`
      );
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data?.message,
          documents: data?.docs,
        },
      ]);
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendChatMessage();
    }
  };

  const handleDownload = async (source: string, filename: string) => {
    const pdf = uploadedPDFs.find(
      (pdf) => pdf.name === filename || pdf.storedFilename === source
    );
    const storedFilename = pdf?.storedFilename || source;
    try {
      const response = await fetch(
        `http://localhost:8000/download/${encodeURIComponent(storedFilename)}`
      );
      if (!response.ok) throw new Error("Download failed");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename || "document.pdf";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error downloading file:", error);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] bg-slate-900 rounded-lg border border-slate-700 shadow-xl">
      <ScrollArea ref={scrollRef} className="flex-1 p-4">
        <div className="space-y-6 max-w-4xl mx-auto">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-[60vh] text-slate-400">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 blur-2xl rounded-full" />
                <Bot className="relative h-16 w-16 mb-6 text-blue-400" />
              </div>
              <h2 className="text-2xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
                Welcome to PDF Chat!
              </h2>
              <p className="text-center max-w-md text-slate-400 text-lg">
                Upload a PDF and start asking questions about its content. I'll
                help you understand and analyze the document.
              </p>
            </div>
          )}

          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex gap-3 ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {message.role === "assistant" && (
                <Avatar className="h-8 w-8 ring-2 ring-blue-500/20">
                  <div className="bg-gradient-to-br from-blue-500 to-purple-600 h-full w-full flex items-center justify-center">
                    <Bot className="h-5 w-5 text-white" />
                  </div>
                </Avatar>
              )}
              <div
                className={`max-w-[80%] rounded-2xl p-4 ${
                  message.role === "user"
                    ? "bg-gradient-to-br from-blue-600 to-blue-700 text-white"
                    : "bg-slate-800/80 backdrop-blur-sm text-slate-200 border border-slate-700/50"
                } shadow-lg`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-semibold">
                    {message.role === "user" ? "You" : "AI Assistant"}
                  </span>
                </div>
                <div className="prose dark:prose-invert max-w-none">
                  <ReactMarkdown>{message.content || ""}</ReactMarkdown>
                </div>

                {message.documents && message.documents.length > 0 && (
                  <Card className="mt-4 bg-slate-900/50 backdrop-blur-sm border border-slate-700/50">
                    <div className="p-4">
                      <h4 className="font-semibold mb-3 text-white flex items-center gap-2">
                        <span className="text-sm bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-400 px-3 py-1 rounded-full border border-blue-500/20">
                          References
                        </span>
                      </h4>
                      <div className="space-y-3">
                        {message.documents.map((doc, docIndex) => (
                          <div
                            key={docIndex}
                            className="bg-slate-800/50 p-4 rounded-xl text-sm border border-slate-700/50 hover:border-blue-500/20 transition-colors"
                          >
                            <div className="flex justify-between items-start mb-2">
                              <p className="text-blue-400 text-xs font-medium">
                                Page {doc.metadata?.loc?.pageNumber}
                              </p>
                            </div>
                            <p className="text-slate-200 leading-relaxed">
                              {doc.pageContent}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </Card>
                )}
              </div>
              {message.role === "user" && (
                <Avatar className="h-8 w-8 ring-2 ring-blue-500/20">
                  {user?.imageUrl ? (
                    <AvatarImage
                      src={user.imageUrl}
                      alt={user.fullName || "User"}
                    />
                  ) : (
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                      {user?.fullName?.charAt(0) || "U"}
                    </AvatarFallback>
                  )}
                </Avatar>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3 justify-start">
              <Avatar className="h-8 w-8 ring-2 ring-blue-500/20">
                <div className="bg-gradient-to-br from-blue-500 to-purple-600 h-full w-full flex items-center justify-center">
                  <Bot className="h-5 w-5 text-white" />
                </div>
              </Avatar>
              <div className="max-w-[80%] rounded-2xl p-4 bg-slate-800/80 backdrop-blur-sm border border-slate-700/50 shadow-lg">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-semibold text-white">AI Assistant</span>
                </div>
                <div className="flex items-center gap-2 text-blue-400">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <p>Analyzing your documents...</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
      <div className="p-4 border-t border-slate-700 bg-slate-900/95 backdrop-blur supports-[backdrop-filter]:bg-slate-900/60">
        <div className="max-w-4xl mx-auto">
          <div className="flex gap-2">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask a question about your PDF..."
              disabled={isLoading}
              className="flex-1 bg-slate-800/80 border-slate-700/50 text-white placeholder:text-slate-400 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all"
            />
            <Button
              onClick={handleSendChatMessage}
              disabled={!message.trim() || isLoading}
              size="icon"
              className="bg-gradient-to-br from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-xl transition-all"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatComponent;
