import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
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

interface StatsChartPlaceholderProps {
  title: string
  description: string
}

export function StatsChartPlaceholder({
  title,
  description,
}: StatsChartPlaceholderProps) {
  return (
    <Card size="sm" className="ring-foreground/5">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex min-h-40 items-center justify-center rounded-2xl border border-dashed border-border bg-muted/20 px-4 text-center text-sm text-muted-foreground">
          Charts arrive in the next update
        </div>
      </CardContent>
    </Card>
  )
}
