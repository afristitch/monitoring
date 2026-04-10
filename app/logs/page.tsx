"use client";

import { useEffect, useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { api } from "@/lib/api-client";
import { 
  ScrollText, 
  FileText, 
  Download, 
  Search, 
  RefreshCcw,
  Loader2,
  ChevronRight,
  Database
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { formatDate } from "@/lib/utils";

interface LogFile {
  name: string;
  size: number;
  createdAt: string;
  updatedAt: string;
}

export default function LogsPage() {
  const [logFiles, setLogFiles] = useState<LogFile[]>([]);
  const [selectedLog, setSelectedLog] = useState<string | null>(null);
  const [logContent, setLogContent] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [contentLoading, setContentLoading] = useState(false);

  useEffect(() => {
    fetchLogFiles();
  }, []);

  async function fetchLogFiles() {
    setLoading(true);
    try {
      const response = await api.get("/system/logs");
      if (response.success) {
        setLogFiles(response.data);
      }
    } catch (err) {
      console.error("Failed to fetch log files", err);
    } finally {
      setLoading(false);
    }
  }

  async function viewLog(filename: string) {
    setSelectedLog(filename);
    setContentLoading(true);
    setLogContent("");
    try {
      const text = await api.getText(`/system/logs/${filename}`);
      setLogContent(text);
    } catch (err) {
      console.error("Failed to fetch log content", err);
      setLogContent("Error: Could not retrieve log content.");
    } finally {
      setContentLoading(false);
    }
  }

  function formatSize(bytes: number) {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }

  return (
    <AppLayout>
      <div className="space-y-10 pb-20">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-stone-500 text-sm font-medium uppercase tracking-widest">
              <ScrollText className="w-4 h-4 text-accent" />
              Runtime Diagnostics
            </div>
            <h2 className="font-headlines text-3xl uppercase">System Logs</h2>
            <p className="text-stone-400">Monitor platform health and trace background operations.</p>
          </div>

          <button 
            onClick={fetchLogFiles}
            className="flex items-center gap-2 bg-surface-gray border border-white/5 rounded-xl px-6 py-3 text-stone-300 hover:text-white hover:border-accent/40 transition-all font-medium text-sm"
          >
            <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[70vh]">
          {/* Log Files List */}
          <div className="premium-card flex flex-col h-full lg:col-span-1 overflow-hidden">
            <div className="p-6 border-b border-white/5 bg-white/5">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" />
                <input
                  type="text"
                  placeholder="Filter logs..."
                  className="w-full bg-black border border-white/10 rounded-lg pl-10 pr-4 py-2 text-xs focus:outline-none focus:border-accent/40 transition-all"
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-2">
              {loading ? (
                <div className="flex items-center justify-center h-40">
                  <Loader2 className="w-6 h-6 animate-spin text-accent" />
                </div>
              ) : logFiles.length === 0 ? (
                <div className="p-6 text-center text-stone-500 text-sm italic">
                  No log files generated.
                </div>
              ) : (
                <div className="space-y-1">
                  {logFiles.map((file) => (
                    <button
                      key={file.name}
                      onClick={() => viewLog(file.name)}
                      className={`w-full text-left p-4 rounded-xl transition-all duration-300 group flex items-start gap-4 ${
                        selectedLog === file.name 
                        ? 'bg-accent/10 border-accent/20 border text-accent shadow-[0_0_20px_rgba(253,218,13,0.05)]' 
                        : 'hover:bg-white/5 border border-transparent text-stone-400 hover:text-white'
                      }`}
                    >
                      <div className={`p-2 rounded-lg ${selectedLog === file.name ? 'bg-accent/20' : 'bg-white/5'}`}>
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-sm font-bold truncate">{file.name}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-[10px] uppercase font-bold text-stone-600 dark:text-stone-500">
                             {formatSize(file.size)}
                          </span>
                          <span className="text-[10px] text-stone-600">&bull;</span>
                          <span className="text-[10px] text-stone-600">
                             {formatDate(file.updatedAt)}
                          </span>
                        </div>
                      </div>
                      <ChevronRight className={`ml-auto w-4 h-4 transition-transform group-hover:translate-x-1 ${selectedLog === file.name ? 'opacity-100' : 'opacity-0'}`} />
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="p-4 border-t border-white/5 bg-white/5 flex items-center gap-2 text-[10px] font-bold text-stone-500 uppercase tracking-widest">
              <Database className="w-3 h-3 text-accent" />
              Node: Production-01
            </div>
          </div>

          {/* Log Viewer Content */}
          <div className="premium-card flex flex-col h-full lg:col-span-2 overflow-hidden bg-black/50">
            {selectedLog ? (
              <>
                <div className="px-8 py-4 border-b border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                    <h3 className="text-sm font-bold tracking-tight">{selectedLog}</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="p-2 hover:bg-white/10 rounded-lg text-stone-500 hover:text-accent transition-all">
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="flex-1 overflow-auto p-8 font-mono text-xs leading-relaxed">
                  {contentLoading ? (
                    <div className="h-full flex flex-col items-center justify-center gap-4 text-stone-500">
                      <Loader2 className="w-10 h-10 animate-spin text-accent" />
                      <p className="font-headlines tracking-widest uppercase text-[10px]">Streaming logs...</p>
                    </div>
                  ) : (
                    <AnimatePresence mode="wait">
                      <motion.pre 
                        key={logContent}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-stone-300 break-words whitespace-pre-wrap"
                      >
                        {logContent}
                      </motion.pre>
                    </AnimatePresence>
                  )}
                </div>
              </>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-stone-600 space-y-4">
                <ScrollText className="w-16 h-16 opacity-10" />
                <p className="font-headlines uppercase tracking-widest text-xs">Select a session log to analyze</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
