import React from 'react';
import { cn } from '@/lib/utils';

interface TableProps {
  headers: string[];
  children: React.ReactNode;
  className?: string;
  isLoading?: boolean;
}

export default function Table({ headers, children, className, isLoading }: TableProps) {
  return (
    <div className="w-full overflow-x-auto rounded-lg border border-neutral-800">
      <table className={cn("w-full text-left text-sm text-neutral-400", className)}>
        <thead className="bg-[#0f0f0f] text-xs font-semibold uppercase text-neutral-500">
          <tr>
            {headers.map((header, index) => (
              <th key={index} className="px-6 py-4">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-800 bg-[#1a1a1a]">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <tr key={i} className="animate-pulse">
                {headers.map((_, j) => (
                  <td key={j} className="px-6 py-4">
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

export function TableRow({ children, className }: { children: React.ReactNode, className?: string }) {
  return (
    <tr className={cn("transition-colors hover:bg-neutral-800/50", className)}>
      {children}
    </tr>
  );
}

export function TableCell({ children, className }: { children: React.ReactNode, className?: string }) {
  return (
    <td className={cn("whitespace-nowrap px-6 py-4", className)}>
      {children}
    </td>
  );
}
