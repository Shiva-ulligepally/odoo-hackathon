'use client';

import React from 'react';
import { Input, InputProps } from '../ui/Input';
import { cn } from '@/lib/utils';

export interface FormInputProps extends InputProps {
  label: string;
  error?: string;
}

export const FormInput = React.forwardRef<HTMLInputElement, FormInputProps>(
  ({ className, label, error, id, ...props }, ref) => {
    return (
      <div className="space-y-1.5 w-full">
        <label
          htmlFor={id}
          className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
        >
          {label}
        </label>
        <Input
          ref={ref}
          id={id}
          className={cn(
            error && 'border-destructive focus-visible:ring-destructive focus-visible:border-destructive',
            className
          )}
          {...props}
        />
        {error && (
          <p className="text-xs font-semibold text-destructive animate-fade-in">
            {error}
          </p>
        )}
      </div>
    );
  }
);

FormInput.displayName = 'FormInput';
