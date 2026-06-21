"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  Bot,
  Loader2,
  Send,
  Sparkles,
  User as UserIcon,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { haptics } from "@/components/mobile/haptics-vibrator";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { askAIAssistantAction } from "../actions";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export function AIAssistant() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hello! I am your BHW PAS Assistant. Ask me anything about forums categories, VIP premium downloads, or listing improvements.",
    },
  ]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || loading) return;

    const userText = query.trim();
    setQuery("");
    haptics.tap();

    setMessages((prev) => [...prev, { role: "user", content: userText }]);
    setLoading(true);

    const res = await askAIAssistantAction(userText);
    setLoading(false);

    if (res.success && res.answer) {
      haptics.notification();
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: res.answer! },
      ]);
    } else {
      haptics.error();
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `Error: ${res.error || "Failed to communicate with assistant"}`,
        },
      ]);
    }
  };

  const starterPrompts = [
    "What are VIP Membership perks?",
    "How to get started with SEO threads?",
    "Suggest tips to optimize my seller listing",
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)] md:h-[600px] border rounded-2xl bg-card/65 backdrop-blur-xl shadow-xl overflow-hidden relative before:absolute before:inset-0 before:p-[1px] before:bg-gradient-to-br before:from-premium/15 before:to-transparent before:pointer-events-none">
      {/* Assistant Header */}
      <div className="flex items-center justify-between border-b px-5 py-4 bg-muted/10 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-premium/10 text-premium">
            <Sparkles className="h-5 w-5 animate-pulse-glow" />
          </div>
          <div>
            <h2 className="font-bold text-sm text-foreground flex items-center gap-1.5 leading-none">
              BHW Intelligence
            </h2>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              Instant assistant & VIP insights
            </p>
          </div>
        </div>
      </div>

      {/* Message Stream */}
      <div className="flex-1 overflow-y-auto px-5 py-6 space-y-4 scrollbar-thin">
        <AnimatePresence mode="popLayout">
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.2 }}
              className={cn(
                "flex gap-3 max-w-[85%] font-sans",
                msg.role === "user" ? "ml-auto flex-row-reverse" : "",
              )}
            >
              {/* Avatar */}
              <div
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-xs font-semibold select-none",
                  msg.role === "user"
                    ? "bg-accent"
                    : "bg-premium/10 text-premium border-premium/20",
                )}
              >
                {msg.role === "user" ? (
                  <UserIcon className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Bot className="h-4 w-4" />
                )}
              </div>

              {/* Chat bubble */}
              <div
                className={cn(
                  "rounded-2xl p-3.5 text-xs leading-relaxed font-medium shadow-sm whitespace-pre-line",
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground rounded-tr-sm"
                    : "bg-background/80 border text-card-foreground rounded-tl-sm",
                )}
              >
                {msg.content}
              </div>
            </motion.div>
          ))}

          {loading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-3 max-w-[85%] items-center font-sans"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-premium/10 border border-premium/20 text-premium">
                <Bot className="h-4 w-4" />
              </div>
              <div className="rounded-2xl p-3.5 bg-background/80 border text-xs text-muted-foreground flex items-center gap-1.5 rounded-tl-sm">
                <Loader2 className="h-4 w-4 animate-spin text-premium" />
                Thinking...
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={scrollRef} />
      </div>

      {/* Starter Prompts */}
      {messages.length === 1 && !loading && (
        <div className="px-5 pb-3 pt-1 shrink-0 space-y-2">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
            Suggested Questions
          </span>
          <div className="flex flex-col gap-1.5 md:flex-row md:flex-wrap">
            {starterPrompts.map((p, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setQuery(p);
                  haptics.tap();
                }}
                className="flex items-center justify-between text-left rounded-xl border bg-background/50 hover:bg-premium/5 hover:border-premium/25 px-3 py-2 text-[10px] font-semibold font-sans transition-colors"
              >
                <span>{p}</span>
                <ArrowRight className="h-3 w-3 text-muted-foreground ml-2" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input panel */}
      <form
        onSubmit={handleSubmit}
        className="border-t p-4 bg-muted/10 shrink-0"
      >
        <div className="flex gap-2 relative">
          <input
            placeholder="Type your message..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={loading}
            className="flex-1 rounded-full border bg-background px-4 py-2.5 text-xs text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-premium"
          />
          <Button
            type="submit"
            size="icon"
            disabled={!query.trim() || loading}
            className="rounded-full bg-premium hover:bg-premium/90 text-white shrink-0 h-9 w-9"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  );
}
