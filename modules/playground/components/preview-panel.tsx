"use client";

import { useState, useRef } from "react";
import { RefreshCw, ExternalLink } from "lucide-react";

interface PreviewPanelProps {
  url: string | null;
}

export function PreviewPanel({ url }: PreviewPanelProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [loading, setLoading] = useState(false);

  const handleRefresh = () => {
    if (!iframeRef.current || !url) return;
    setLoading(true);
    iframeRef.current.src = url;
  };

  if (!url) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#0a0a0a]">
        <p className="text-xs text-zinc-500">Waiting for server...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full h-full bg-[#0a0a0a]">
      {/* Preview toolbar */}
      <div className="h-8 flex items-center gap-2 px-3 border-b border-border/50 bg-[#111111] shrink-0">
        {/* URL bar */}
        <div className="flex-1 flex items-center gap-1.5 bg-background/20 border border-border/50 rounded px-2 py-0.5 min-w-0">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
          <span className="text-[10px] text-zinc-400 truncate">{url}</span>
        </div>

        {/* Refresh */}
        <button
          onClick={handleRefresh}
          className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
          title="Refresh preview"
        >
          <RefreshCw className={`w-3 h-3 ${loading ? "animate-spin" : ""}`} />
        </button>

        {/* Open in new tab */}
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
          title="Open in new tab"
        >
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      {/* Iframe */}
      <div className="flex-1 relative overflow-hidden">
        <iframe
          ref={iframeRef}
          src={url}
          className="w-full h-full border-none bg-white"
          onLoad={() => setLoading(false)}
          title="Preview"
          allow="cross-origin-isolated"
        />
      </div>
    </div>
  );
}