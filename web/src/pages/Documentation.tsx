import { useEffect, useState } from 'react';
import Markdown, { type Components } from 'react-markdown';
import { getDocs, getDocFile, type DocEntry } from '@/api/client';
import { cn } from '@/lib/utils';

const mdComponents: Components = {
  h1: ({ children }) => <h1 className="mb-4 mt-6 text-2xl font-bold text-foreground first:mt-0">{children}</h1>,
  h2: ({ children }) => <h2 className="mb-3 mt-8 text-lg font-semibold text-foreground first:mt-0">{children}</h2>,
  h3: ({ children }) => <h3 className="mb-2 mt-6 text-base font-semibold text-foreground">{children}</h3>,
  p: ({ children }) => <p className="mb-3 text-sm leading-relaxed text-foreground/90">{children}</p>,
  ul: ({ children }) => <ul className="mb-3 ml-5 list-disc space-y-1 text-sm text-foreground/90">{children}</ul>,
  ol: ({ children }) => <ol className="mb-3 ml-5 list-decimal space-y-1 text-sm text-foreground/90">{children}</ol>,
  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
  code: ({ children, className }) => {
    const isBlock = className?.startsWith('language-');
    if (isBlock) {
      return <code className="block">{children}</code>;
    }
    return <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-foreground">{children}</code>;
  },
  pre: ({ children }) => (
    <pre className="mb-4 overflow-x-auto rounded-md bg-muted p-4 font-mono text-xs leading-relaxed text-foreground">
      {children}
    </pre>
  ),
  table: ({ children }) => (
    <div className="mb-4 overflow-x-auto">
      <table className="w-full border-collapse text-sm">{children}</table>
    </div>
  ),
  thead: ({ children }) => <thead>{children}</thead>,
  tbody: ({ children }) => <tbody>{children}</tbody>,
  tr: ({ children }) => <tr className="border-b border-border">{children}</tr>,
  th: ({ children }) => <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">{children}</th>,
  td: ({ children }) => <td className="px-3 py-2 text-sm text-foreground/90">{children}</td>,
  hr: () => <hr className="my-6 border-border" />,
  strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
  blockquote: ({ children }) => (
    <blockquote className="mb-3 border-l-4 border-border pl-4 text-sm text-muted-foreground">{children}</blockquote>
  ),
  a: ({ href, children }) => (
    <a href={href} className="text-primary underline-offset-4 hover:underline" target="_blank" rel="noreferrer">{children}</a>
  ),
};

export default function Documentation() {
  const [docs, setDocs] = useState<DocEntry[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [contentLoading, setContentLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      const result = await getDocs();
      setLoading(false);
      if (!result.ok) { setError(result.error); return; }
      setDocs(result.data);
      if (result.data.length > 0) {
        setSelected(result.data[0].file);
      }
    })();
  }, []);

  useEffect(() => {
    if (!selected) { return; }
    setContentLoading(true);
    void (async () => {
      const result = await getDocFile(selected);
      setContentLoading(false);
      if (!result.ok) { setError(result.error); return; }
      setContent(result.data);
    })();
  }, [selected]);

  if (loading) { return <p className="text-muted-foreground">Loading documentation…</p>; }
  if (error) { return <p className="text-destructive">Error: {error}</p>; }

  return (
    <div className="flex gap-6">
      <nav className="w-44 shrink-0">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Commands</p>
        <ul className="flex flex-col gap-1">
          {docs.map(doc => (
            <li key={doc.file}>
              <button
                onClick={() => setSelected(doc.file)}
                className={cn(
                  'w-full cursor-pointer rounded-md px-3 py-1.5 text-left text-sm transition-colors',
                  selected === doc.file
                    ? 'bg-accent font-semibold text-accent-foreground'
                    : 'text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground',
                )}
              >
                {doc.name}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <div className="min-w-0 flex-1">
        {contentLoading ? (
          <p className="text-muted-foreground">Loading…</p>
        ) : (
          <Markdown components={mdComponents}>{content}</Markdown>
        )}
      </div>
    </div>
  );
}
