import React from 'react';
import { cn } from '@/lib/utils';

interface HeaderObject {
  label: string;
  align?: 'left' | 'center' | 'right';
}

interface TableProps {
  headers: (string | HeaderObject)[];
  children: React.ReactNode;
  className?: string;
  isLoading?: boolean;
}

export default function Table({ headers, children, className, isLoading }: TableProps) {
  return (
    <div className="w-full max-w-full overflow-x-auto rounded-lg border border-neutral-800">
      <table className={cn("min-w-full table-auto text-left text-sm text-neutral-400", className)}>
        <thead className="bg-[#0f0f0f] text-xs font-semibold uppercase text-neutral-500">
          <tr>
            {headers.map((header, index) => {
              const label = typeof header === 'string' ? header : header.label;
              const align = typeof header === 'string' ? 'left' : (header.align || 'left');
              
              return (
                <th 
                  key={index} 
                  className={cn(
                    "whitespace-nowrap px-4 py-3 sm:px-6 sm:py-4",
                    align === 'center' && "text-center",
                    align === 'right' && "text-right"
                  )}
                >
                  {label}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-800 bg-[#1a1a1a]">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <tr key={i} className="animate-pulse">
                {headers.map((_, j) => (
                  <td key={j} className="px-4 py-3 sm:px-6 sm:py-4">
                    <div className="h-4 w-full rounded bg-neutral-800"></div>
                  </td>
                ))}
              </tr>
            ))
          ) : (
            children
          )}
        </tbody>
      </table>
    </div>
  );
}

export function TableRow({ children, className, ...props }: React.HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr className={cn("transition-colors hover:bg-neutral-800/50", className)} {...props}>
      {children}
    </tr>
  );
}

export function TableCell({
  children,
  className,
  ...props
}: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td className={cn("whitespace-nowrap px-4 py-3 sm:px-6 sm:py-4", className)} {...props}>
      {children}
    </td>
  );
}
