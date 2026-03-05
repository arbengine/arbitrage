import fs from "fs";
import path from "path";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { AgenticPathways } from "@/components/AgenticPathways";

export default function Home() {
  const filePath = path.join(process.cwd(), "ARBITRAGE.md");
  const content = fs.readFileSync(filePath, "utf-8");

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <AgenticPathways />
      <div className="relative z-10 mx-auto max-w-4xl px-6 py-16">
        <MarkdownRenderer content={content} />
      </div>
    </div>
  );
}
