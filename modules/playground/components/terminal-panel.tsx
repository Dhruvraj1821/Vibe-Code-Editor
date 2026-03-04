"use client";

import { useEffect, useRef, useImperativeHandle, forwardRef } from "react";
import { Terminal } from "xterm";
import { FitAddon } from "xterm-addon-fit";
import { WebLinksAddon } from "xterm-addon-web-links";
import "xterm/css/xterm.css";

export interface TerminalHandle {
  terminal: Terminal | null;
  fit: () => void;
  clear: () => void;
}

interface TerminalPanelProps {
  visible: boolean;
}

export const TerminalPanel = forwardRef<TerminalHandle, TerminalPanelProps>(
  ({ visible }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const terminalRef = useRef<Terminal | null>(null);
    const fitAddonRef = useRef<FitAddon | null>(null);

    useImperativeHandle(ref, () => ({
      get terminal() { return terminalRef.current; },
      fit() { fitAddonRef.current?.fit(); },
      clear() { terminalRef.current?.clear(); },
    }));

    useEffect(() => {
      if (!containerRef.current || terminalRef.current) return;

      const terminal = new Terminal({
        cursorBlink: true,
        fontSize: 12,
        fontFamily: "var(--font-geist-mono), 'Fira Code', monospace",
        theme: {
          background: "#0a0a0a",
          foreground: "#e4e4e7",
          cursor: "#a78bfa",
          selectionBackground: "#a78bfa40",
          black: "#18181b",
          red: "#f87171",
          green: "#4ade80",
          yellow: "#facc15",
          blue: "#60a5fa",
          magenta: "#c084fc",
          cyan: "#22d3ee",
          white: "#e4e4e7",
          brightBlack: "#3f3f46",
          brightRed: "#fca5a5",
          brightGreen: "#86efac",
          brightYellow: "#fde047",
          brightBlue: "#93c5fd",
          brightMagenta: "#d8b4fe",
          brightCyan: "#67e8f9",
          brightWhite: "#f4f4f5",
        },
        convertEol: true,
        scrollback: 1000,
      });

      const fitAddon = new FitAddon();
      const webLinksAddon = new WebLinksAddon();
      terminal.loadAddon(fitAddon);
      terminal.loadAddon(webLinksAddon);
      terminal.open(containerRef.current);
      fitAddon.fit();

      terminalRef.current = terminal;
      fitAddonRef.current = fitAddon;

      const resizeObserver = new ResizeObserver(() => fitAddonRef.current?.fit());
      resizeObserver.observe(containerRef.current);

      return () => {
        resizeObserver.disconnect();
        terminal.dispose();
        terminalRef.current = null;
        fitAddonRef.current = null;
      };
    }, []);

    useEffect(() => {
      if (visible) {
        requestAnimationFrame(() => fitAddonRef.current?.fit());
      }
    }, [visible]);

    return (
      <div
        ref={containerRef}
        className="w-full h-full bg-[#0a0a0a]"
        style={{ padding: "4px 8px" }}
      />
    );
  }
);

TerminalPanel.displayName = "TerminalPanel";