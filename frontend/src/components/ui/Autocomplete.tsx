"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown } from 'lucide-react';
import Input from './Input';
import { clsx } from 'clsx';

interface Option {
  value: string | number;
  label: string;
  description?: string;
}

interface AutocompleteProps {
  label?: string;
  options: Option[];
  value: string | number;
  onChange: (value: string | number) => void;
  placeholder?: string;
  error?: string;
  className?: string;
}

export default function Autocomplete({
  label,
  options,
  value,
  onChange,
  placeholder = "Pesquisar...",
  error,
  className
}: AutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(opt => String(opt.value) === String(value));
  
  const filteredOptions = options.filter(opt => 
    opt.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (opt.description && opt.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (option: Option) => {
    onChange(option.value);
    setSearchTerm('');
    setIsOpen(false);
  };

  return (
    <div className={clsx("relative w-full", className)} ref={containerRef}>
      {label && (
        <label className="mb-2 block text-sm font-medium text-neutral-400">
          {label}
        </label>
      )}
      
      <div 
        className={clsx(
          "flex h-10 w-full items-center justify-between rounded-lg border bg-[#1a1a1a] px-3 text-sm text-white transition-colors cursor-pointer",
          error ? "border-red-500" : "border-neutral-800 focus-within:border-red-600",
          isOpen && "border-red-600"
        )}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={clsx(!selectedOption && "text-neutral-500")}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown size={16} className={clsx("text-neutral-500 transition-transform", isOpen && "rotate-180")} />
      </div>

      {isOpen && (
        <div className="absolute z-50 mt-1 w-full rounded-lg border border-neutral-800 bg-[#0f0f0f] p-2 shadow-2xl animate-in fade-in zoom-in-95 duration-100">
          <div className="relative mb-2">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-500" size={14} />
            <input
              autoFocus
              className="w-full rounded-md border border-neutral-800 bg-[#1a1a1a] py-1.5 pl-8 pr-3 text-xs text-white placeholder-neutral-500 focus:border-red-600 focus:outline-none"
              placeholder="Digite para filtrar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          
          <div className="max-h-60 overflow-y-auto space-y-0.5">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <div
                  key={option.value}
                  className={clsx(
                    "flex flex-col rounded-md px-3 py-2 cursor-pointer transition-colors",
                    String(option.value) === String(value) ? "bg-red-600/10 text-white" : "text-neutral-400 hover:bg-neutral-800 hover:text-white"
                  )}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelect(option);
                  }}
                >
                  <span className="text-sm font-medium">{option.label}</span>
                  {option.description && (
                    <span className="text-[10px] text-neutral-500">{option.description}</span>
                  )}
                </div>
              ))
            ) : (
              <div className="px-3 py-4 text-center text-xs text-neutral-500">
                Nenhum resultado encontrado
              </div>
            )}
          </div>
        </div>
      )}

      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}
