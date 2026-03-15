"use client";

import { useEffect, useState } from "react";

type KeyStatus = "configured" | "missing" | "testing" | "ok" | "fail";

interface ApiKeyConfigModalProps {
  open: boolean;
  onClose: () => void;
}

function KeyRow({
  label,
  status,
  onTest,
  onTestComplete,
}: {
  label: string;
  status: KeyStatus;
  onTest: () => Promise<{ success: boolean }>;
  onTestComplete: (ok: boolean) => void;
}) {
  const [testStatus, setTestStatus] = useState<"idle" | "testing" | "ok" | "fail">("idle");

  const handleTest = async () => {
    setTestStatus("testing");
    try {
      const res = await onTest();
      setTestStatus(res.success ? "ok" : "fail");
      onTestComplete(res.success);
    } catch {
      setTestStatus("fail");
      onTestComplete(false);
    }
  };

  const statusDisplay =
    status === "missing" ? (
      <span className="text-red-400 text-[10px] font-mono">✗ Missing</span>
    ) : status === "configured" ? (
      <span className="text-slate-400 text-[10px] font-mono">✓ Configured</span>
    ) : null;

  const testDisplay =
    testStatus === "testing" ? (
      <span className="text-slate-500 text-[10px] font-mono">Checking...</span>
    ) : testStatus === "ok" ? (
      <span className="text-green-400 text-[10px] font-mono">✓ Connected</span>
    ) : testStatus === "fail" ? (
      <span className="text-red-400 text-[10px] font-mono">✗ Failed</span>
    ) : null;

  return (
    <div className="flex items-center justify-between px-3 py-2 rounded bg-[#0a0a18] border border-[#2a2a4a]">
      <div className="flex items-center gap-2">
        <span className="text-slate-300 text-[11px] font-mono w-[100px]">{label}</span>
        {statusDisplay}
      </div>
      {status === "configured" && (
        <div className="flex items-center gap-2">
          {testDisplay}
          <button
            onClick={handleTest}
            disabled={testStatus === "testing"}
            className="px-2 py-0.5 text-[9px] font-mono font-semibold bg-[#12122a] border border-[#2a2a4a] text-slate-400 hover:border-[#c9a227]/50 hover:text-[#c9a227] transition-all rounded disabled:opacity-50"
          >
            {testStatus === "testing" ? "..." : "Test"}
          </button>
        </div>
      )}
    </div>
  );
}

export default function ApiKeyConfigModal({ open, onClose }: ApiKeyConfigModalProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [status, setStatus] = useState<{
    openRouter: boolean;
    tavily: boolean;
    nebius: boolean;
  }>({ openRouter: false, tavily: false, nebius: false });

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    setIsLoading(true);
    fetch("/api/config/status")
      .then((r) => r.json())
      .then((data) => {
        setStatus({
          openRouter: !!data.openRouter,
          tavily: !!data.tavily,
          nebius: !!data.nebius,
        });
      })
      .catch(() => setStatus({ openRouter: false, tavily: false, nebius: false }))
      .finally(() => setIsLoading(false));
  }, [open]);

  const testKey = async (key: "openRouter" | "tavily" | "nebius") => {
    const res = await fetch("/api/config/test", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key }),
    });
    const data = await res.json();
    return { success: !!data.success };
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/70"
        onClick={onClose}
        role="presentation"
        aria-hidden="true"
      />
      <div
        className="relative w-full max-w-md mx-4 rounded-lg border border-[#2a2a4a] bg-[#0e0e1a] shadow-xl"
        style={{ boxShadow: "0 0 40px rgba(201,162,39,0.08)" }}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#2a2a4a]">
          <h2 className="text-[#c9a227] font-mono font-bold text-sm tracking-wider">
            API KEY CONFIGURATION
          </h2>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-300 text-lg leading-none"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div className="p-4 space-y-3">
          {isLoading ? (
            <div className="py-6 text-center text-slate-500 text-[11px] font-mono">
              Checking...
            </div>
          ) : (
            <>
              <KeyRow
                label="OpenRouter"
                status={status.openRouter ? "configured" : "missing"}
                onTest={() => testKey("openRouter")}
                onTestComplete={() => {}}
              />
              <KeyRow
                label="Tavily"
                status={status.tavily ? "configured" : "missing"}
                onTest={() => testKey("tavily")}
                onTestComplete={() => {}}
              />
              <KeyRow
                label="Nebius"
                status={status.nebius ? "configured" : "missing"}
                onTest={() => testKey("nebius")}
                onTestComplete={() => {}}
              />
            </>
          )}

          <div className="pt-3 border-t border-[#2a2a4a] space-y-2">
            <p className="text-[10px] text-slate-500 font-mono">
              Add keys to .env.local and restart. See .env.example.
            </p>
            <div className="flex flex-wrap gap-2">
              <a
                href="https://openrouter.ai/keys"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] font-mono text-[#c9a227] hover:underline"
              >
                OpenRouter Keys
              </a>
              <a
                href="https://tavily.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] font-mono text-[#c9a227] hover:underline"
              >
                Tavily
              </a>
              <a
                href="https://nebius.ai"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] font-mono text-[#c9a227] hover:underline"
              >
                Nebius
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
