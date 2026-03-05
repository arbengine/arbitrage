"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function MarkdownRenderer({ content }: { content: string }) {
  return (
    <article className="prose prose-invert prose-zinc max-w-none
      prose-headings:font-mono prose-headings:tracking-tight
      prose-h1:text-3xl prose-h1:text-emerald-400 prose-h1:border-b prose-h1:border-zinc-800 prose-h1:pb-4
      prose-h2:text-2xl prose-h2:text-emerald-300 prose-h2:mt-12
      prose-h3:text-xl prose-h3:text-zinc-200
      prose-p:text-zinc-300 prose-p:leading-7
      prose-a:text-emerald-400 prose-a:no-underline hover:prose-a:underline
      prose-strong:text-zinc-100
      prose-code:text-emerald-300 prose-code:bg-zinc-800 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:before:content-none prose-code:after:content-none
      prose-pre:bg-zinc-900 prose-pre:border prose-pre:border-zinc-800 prose-pre:rounded-lg prose-pre:overflow-x-auto
      prose-blockquote:border-emerald-500 prose-blockquote:text-zinc-400 prose-blockquote:italic
      prose-table:text-sm
      prose-th:text-emerald-300 prose-th:font-mono prose-th:text-left prose-th:border-zinc-700 prose-th:px-3 prose-th:py-2
      prose-td:border-zinc-800 prose-td:px-3 prose-td:py-2 prose-td:text-zinc-300
      prose-hr:border-zinc-800
      prose-li:text-zinc-300 prose-li:marker:text-emerald-500
    ">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </article>
  );
}
