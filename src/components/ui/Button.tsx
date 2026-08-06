import React from 'react';
import { Loader2 } from 'lucide-react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'amber';
type ButtonSize = 'sm' | 'md' | 'lg' | 'xl';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:
    'bg-[var(--color-goi-green)] hover:bg-[var(--color-goi-green-dark)] text-white border border-transparent shadow-sm',
  secondary:
    'bg-white hover:bg-gray-50 text-gray-800 border border-gray-300 shadow-sm',
  ghost:
    'bg-transparent hover:bg-gray-100 text-gray-700 border border-transparent',
  danger:
    'bg-[var(--color-error)] hover:bg-[#B71C1C] text-white border border-transparent shadow-sm',
  amber:
    'bg-[var(--color-goi-saffron)] hover:bg-[var(--color-goi-saffron-dark)] text-white border border-transparent shadow-sm',
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-xs rounded min-h-[44px]', /* 44px min touch target */
  md: 'px-4 py-2 text-sm rounded min-h-[48px]',
  lg: 'px-6 py-3 text-base rounded min-h-[56px]',
  xl: 'px-8 py-4 text-lg rounded min-h-[64px]',
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      children,
      className = '',
      disabled,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || isLoading;

    return (
      <button
        ref={ref}
        {...props}
        className={[
          'inline-flex items-center justify-center gap-2 font-semibold',
          'transition-colors duration-200',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-goi-saffron)] focus-visible:ring-offset-2',
          'select-none cursor-pointer',
          VARIANT_CLASSES[variant],
          SIZE_CLASSES[size],
          fullWidth ? 'w-full' : '',
          isDisabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : '',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        disabled={isDisabled}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        ) : (
          leftIcon && <span aria-hidden="true">{leftIcon}</span>
        )}
        {children}
        {!isLoading && rightIcon && (
          <span aria-hidden="true">{rightIcon}</span>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
