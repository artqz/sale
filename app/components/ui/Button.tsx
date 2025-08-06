import { Slot } from "@radix-ui/react-slot";
import { type VariantProps } from "class-variance-authority";
import type * as React from "react";

import { cn } from "~/utils/common";
import { buttonVariants } from "./buttonVariants";

export function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}
