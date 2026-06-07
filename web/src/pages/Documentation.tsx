import { useEffect, useState } from 'react';
import Markdown from 'react-markdown';
import { getDocs, getDocFile, type DocEntry } from '@/api/client';
import { cn } from '@/lib/utils';

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
                  'w-full rounded-md px-3 py-1.5 text-left text-sm transition-colors',
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
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <Markdown>{content}</Markdown>
          </div>
        )}
      </div>
    </div>
  );
}
