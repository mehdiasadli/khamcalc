import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface StatsMetricCardProps {
  label: string
  value: string
  hint?: string
  className?: string
}

export function StatsMetricCard({
  label,
  value,
  hint,
  className,
}: StatsMetricCardProps) {
  return (
    <Card size="sm" className={cn("ring-foreground/5", className)}>
      <CardContent className="flex flex-col gap-1 py-4">
        <p className="font-mono text-[10px] tracking-wide text-muted-foreground uppercase">
          {label}
        </p>
        <p className="font-mono text-2xl leading-none tabular-nums">{value}</p>
        {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
      </CardContent>
    </Card>
  )
}
