import React from 'react';

interface SegmentOption<T extends string> {
  label: string;
  value: T;
  icon?: React.ReactNode;
}

interface SegmentedControlProps<T extends string> {
  options: SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
  'aria-label'?: string;
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  className = '',
  'aria-label': ariaLabel,
}: SegmentedControlProps<T>) {
  return (
    <div
      className={`flex bg-gray-100 rounded-lg p-1 border border-gray-200 ${className}`}
      role="radiogroup"
      aria-label={ariaLabel}
    >
      {options.map((option) => {
        const isActive = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={isActive}
            onClick={() => onChange(option.value)}
            className={[
              'relative flex-1 flex items-center justify-center gap-2 px-3 py-2.5 text-sm font-semibold',
              'rounded-md transition-colors duration-150 min-h-[44px]',
              isActive
                ? 'bg-white text-[var(--color-goi-navy)] shadow-sm border border-gray-200'
                : 'text-gray-600 hover:text-gray-900 border border-transparent',
            ].join(' ')}
          >
            <span className="flex items-center gap-1.5">
              {option.icon && <span aria-hidden="true">{option.icon}</span>}
              {option.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
