import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, Check, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useFormValidation } from '@/hooks/useFormValidation';
import { useAnalytics } from '@/hooks/useAnalytics';

interface SmartInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  onValidation?: (isValid: boolean, error?: string) => void;
  validationRules?: any;
  helpText?: string;
  showValidationIcon?: boolean;
  realTimeValidation?: boolean;
  debounceMs?: number;
  formName?: string;
  required?: boolean;
}

export const SmartInput: React.FC<SmartInputProps> = ({
  label,
  name,
  value,
  onChange,
  onValidation,
  validationRules,
  helpText,
  showValidationIcon = true,
  realTimeValidation = true,
  debounceMs = 300,
  formName = 'unknown',
  required = false,
  className,
  ...inputProps
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [hasStartedTyping, setHasStartedTyping] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();
  
  const { trackFormInteraction } = useAnalytics();
  
  const rules = validationRules || {};
  if (required) rules.required = true;
  
  const { 
    validateSingleField, 
    markFieldTouched, 
    getFieldError, 
    hasFieldError 
  } = useFormValidation({ [name]: rules });

  const error = getFieldError(name);
  const hasError = hasFieldError(name);
  const isValid = !hasError && hasStartedTyping && value.length > 0;

  // Debounced validation
  useEffect(() => {
    if (!realTimeValidation || !hasStartedTyping) return;

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setIsValidating(true);
      const valid = validateSingleField(name, value);
      setIsValidating(false);
      
      if (onValidation) {
        onValidation(valid, error);
      }
    }, debounceMs);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [value, realTimeValidation, hasStartedTyping, debounceMs, name, validateSingleField, onValidation, error]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    
    if (!hasStartedTyping && newValue.length > 0) {
      setHasStartedTyping(true);
      trackFormInteraction(formName, 'start', name);
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
    markFieldTouched(name);
  };

  const handleBlur = () => {
    setIsFocused(false);
    
    if (hasStartedTyping) {
      const valid = validateSingleField(name, value);
      if (onValidation) {
        onValidation(valid, error);
      }
      
      // Track form interaction
      if (hasError) {
        trackFormInteraction(formName, 'error', name);
      } else if (value.length > 0) {
        trackFormInteraction(formName, 'complete', name);
      }
    }
  };

  const getInputClassName = () => {
    return cn(
      "transition-all duration-200",
      hasError && "border-red-500 focus:border-red-500 focus:ring-red-500/20",
      isValid && "border-matrix-green focus:border-matrix-green focus:ring-matrix-green/20",
      isFocused && !hasError && !isValid && "border-matrix-lime focus:border-matrix-lime focus:ring-matrix-lime/20",
      className
    );
  };

  const getValidationIcon = () => {
    if (!showValidationIcon) return null;
    
    if (isValidating) {
      return <Loader2 className="w-4 h-4 text-matrix-green animate-spin" />;
    }
    
    if (hasError) {
      return <AlertCircle className="w-4 h-4 text-red-500" />;
    }
    
    if (isValid) {
      return <Check className="w-4 h-4 text-matrix-green" />;
    }
    
    return null;
  };

  return (
    <div className="space-y-2">
      <Label 
        htmlFor={name}
        className={cn(
          "text-sm font-medium transition-colors",
          hasError && "text-red-500",
          isValid && "text-matrix-green",
          isFocused && !hasError && !isValid && "text-matrix-lime"
        )}
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      
      <div className="relative">
        <Input
          {...inputProps}
          id={name}
          name={name}
          value={value}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          className={getInputClassName()}
          aria-invalid={hasError}
          aria-describedby={`${name}-error ${name}-help`}
        />
        
        {showValidationIcon && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            {getValidationIcon()}
          </div>
        )}
      </div>
      
      {helpText && !hasError && (
        <p 
          id={`${name}-help`}
          className="text-xs text-matrix-green/60"
        >
          {helpText}
        </p>
      )}
      
      {hasError && error && (
        <p 
          id={`${name}-error`}
          className="text-xs text-red-500 flex items-center space-x-1"
          role="alert"
        >
          <AlertCircle className="w-3 h-3" />
          <span>{error}</span>
        </p>
      )}
      
      {isValid && (
        <p className="text-xs text-matrix-green flex items-center space-x-1">
          <Check className="w-3 h-3" />
          <span>Looks good!</span>
        </p>
      )}
    </div>
  );
};