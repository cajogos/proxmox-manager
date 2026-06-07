import { useEffect, useRef } from 'react';
import { Terminal as XTerm } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import '@xterm/xterm/css/xterm.css';

interface TerminalProps {
  ctid: number;
  onClose?: () => void;
}

export default function Terminal({ ctid, onClose }: TerminalProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<XTerm | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const term = new XTerm({
      cursorBlink: true,
      fontSize: 14,
      fontFamily: 'monospace',
      theme: {
        background: '#1a1a1a',
        foreground: '#d4d4d4',
      },
    });
    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    term.open(containerRef.current);
    fitAddon.fit();
    xtermRef.current = term;

    const wsUrl = `${location.protocol === 'https:' ? 'wss' : 'ws'}://${location.host}/ws/terminal/${ctid}`;
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;
    ws.binaryType = 'arraybuffer';

    ws.onopen = () => {
      term.writeln(`Connecting to container ${ctid}…`);
    };

    ws.onmessage = (event) => {
      if (typeof event.data === 'string') {
        try {
          const msg = JSON.parse(event.data) as { type: string };
          if (msg.type === 'connected') {
            term.writeln('Connected.\r\n');
          }
        } catch {
          term.write(event.data);
        }
      } else {
        term.write(new Uint8Array(event.data as ArrayBuffer));
      }
    };

    ws.onerror = () => {
      term.writeln('\r\n\x1b[31mWebSocket error — connection failed.\x1b[0m');
    };

    ws.onclose = (e) => {
      term.writeln(`\r\n\x1b[33mSession closed (${e.code}).\x1b[0m`);
    };

    term.onData((data) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(data);
      }
    });

    const observer = new ResizeObserver(() => { fitAddon.fit(); });
    observer.observe(containerRef.current);

    return () => {
      observer.disconnect();
      ws.close();
      term.dispose();
    };
  }, [ctid]);

  return (
    <div className="flex flex-col overflow-hidden rounded-lg border border-border bg-[#1a1a1a]">
      <div className="flex items-center justify-between border-b border-border px-3 py-1.5">
        <span className="text-xs font-medium text-muted-foreground">Container {ctid} — Terminal</span>
        {onClose && (
          <button
            onClick={onClose}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            ✕ Close
          </button>
        )}
      </div>
      <div ref={containerRef} className="h-80 p-2" />
    </div>
  );
}
