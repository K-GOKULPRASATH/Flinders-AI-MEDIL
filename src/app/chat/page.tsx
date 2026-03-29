"use client";

import * as React from "react";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-provider";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import {
  Send,
  Loader2,
  Bot,
  User,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Info,
} from "lucide-react";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  guardrailViolations?: Array<{
    type: string;
    severity: "warning" | "blocked";
    message: string;
  }>;
  blocked?: boolean;
}

export default function ChatPage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient && isAuthenticated === false) {
      router.push("/login");
    }
  }, [isAuthenticated, router, isClient]);

  useEffect(() => {
    // Scroll to bottom on new messages
    if (scrollRef.current) {
      const scrollContainer = scrollRef.current.querySelector(
        "[data-radix-scroll-area-viewport]"
      );
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages]);

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    const userMessage: ChatMessage = { role: "user", content: trimmed };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const history = messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed, history }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response");
      }

      const data = await response.json();

      const assistantMessage: ChatMessage = {
        role: "assistant",
        content: data.reply,
        guardrailViolations: data.guardrailViolations,
        blocked: data.blocked,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to send message. Please try again.",
      });
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!isClient || !isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background" />
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="container mx-auto flex flex-1 flex-col px-4 py-4">
        <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-4">
          {/* Disclaimer Banner */}
          <Alert className="border-primary/30 bg-primary/5">
            <Info className="h-4 w-4 text-primary" />
            <AlertDescription className="text-xs text-muted-foreground">
              <strong>MediLexicon Medical Chat</strong> — AI-powered medical
              assistant with safety guardrails. Responses are for informational
              purposes only. Always consult a healthcare professional.
            </AlertDescription>
          </Alert>

          {/* Guardrail Status */}
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className="gap-1 border-green-300 bg-green-50 text-green-700"
            >
              <ShieldCheck className="h-3 w-3" />
              Guardrails Active
            </Badge>
            <Badge variant="outline" className="gap-1 text-xs text-muted-foreground">
              Topic Restriction
            </Badge>
            <Badge variant="outline" className="gap-1 text-xs text-muted-foreground">
              Injection Protection
            </Badge>
            <Badge variant="outline" className="gap-1 text-xs text-muted-foreground">
              PII Detection
            </Badge>
          </div>

          {/* Chat Messages */}
          <Card className="flex flex-1 flex-col overflow-hidden">
            <ScrollArea ref={scrollRef} className="flex-1 p-4" style={{ height: "calc(100vh - 320px)" }}>
              {messages.length === 0 && (
                <div className="flex h-full flex-col items-center justify-center gap-3 py-20 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                    <Bot className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold">
                    MediLexicon Chat Assistant
                  </h3>
                  <p className="max-w-sm text-sm text-muted-foreground">
                    Ask me about medical diagnoses, ICD-11 codes, traditional
                    medicine systems (Ayurveda, Unani, Siddha), symptoms,
                    treatments, and more.
                  </p>
                  <div className="mt-2 flex flex-wrap justify-center gap-2">
                    {[
                      "What are symptoms of diabetes?",
                      "Explain Jwara in Ayurveda",
                      "ICD-11 code for hypertension",
                    ].map((suggestion) => (
                      <Button
                        key={suggestion}
                        variant="outline"
                        size="sm"
                        className="text-xs"
                        onClick={() => {
                          setInput(suggestion);
                          inputRef.current?.focus();
                        }}
                      >
                        {suggestion}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-4">
                {messages.map((msg, i) => (
                  <div key={i}>
                    <div
                      className={`flex items-start gap-3 ${
                        msg.role === "user" ? "flex-row-reverse" : ""
                      }`}
                    >
                      <div
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                          msg.role === "user"
                            ? "bg-primary/20 text-primary"
                            : "bg-secondary text-secondary-foreground"
                        }`}
                      >
                        {msg.role === "user" ? (
                          <User className="h-4 w-4" />
                        ) : (
                          <Bot className="h-4 w-4" />
                        )}
                      </div>
                      <div
                        className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${
                          msg.role === "user"
                            ? "bg-primary text-primary-foreground"
                            : msg.blocked
                            ? "border border-red-200 bg-red-50 text-red-800"
                            : "bg-secondary text-secondary-foreground"
                        }`}
                      >
                        <div className="whitespace-pre-wrap">{msg.content}</div>
                      </div>
                    </div>

                    {/* Guardrail violation badges */}
                    {msg.guardrailViolations &&
                      msg.guardrailViolations.length > 0 && (
                        <div
                          className={`mt-1 flex flex-wrap gap-1 ${
                            msg.role === "user"
                              ? "justify-end pr-11"
                              : "pl-11"
                          }`}
                        >
                          {msg.guardrailViolations.map((v, j) => (
                            <Badge
                              key={j}
                              variant={
                                v.severity === "blocked"
                                  ? "destructive"
                                  : "outline"
                              }
                              className={`gap-1 text-xs ${
                                v.severity === "warning"
                                  ? "border-yellow-400 bg-yellow-50 text-yellow-800"
                                  : ""
                              }`}
                            >
                              {v.severity === "blocked" ? (
                                <ShieldAlert className="h-3 w-3" />
                              ) : (
                                <AlertTriangle className="h-3 w-3" />
                              )}
                              {v.type.replace(/_/g, " ")}
                            </Badge>
                          ))}
                        </div>
                      )}
                  </div>
                ))}

                {isLoading && (
                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
                      <Bot className="h-4 w-4" />
                    </div>
                    <div className="rounded-2xl bg-secondary px-4 py-3">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Thinking...
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Input Area */}
            <div className="border-t bg-card p-4">
              <div className="flex gap-2">
                <Input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask a medical question..."
                  disabled={isLoading}
                  className="flex-1"
                  autoComplete="off"
                />
                <Button
                  onClick={sendMessage}
                  disabled={isLoading || !input.trim()}
                  size="icon"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
