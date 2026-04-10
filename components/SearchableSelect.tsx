"use client";

import { useState, useRef, useEffect } from "react";
import { Search, ChevronDown, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Option {
  _id: string;
  name: string;
}

interface SearchableSelectProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  allLabel?: string;
  noResultsLabel?: string;
  showAllOption?: boolean;
  className?: string;
  searchable?: boolean;
  disabled?: boolean;
}


export function SearchableSelect({
  options,
  value,
  onChange,
  allLabel = "All",
  noResultsLabel = "No results found",
  showAllOption = true,
  className = "",
  searchable = true,
  disabled = false,
}: SearchableSelectProps) {

  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt._id === value);
  const filteredOptions = options.filter((opt) =>
    opt.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full bg-black border border-white/5 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-white/20 transition-all font-bold flex items-center justify-between gap-3 min-w-[160px] ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <span className={`truncate ${!selectedOption ? "text-stone-500" : "text-white"}`}>
          {selectedOption ? selectedOption.name : allLabel}
        </span>
        <ChevronDown className={`w-4 h-4 text-stone-500 transition-transform shrink-0 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute top-full left-0 right-0 mt-2 bg-black border border-white/10 rounded-xl shadow-2xl z-[70] overflow-hidden min-w-[180px]"
          >
            {searchable && (
              <div className="p-3 border-b border-white/5 bg-white/[0.02]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" />
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-black border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-xs focus:outline-none focus:border-white/20 transition-all"
                    autoFocus
                  />
                </div>
              </div>
            )}

            <div className="max-h-64 overflow-y-auto">
              {showAllOption && (
                <>
                  <button
                    onClick={() => {
                      onChange("");
                      setIsOpen(false);
                      setSearchTerm("");
                    }}
                    className={`w-full flex items-center justify-between px-4 py-3 text-[10px] font-bold uppercase tracking-widest transition-all text-left ${
                        value === "" ? "text-white bg-white/5" : "text-stone-500 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    {allLabel}
                    {value === "" && <Check className="w-3 h-3 text-white" />}
                  </button>
                  <div className="h-px bg-white/5 mx-2" />
                </>
              )}


              {filteredOptions.length === 0 ? (
                <div className="px-4 py-8 text-center">
                  <p className="text-[10px] text-stone-600 font-bold uppercase tracking-widest italic">{noResultsLabel}</p>
                </div>

              ) : (
                filteredOptions.map((opt) => (
                  <button
                    key={opt._id}
                    onClick={() => {
                      onChange(opt._id);
                      setIsOpen(false);
                      setSearchTerm("");
                    }}
                    className={`w-full flex items-center justify-between px-4 py-3 text-[10px] font-bold uppercase tracking-widest transition-all text-left ${
                      value === opt._id ? "text-white bg-white/5" : "text-stone-500 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <span className="truncate pr-4">{opt.name}</span>
                    {value === opt._id && <Check className="w-3 h-3 text-white" />}
                  </button>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
