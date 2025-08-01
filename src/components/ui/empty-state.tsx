import * as React from "react"
import { Button } from "./button"
import { cn } from "@/lib/utils"

interface EmptyStateProps {
  title: string
  description: string
  actionLabel: string
  onAction: () => void
  illustration?: React.ReactNode
  className?: string
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionLabel,
  onAction,
  illustration,
  className
}) => {
  return (
    <div className={cn("flex flex-col items-center justify-center p-8 text-center animate-fade-in", className)}>
      {illustration && (
        <div className="w-2/5 mb-6 opacity-60">
          {illustration}
        </div>
      )}
      <h3 className="text-xl font-display font-medium mb-2">{title}</h3>
      <p className="text-muted-foreground mb-6 max-w-[90ch]">{description}</p>
      <Button onClick={onAction} size="cta">
        {actionLabel}
      </Button>
    </div>
  )
}