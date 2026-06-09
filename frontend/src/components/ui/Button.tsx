import React from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export default function Button({
  children,
  className,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  disabled,
  ...props
}: ButtonProps) {
  const variants = {
    primary: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    secondary: 'bg-neutral-800 text-white hover:bg-neutral-700 focus:ring-neutral-500',
    outline: 'border border-neutral-700 bg-transparent text-neutral-300 hover:bg-neutral-800 hover:text-white focus:ring-neutral-500',
    ghost: 'bg-transparent text-neutral-400 hover:bg-neutral-800 hover:text-white focus:ring-neutral-500',
    danger: 'bg-transparent border border-red-900/50 text-red-500 hover:bg-red-950/30 focus:ring-red-500',
  };

  const sizes = {
    sm: 'h-8 px-3 text-xs',
    md: 'h-10 px-4 text-sm',
    lg: 'h-12 px-6 text-base',
    icon: 'h-10 w-10 p-0 flex items-center justify-center',
  };

  return (
    <button
      disabled={disabled || isLoading}
      className={cn(
        "inline-flex min-w-0 items-center justify-center gap-2 rounded-lg text-center font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0f0f0f] disabled:cursor-not-allowed disabled:opacity-50",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
      {!isLoading && leftIcon}
      {children}
      {!isLoading && rightIcon}
    </button>
  );
}
