"use client";

import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import Button from './Button';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  footer?: React.ReactNode;
}

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  footer
}: ModalProps) {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleEsc);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    '2xl': 'max-w-7xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
        onClick={onClose}
      />
      
      <div className={cn(
        "relative flex max-h-[calc(100dvh-1.5rem)] w-full flex-col overflow-hidden rounded-xl border border-neutral-800 bg-[#1a1a1a] shadow-2xl animate-in fade-in zoom-in duration-200 sm:max-h-[calc(100dvh-2rem)]",
        sizes[size]
      )}>
        <div className="flex items-center justify-between gap-3 border-b border-neutral-800 p-4 sm:p-6">
          <h3 className="min-w-0 break-words text-lg font-semibold text-white sm:text-xl">{title}</h3>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X size={20} />
          </Button>
        </div>
        
        <div className="min-h-0 overflow-y-auto p-4 sm:p-6">
          {children}
        </div>
        
        {footer && (
          <div className="flex flex-col-reverse gap-3 border-t border-neutral-800 p-4 sm:flex-row sm:justify-end sm:p-6">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
