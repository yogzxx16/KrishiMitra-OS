import React from 'react';
import { Check } from 'lucide-react';

interface Step {
  id: number;
  label: string;
}

interface StepperProps {
  steps: Step[];
  currentStep: number;
}

export function Stepper({ steps, currentStep }: StepperProps) {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = step.id < currentStep;
          const isCurrent = step.id === currentStep;
          const isLast = index === steps.length - 1;

          return (
            <React.Fragment key={step.id}>
              {/* Step Circle & Label */}
              <div className="flex flex-col items-center relative z-10 w-20">
                <div
                  className={`flex items-center justify-center w-8 h-8 rounded-full border-2 text-sm font-semibold mb-2 bg-white transition-colors ${
                    isCompleted
                      ? 'border-[var(--color-success)] text-[var(--color-success)]'
                      : isCurrent
                      ? 'border-[var(--color-goi-navy)] text-[var(--color-goi-navy)]'
                      : 'border-gray-300 text-gray-400'
                  }`}
                  aria-current={isCurrent ? 'step' : undefined}
                >
                  {isCompleted ? <Check className="w-4 h-4" strokeWidth={3} /> : step.id}
                </div>
                <span
                  className={`text-xs text-center font-medium ${
                    isCurrent ? 'text-[var(--color-goi-navy)]' : isCompleted ? 'text-gray-900' : 'text-gray-400'
                  }`}
                >
                  {step.label}
                </span>
              </div>

              {/* Connecting Line */}
              {!isLast && (
                <div className="flex-1 mx-2 h-0.5 relative top-[-10px]">
                  <div className="absolute inset-0 bg-gray-200" />
                  <div
                    className="absolute inset-0 bg-[var(--color-success)] transition-all duration-300 origin-left"
                    style={{ transform: `scaleX(${isCompleted ? 1 : 0})` }}
                  />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
