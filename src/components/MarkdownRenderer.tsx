"use client";

import ReactMarkdown, { Components } from "react-markdown";
import remarkGfm from "remark-gfm";

const components: Components = {
  h1: ({ node, children, ...props }) => (
    <h1
      className="text-4xl font-[var(--font-orbitron)] font-black tracking-widest border-b border-orange-500/30 pb-4
                 bg-gradient-to-r from-orange-400 via-rose-500 to-fuchsia-500
                 bg-clip-text text-transparent"
      {...props}
    >
      {children}
    </h1>
  ),
  h2: ({ node, children, ...props }) => (
    <h2
      className="text-2xl font-[var(--font-orbitron)] font-semibold tracking-wide uppercase mt-12
                 bg-gradient-to-r from-orange-300 via-pink-500 to-fuchsia-400
                 bg-clip-text text-transparent"
      {...props}
    >
      {children}
    </h2>
  ),
  h3: ({ node, children, ...props }) => (
    <h3
      className="text-xl font-[var(--font-orbitron)] font-medium tracking-wide
                 bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500
                 bg-clip-text text-transparent"
      {...props}
    >
      {children}
    </h3>
  ),
};

export function MarkdownRenderer({ content }: { content: string }) {
  return (
    <article className="prose prose-invert prose-zinc max-w-none
      prose-headings:font-[var(--font-orbitron)] prose-headings:tracking-wide
      prose-p:text-zinc-300 prose-p:leading-7 prose-p:font-[var(--font-share-tech-mono)]
      prose-a:text-orange-400 prose-a:no-underline hover:prose-a:text-fuchsia-400 hover:prose-a:underline
      prose-strong:text-zinc-100
      prose-code:text-orange-300 prose-code:bg-zinc-800/80 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:before:content-none prose-code:after:content-none prose-code:font-[var(--font-share-tech-mono)]
      prose-pre:bg-zinc-900/80 prose-pre:border prose-pre:border-zinc-800 prose-pre:rounded-lg prose-pre:overflow-x-auto prose-pre:backdrop-blur-sm
      prose-blockquote:border-orange-500 prose-blockquote:text-zinc-400 prose-blockquote:italic
      prose-table:text-sm prose-table:font-[var(--font-share-tech-mono)]
      prose-th:text-orange-300 prose-th:font-[var(--font-orbitron)] prose-th:text-left prose-th:border-zinc-700 prose-th:px-3 prose-th:py-2
      prose-td:border-zinc-800 prose-td:px-3 prose-td:py-2 prose-td:text-zinc-300
      prose-hr:border-zinc-800
      prose-li:text-zinc-300 prose-li:marker:text-orange-500 prose-li:font-[var(--font-share-tech-mono)]
    ">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {content}
      </ReactMarkdown>
    </article>
  );
}
