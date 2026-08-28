import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-[transform,background-color,color,opacity,border-color] duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg disabled:pointer-events-none disabled:opacity-40 active:not-disabled:scale-[0.96] [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary:
          "bg-primary text-primary-fg shadow-[0_8px_24px_color-mix(in_oklab,var(--color-primary)_45%,transparent)] hover:opacity-90",
        secondary: "bg-raised text-fg border border-border hover:border-border-strong",
        ghost: "bg-transparent text-fg hover:bg-raised",
        outline: "bg-transparent text-fg border border-border-strong hover:bg-raised",
        cyan: "bg-cyan text-cyan-fg shadow-[0_8px_24px_color-mix(in_oklab,var(--color-cyan)_40%,transparent)] hover:opacity-90",
        sun: "bg-sun text-sun-fg hover:opacity-90",
      },
      size: {
        sm: "h-10 px-3 text-sm rounded-md",
        md: "h-12 px-4 text-base rounded-lg",
        lg: "h-14 px-5 text-lg rounded-xl",
        icon: "size-11 rounded-lg",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export function Button({
  className,
  variant,
  size,
  asChild,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp className={cn(buttonVariants({ variant, size }), className)} {...props} />
  );
}
