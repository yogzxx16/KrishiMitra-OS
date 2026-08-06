import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
  as?: 'div' | 'article' | 'section';
}

export function Card({
  children,
  className = '',
  hover = false,
  onClick,
  as: Tag = 'div',
}: CardProps) {
  const baseClasses = 'bg-white border border-gray-200 rounded-lg shadow-sm';

  return (
    <Tag
      className={[
        baseClasses,
        hover ? 'hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e: React.KeyboardEvent) => (e.key === 'Enter' || e.key === ' ') && onClick()
          : undefined
      }
    >
      {children}
    </Tag>
  );
}

// ─── Sub-components ────────────────────────────────────────────────────────────

interface CardSectionProps {
  children: React.ReactNode;
  className?: string;
}

export function CardHeader({ children, className = '' }: CardSectionProps) {
  return (
    <div className={`px-5 py-4 border-b border-gray-100 ${className}`}>{children}</div>
  );
}

export function CardBody({ children, className = '' }: CardSectionProps) {
  return <div className={`p-5 ${className}`}>{children}</div>;
}

export function CardFooter({ children, className = '' }: CardSectionProps) {
  return (
    <div className={`px-5 py-4 border-t border-gray-100 bg-gray-50 rounded-b-lg ${className}`}>
      {children}
    </div>
  );
}
