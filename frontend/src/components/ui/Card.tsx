import React from 'react';
import { cn } from '@/lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  headerAction?: React.ReactNode;
  icon?: React.ReactNode;
}

export default function Card({ children, className, title, subtitle, headerAction, icon }: CardProps) {
  return (
    <div className={cn(
      "min-w-0 rounded-xl border border-neutral-800 bg-[#1a1a1a] shadow-sm",
      className
    )}>
      {(title || subtitle || headerAction) && (
        <div className="flex flex-col gap-3 border-b border-neutral-800 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div className="flex min-w-0 items-start gap-3">
            {icon && <div className="mt-0.5 shrink-0">{icon}</div>}
            <div className="min-w-0">
              {title && <h3 className="break-words text-base font-semibold text-white sm:text-lg">{title}</h3>}
              {subtitle && <p className="break-words text-sm text-neutral-500">{subtitle}</p>}
            </div>
          </div>
          {headerAction}
        </div>
      )}
      <div className="min-w-0 p-4 sm:p-6">
        {children}
      </div>
    </div>
  );
}
