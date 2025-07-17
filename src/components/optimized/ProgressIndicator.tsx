import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Step {
  id: string;
  title: string;
  description?: string;
}

interface ProgressIndicatorProps {
  steps: Step[];
  currentStep: number;
  variant?: 'default' | 'minimal' | 'detailed';
  className?: string;
}

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  steps,
  currentStep,
  variant = 'default',
  className,
}) => {
  const getStepStatus = (stepIndex: number) => {
    if (stepIndex < currentStep) return 'completed';
    if (stepIndex === currentStep) return 'current';
    return 'upcoming';
  };

  if (variant === 'minimal') {
    return (
      <div className={cn("flex items-center justify-center space-x-2", className)}>
        <div className="text-sm text-matrix-green">
          Step {currentStep + 1} of {steps.length}
        </div>
        <div className="flex space-x-1">
          {steps.map((_, index) => (
            <div
              key={index}
              className={cn(
                "w-2 h-2 rounded-full transition-colors",
                getStepStatus(index) === 'completed' && "bg-matrix-green",
                getStepStatus(index) === 'current' && "bg-matrix-lime",
                getStepStatus(index) === 'upcoming' && "bg-matrix-green/30"
              )}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("w-full", className)}>
      {variant === 'detailed' && (
        <div className="mb-4 text-center">
          <h3 className="text-lg font-semibold text-matrix-green">
            {steps[currentStep]?.title}
          </h3>
          {steps[currentStep]?.description && (
            <p className="text-sm text-matrix-green/70 mt-1">
              {steps[currentStep].description}
            </p>
          )}
        </div>
      )}

      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const status = getStepStatus(index);
          const isLast = index === steps.length - 1;

          return (
            <div key={step.id} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-200",
                    status === 'completed' && "bg-matrix-green text-black",
                    status === 'current' && "bg-matrix-lime text-black ring-2 ring-matrix-lime ring-offset-2 ring-offset-background",
                    status === 'upcoming' && "bg-matrix-green/20 text-matrix-green border border-matrix-green/30"
                  )}
                >
                  {status === 'completed' ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </div>
                
                {variant === 'default' && (
                  <div className="mt-2 text-center">
                    <div className={cn(
                      "text-xs font-medium",
                      status === 'current' && "text-matrix-lime",
                      status === 'completed' && "text-matrix-green",
                      status === 'upcoming' && "text-matrix-green/60"
                    )}>
                      {step.title}
                    </div>
                  </div>
                )}
              </div>

              {!isLast && (
                <div
                  className={cn(
                    "flex-1 h-0.5 mx-4 transition-colors duration-200",
                    index < currentStep ? "bg-matrix-green" : "bg-matrix-green/20"
                  )}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Progress bar */}
      <div className="mt-4">
        <div className="flex justify-between text-xs text-matrix-green/60 mb-1">
          <span>Progress</span>
          <span>{Math.round(((currentStep) / (steps.length - 1)) * 100)}% Complete</span>
        </div>
        <div className="w-full bg-matrix-green/20 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-matrix-green to-matrix-lime h-2 rounded-full transition-all duration-500 ease-out"
            style={{
              width: `${Math.max(5, ((currentStep) / (steps.length - 1)) * 100)}%`,
            }}
          />
        </div>
      </div>
    </div>
  );
};

// Common step configurations
export const commonStepConfigurations = {
  onboarding: [
    { id: 'welcome', title: 'Welcome', description: 'Get started with GenerativeSearch.pro' },
    { id: 'account', title: 'Account', description: 'Set up your account details' },
    { id: 'preferences', title: 'Preferences', description: 'Configure your optimization settings' },
    { id: 'complete', title: 'Complete', description: 'You\'re all set!' },
  ],
  analysis: [
    { id: 'input', title: 'Input', description: 'Enter your website or content' },
    { id: 'scanning', title: 'Scanning', description: 'Analyzing your AI visibility' },
    { id: 'processing', title: 'Processing', description: 'Generating optimization recommendations' },
    { id: 'results', title: 'Results', description: 'Your AI optimization report is ready' },
  ],
  subscription: [
    { id: 'plan', title: 'Plan', description: 'Choose your subscription tier' },
    { id: 'payment', title: 'Payment', description: 'Enter billing information' },
    { id: 'confirmation', title: 'Confirm', description: 'Review and confirm your subscription' },
  ],
};