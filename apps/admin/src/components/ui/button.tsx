"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium",
          "transition-colors focus-visible:outline-none disabled:opacity-50 disabled:pointer-events-none",
          className,
        )}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

