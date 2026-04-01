import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
    "inline-flex items-center rounded-xl border px-3 py-1 text-[9px] font-black uppercase tracking-[0.2em] transition-all focus:outline-none focus:ring-1 focus:ring-ring active:scale-95",
    {
        variants: {
            variant: {
                default:
                    "border-transparent bg-foreground text-background shadow-lg",
                secondary:
                    "border-border bg-muted text-muted-foreground",
                destructive:
                    "border-transparent bg-foreground text-background group-hover:bg-destructive group-hover:text-destructive-foreground",
                outline: "text-foreground border-border hover:border-foreground",
            },
        },
        defaultVariants: {
            variant: "default",
        },
    },
)

export interface BadgeProps
    extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> { }

function Badge({ className, variant, ...props }: BadgeProps) {
    return (
        <div className={cn(badgeVariants({ variant }), className)} {...props} />
    )
}

export { Badge, badgeVariants }
