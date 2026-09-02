import type { ButtonHTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * Button in the Beautiful UI motion language (pill, 150ms ease-out,
 * active:scale-[0.96]), mapped onto our paper/ink/spruce/crimson/bone tokens.
 */
export const buttonVariants = cva(
  `inline-flex items-center justify-center gap-3 font-medium select-none rounded-full
   transition-[transform,background-color,border-color,opacity] duration-150 ease-out
   active:scale-[0.96] disabled:opacity-50 disabled:pointer-events-none
   focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2
   focus-visible:outline-[color:var(--ink)]
   motion-reduce:transition-none motion-reduce:active:scale-100`,
  {
    variants: {
      variant: {
        primary:
          "bg-[color:var(--spruce)] text-[color:var(--paper)] border border-transparent hover:opacity-90",
        secondary:
          "bg-[color:var(--paper)] text-[color:var(--ink)] border border-[color:var(--bone)] hover:border-[color:var(--graphite)]",
        outline:
          "bg-[color:var(--paper)] text-[color:var(--ink)] border border-[color:var(--ink)] hover:opacity-85",
        fold: "bg-[color:var(--bone)] text-[color:var(--ink)] border border-transparent hover:opacity-90",
        raise:
          "bg-[color:var(--crimson)] text-[color:var(--paper)] border border-transparent hover:opacity-90",
        quiet:
          "bg-transparent text-[color:var(--graphite)] border border-transparent hover:text-[color:var(--ink)]",
      },
      size: {
        sm: "h-8 px-3.5 text-[13px] leading-none",
        md: "px-6 py-3 text-[15px] leading-none",
        lg: "h-[56px] w-[200px] text-[17px]",
        xl: "px-7 py-3.5 text-[16px]",
      },
    },
    defaultVariants: { variant: "secondary", size: "md" },
  },
);

export function Button({
  variant,
  size,
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof buttonVariants>) {
  return <button className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}
