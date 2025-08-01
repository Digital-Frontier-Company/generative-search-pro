import * as React from "react"
import { cn } from "@/lib/utils"

interface AnimatedProgressProps {
  value: number
  size?: number
  strokeWidth?: number
  className?: string
}

export const AnimatedProgress = React.forwardRef<
  SVGSVGElement,
  AnimatedProgressProps
>(({ value, size = 96, strokeWidth = 8, className }, ref) => {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const strokeDasharray = `${(value / 100) * circumference} ${circumference}`

  return (
    <div className={cn("relative flex items-center justify-center", className)}>
      <svg
        ref={ref}
        className="progress-ring"
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="hsl(var(--border))"
          strokeWidth={strokeWidth}
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={circumference - (value / 100) * circumference}
          className="progress-ring-circle animate-progress-fill"
          style={{
            '--dash-array': (value / 100) * circumference
          } as React.CSSProperties}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-2xl font-bold text-primary">{value}</span>
      </div>
    </div>
  )
})

AnimatedProgress.displayName = "AnimatedProgress"