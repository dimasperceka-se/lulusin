import { useEffect, useRef, useState } from "react";
import { Link } from "wouter";
import { roboEduChat } from "@workspace/api-client-react";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import {
  Sparkles,
  Send,
  MessagesSquare,
  ArrowLeft,
  RotateCcw,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

const GREETING: ChatMessage = {
  role: "assistant",
  content:
    "Halo! Aku Robo-Edu, asisten AI Lulusin untuk persiapan SKD CPNS. Cerita dong, area mana yang paling bikin kamu mumet sekarang — TWK, TIU, TKP, atau strategi belajarnya? Sebutin juga sudah berapa lama persiapan dan target instansi kamu, biar aku kasih langkah yang paling pas.",
};

const STARTER_PROMPTS = [
  "Aku lemah di TIU deret angka, gimana cara latihannya?",
  "Bingung mengatur waktu belajar TWK, TIU, dan TKP.",
  "Bagaimana strategi 30 hari sebelum tes SKD?",
  "Sering kena jebakan di soal TKP, apa polanya?",
];

export default function RoboEdu() {
  const [messages, setMessages] = useState<ChatMessage[]>([GREETING]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isSending]);

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isSending) return;
    setError(null);
    const next: ChatMessage[] = [...messages, { role: "user", content: trimmed }];
    setMessages(next);
    setInput("");
    setIsSending(true);
    try {
      const result = await roboEduChat({ messages: next });
      setMessages([...next, { role: "assistant", content: result.reply }]);
    } catch (err) {
      const errorMessage = (err as { data?: { error?: string } }).data?.error
        ?? "Gagal menghubungi Robo-Edu. Coba lagi.";
      setError(errorMessage);
      // Rollback the user turn so user can retry/edit
      setMessages(messages);
      setInput(trimmed);
    } finally {
      setIsSending(false);
      textareaRef.current?.focus();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void send(input);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void send(input);
    }
  };

  const resetChat = () => {
    setMessages([GREETING]);
    setInput("");
    setError(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="container mx-auto max-w-4xl px-4 pt-6 pb-10">
        <Link href="/">
          <span className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4 cursor-pointer">
            <ArrowLeft className="h-4 w-4" />
            Kembali ke beranda
          </span>
        </Link>

        <div className="rounded-3xl border border-card-border bg-card shadow-card overflow-hidden flex flex-col h-[calc(100vh-12rem)] min-h-[560px]">
          {/* Header */}
          <header className="border-b border-card-border bg-gradient-to-r from-primary/10 via-mint-50 to-blue-50 dark:from-primary/15 dark:via-primary/5 dark:to-background px-5 py-4 flex items-center gap-4">
            <div className="relative shrink-0">
              <img
                src="/robot_pns.png"
                alt="Robo-Edu"
                className="h-14 w-14 object-contain rounded-full bg-white/70 dark:bg-card border border-card-border"
                style={{ mixBlendMode: "multiply" }}
                draggable={false}
              />
              <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-card" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="font-display text-lg font-bold leading-tight">Robo-Edu</h1>
                <Badge className="bg-primary/10 text-primary hover:bg-primary/15 border border-primary/20 text-[10px]">
                  <Sparkles className="h-2.5 w-2.5 mr-1" />
                  AI Coach CPNS
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Online · siap bantu cari solusi belajar kamu
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={resetChat} disabled={isSending} className="shrink-0">
              <RotateCcw className="h-4 w-4 mr-1.5" />
              Mulai ulang
            </Button>
          </header>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 md:px-6 py-5 space-y-4 bg-gradient-to-b from-background to-muted/20">
            {messages.map((m, i) => (
              <MessageBubble key={i} message={m} />
            ))}
            {isSending && <TypingIndicator />}

            {messages.length === 1 && !isSending && (
              <div className="pt-2">
                <p className="text-xs text-muted-foreground mb-2 text-center">Mulai dengan salah satu pertanyaan ini:</p>
                <div className="grid sm:grid-cols-2 gap-2">
                  {STARTER_PROMPTS.map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => void send(p)}
                      className="text-left text-sm rounded-xl border border-card-border bg-card hover:bg-muted/60 hover:border-primary/40 transition-colors px-3 py-2"
                    >
                      <span className="text-primary mr-1">›</span> {p}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Error */}
          {error && (
            <div className="px-5 py-2.5 bg-destructive/10 border-t border-destructive/30 text-xs text-destructive flex items-center gap-2">
              <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
              {error}
            </div>
          )}

          {/* Input */}
          <form onSubmit={handleSubmit} className="border-t border-card-border bg-card px-3 py-3">
            <div className="flex items-end gap-2">
              <Textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Tulis kesulitan atau pertanyaanmu di sini... (Enter untuk kirim)"
                rows={2}
                disabled={isSending}
                className="resize-none min-h-0 flex-1 text-sm"
                maxLength={4000}
              />
              <Button type="submit" disabled={!input.trim() || isSending} size="lg" className="h-auto px-4">
                <Send className="h-4 w-4" />
                <span className="sr-only">Kirim</span>
              </Button>
            </div>
            <p className="text-[10px] text-muted-foreground mt-1.5 px-1">
              Robo-Edu bisa salah. Selalu cek info regulasi resmi di situs BKN.
            </p>
          </form>
        </div>

        {/* Footer CTA */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-6 rounded-2xl border border-primary/20 bg-primary/5 p-4 flex flex-col md:flex-row items-start md:items-center gap-3"
        >
          <span className="grid place-items-center h-10 w-10 rounded-xl bg-primary/15 text-primary shrink-0">
            <MessagesSquare className="h-5 w-5" />
          </span>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm">Mau bimbingan yang lebih terstruktur?</p>
            <p className="text-xs text-muted-foreground">
              Lihat paket Lulusin — bank soal, materi lengkap, dan simulasi CAT.
            </p>
          </div>
          <Button asChild size="sm">
            <Link href="/packages?category=CPNS">Lihat Paket CPNS</Link>
          </Button>
        </motion.div>
      </section>
    </div>
  );
}

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={cn("flex w-full", isUser ? "justify-end" : "justify-start")}
    >
      {!isUser && (
        <div className="shrink-0 mr-2 h-8 w-8 rounded-full bg-primary/10 grid place-items-center text-primary border border-primary/15">
          <Sparkles className="h-4 w-4" />
        </div>
      )}
      <div
        className={cn(
          "max-w-[85%] md:max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-soft",
          isUser
            ? "bg-primary text-primary-foreground rounded-br-md"
            : "bg-card border border-card-border rounded-bl-md",
        )}
      >
        {isUser ? (
          <p className="whitespace-pre-wrap">{message.content}</p>
        ) : (
          <article className="prose prose-sm prose-slate dark:prose-invert max-w-none prose-p:my-1.5 prose-ol:my-2 prose-ul:my-2 prose-li:my-0.5">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
          </article>
        )}
      </div>
    </motion.div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex items-center gap-2">
      <div className="shrink-0 h-8 w-8 rounded-full bg-primary/10 grid place-items-center text-primary border border-primary/15">
        <Sparkles className="h-4 w-4" />
      </div>
      <div className="rounded-2xl rounded-bl-md bg-card border border-card-border px-4 py-3 flex items-center gap-1">
        {[0, 0.15, 0.3].map((delay) => (
          <motion.span
            key={delay}
            className="h-1.5 w-1.5 rounded-full bg-primary/60"
            animate={{ y: [0, -4, 0], opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 0.9, repeat: Infinity, delay, ease: "easeInOut" }}
          />
        ))}
      </div>
    </div>
  );
}
