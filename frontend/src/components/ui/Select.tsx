import React from 'react';
import { cn } from '@/lib/utils';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string | number; label: string }[];
  containerClassName?: string;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, containerClassName, className, ...props }, ref) => {
    return (
      <div className={cn("flex flex-col gap-1.5 w-full", containerClassName)}>
        {label && (
          <label className="text-sm font-medium text-neutral-400">
            {label}
          </label>
        )}
        <select
          ref={ref}
          className={cn(
            "flex h-10 w-full rounded-lg border border-neutral-800 bg-[#0f0f0f] px-3 py-2 text-sm text-white transition-colors focus:border-red-600 focus:outline-none focus:ring-1 focus:ring-red-600 disabled:opacity-50",
            error && "border-red-500 focus:border-red-500 focus:ring-red-500",
            className
          )}
          {...props}
        >
          <option value="" disabled className="bg-[#1a1a1a]">Selecione uma opção</option>
          {options.map((option) => (
            <option key={option.value} value={option.value} className="bg-[#1a1a1a]">
              {option.label}
            </option>
          ))}
        </select>
        {error && <span className="text-xs text-red-500">{error}</span>}
      </div>
    );
  }
);

Select.displayName = 'Select';

export default Select;
