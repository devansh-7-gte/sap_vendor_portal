import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "btn group/button outline-none select-none focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-1 aria-invalid:ring-destructive/20 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "btn-v",
        outline: "btn-o",
        secondary: "btn-o",
        ghost: "btn-g",
        destructive: "btn-r",
        link: "text-[rgb(var(--color-emerald-default-rgb))] underline-offset-4 hover:underline",
      },
      size: {
        default: "", // Sizes are handled by .btn for default
        xs: "h-6 px-2 text-[10px] [&_svg:not([class*='size-'])]:size-3",
        sm: "h-7 px-2.5 text-[11px] [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-9 px-4",
        icon: "size-8 p-0",
        "icon-xs": "size-6 p-0 [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-7 p-0",
        "icon-lg": "size-9 p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
