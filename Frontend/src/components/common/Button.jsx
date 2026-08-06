import React, { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../../utils/cn';

const VARIANT_CLASS = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  ghost: 'btn-ghost',
};

/**
 * Shared button primitive. All CTAs across Landing, Auth, and future
 * dashboards should use this instead of raw <button> markup so hover/
 * focus/disabled/loading states stay consistent.
 */
const Button = forwardRef(function Button(
  { as: Component = 'button', variant = 'primary', isLoading = false, className, children, disabled, ...props },
  ref
) {
  return (
    <Component
      ref={ref}
      className={cn(VARIANT_CLASS[variant] || VARIANT_CLASS.primary, className)}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
      {children}
    </Component>
  );
});

export default Button;
