import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import * as React from "react";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-[var(--accent-primary)] text-[var(--btn-primary-text)] shadow hover:bg-[var(--accent-hover)]",
        destructive: "bg-[var(--danger-warning)] text-[var(--btn-primary-text)] shadow-sm hover:brightness-90",
        outline: "border border-[var(--border-subtle)] bg-transparent shadow-sm hover:bg-[var(--surface-2)] hover:text-[var(--text-primary)]",
        secondary: "bg-[var(--surface-2)] text-[var(--text-primary)] shadow-sm hover:bg-[var(--surface-1)]",
        ghost: "hover:bg-[var(--surface-2)] hover:text-[var(--text-primary)]",
        link: "text-[var(--accent-primary)] underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-lg px-3 text-xs",
        lg: "h-10 rounded-lg px-8",
        icon: "h-9 w-9", // Icon buttons usually are square, so radius might be handled differently or be less noticeable. Keeping "w-9" as is.
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };