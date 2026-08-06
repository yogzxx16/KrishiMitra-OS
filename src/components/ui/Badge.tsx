import React from 'react';

type BadgeVariant =
  | 'emerald'
  | 'amber'
  | 'blue'
  | 'red'
  | 'purple'
  | 'slate'
  | 'success'
  | 'warning';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: 'sm' | 'md' | 'lg';
  dot?: boolean;
  className?: string;
}

const VARIANT_STYLES: Record<BadgeVariant, string> = {
  emerald: 'bg-[var(--color-success-light)] text-[var(--color-success)] border-[var(--color-success)]/20',
  amber: 'bg-[var(--color-warning-light)] text-[var(--color-warning)] border-[var(--color-warning)]/20',
  blue: 'bg-[var(--color-info-light)] text-[var(--color-info)] border-[var(--color-info)]/20',
  red: 'bg-[var(--color-error-light)] text-[var(--color-error)] border-[var(--color-error)]/20',
  purple: 'bg-purple-50 text-purple-700 border-purple-200',
  slate: 'bg-gray-100 text-gray-700 border-gray-200',
  success: 'bg-[var(--color-success-light)] text-[var(--color-success)] border-[var(--color-success)]/20',
  warning: 'bg-[var(--color-warning-light)] text-[var(--color-warning)] border-[var(--color-warning)]/20',
};

const DOT_STYLES: Record<BadgeVariant, string> = {
  emerald: 'bg-[var(--color-success)]',
  amber: 'bg-[var(--color-warning)]',
  blue: 'bg-[var(--color-info)]',
  red: 'bg-[var(--color-error)]',
  purple: 'bg-purple-600',
  slate: 'bg-gray-500',
  success: 'bg-[var(--color-success)]',
  warning: 'bg-[var(--color-warning)]',
};

const SIZE_STYLES = {
  sm: 'px-2 py-0.5 text-[10px] uppercase tracking-wider',
  md: 'px-2.5 py-1 text-xs',
  lg: 'px-3 py-1.5 text-sm',
};

export function Badge({
  children,
  variant = 'emerald',
  size = 'md',
  dot = false,
  className = '',
}: BadgeProps) {
  return (
    <span
      className={[
        'inline-flex items-center gap-1.5 font-semibold rounded-full border',
        VARIANT_STYLES[variant],
        SIZE_STYLES[size],
        className,
      ].join(' ')}
    >
      {dot && (
        <span
          className={`h-1.5 w-1.5 rounded-full ${DOT_STYLES[variant]}`}
          aria-hidden="true"
        />
      )}
      {children}
    </span>
  );
}
