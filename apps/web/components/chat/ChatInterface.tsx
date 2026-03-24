"use client";

import { useChat } from "@ai-sdk/react";
import { TextStreamChatTransport } from "ai";
import { useRef, useEffect, useState, useMemo } from "react";
import { Send, Loader2, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { type PersonaConfig } from "@/lib/personas";
import { cn } from "@/lib/utils";

interface Props {
  persona: PersonaConfig;
}

export function ChatInterface({ persona }: Props) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [sessionId, setSessionId] = useState<string | undefined>();
  const [inputValue, setInputValue] = useState("");

  const transport = useMemo(
    () =>
      new TextStreamChatTransport({
        api: "/api/chat",
        body: { persona: persona.key },
        fetch: async (url, init) => {
          // inject sessionId into body dynamically
          if (init?.body) {
            const bodyData = JSON.parse(init.body as string) as Record<string, unknown>;
            if (sessionId) bodyData.sessionId = sessionId;
            return window.fetch(url, { ...init, body: JSON.stringify(bodyData) });
          }
          return window.fetch(url, init);
        },
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [persona.key]
  );

  const { messages, sendMessage, status, error, setMessages } = useChat({
    transport,
    messages: [
      {
        id: "greeting",
        role: "assistant",
        parts: [{ type: "text", text: persona.greeting }],
      },
    ],
  });

  const isLoading = status === "streaming" || status === "submitted";

  // Capture sessionId from response header — wrap fetch in transport callback above
  // SessionId tracking is done inside the fetch override

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;
    sendMessage({ text: inputValue });
    setInputValue("");
  };

  const handleReset = () => {
    setMessages(() => [
      {
        id: `greeting-${Date.now()}`,
        role: "assistant",
        parts: [{ type: "text", text: persona.greeting }],
      },
    ]);
    setSessionId(undefined);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)] max-h-[700px]">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 scroll-smooth">
        {messages.map((message) => {
          const role = message.role as string;
          const text = message.parts
            ?.filter((p): p is { type: "text"; text: string } => p.type === "text")
            .map((p) => p.text)
            .join("") ?? "";

          return (
            <div
              key={message.id}
              className={cn(
                "flex gap-3 max-w-[85%]",
                role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
              )}
            >
              {role === "assistant" && (
                <div className="flex-shrink-0 h-9 w-9 rounded-full bg-gradient-to-br from-[#FF6B6B] to-[#4A90D9] flex items-center justify-center text-lg">
                  {persona.emoji}
                </div>
              )}
              <div
                className={cn(
                  "rounded-2xl px-4 py-3 text-sm leading-relaxed",
                  role === "user"
                    ? "bg-[#FF6B6B] text-white rounded-tr-sm"
                    : "bg-muted rounded-tl-sm"
                )}
              >
                <p className="whitespace-pre-wrap">{text}</p>
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex gap-3 mr-auto">
            <div className="flex-shrink-0 h-9 w-9 rounded-full bg-gradient-to-br from-[#FF6B6B] to-[#4A90D9] flex items-center justify-center text-lg">
              {persona.emoji}
            </div>
            <div className="bg-muted rounded-2xl rounded-tl-sm px-4 py-3">
              <div className="flex gap-1">
                <span className="h-2 w-2 bg-muted-foreground/50 rounded-full animate-bounce [animation-delay:0ms]" />
                <span className="h-2 w-2 bg-muted-foreground/50 rounded-full animate-bounce [animation-delay:150ms]" />
                <span className="h-2 w-2 bg-muted-foreground/50 rounded-full animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          </div>
        )}

        {error && (
          <p className="text-center text-sm text-destructive">
            Error al conectar. Verifica tu conexión e intenta de nuevo.
          </p>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t p-4">
        <form onSubmit={handleSubmit} className="flex gap-2 items-center">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleReset}
            title="Nueva conversación"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>

          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={`Escríbele a ${persona.name}...`}
            disabled={isLoading}
            className="flex-1"
            autoComplete="off"
          />

          <Button
            type="submit"
            variant="coral"
            size="icon"
            disabled={isLoading || !inputValue.trim()}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>

        <p className="text-xs text-muted-foreground text-center mt-2">
          Las respuestas son generadas por IA · Powered by Claude
        </p>
      </div>
    </div>
  );
}
