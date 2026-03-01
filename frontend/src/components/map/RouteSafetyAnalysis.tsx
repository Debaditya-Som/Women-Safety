import { cn } from "@/lib/utils"
import { formatDistance, RouteSafetyAnalysis as RouteSafetyAnalysisType } from "./routeSafety"

interface RouteSafetyAnalysisProps {
  routeSafety: RouteSafetyAnalysisType | null
  showAnalysis: boolean
}

export default function RouteSafetyAnalysis({ routeSafety, showAnalysis }: RouteSafetyAnalysisProps) {
  if (!routeSafety || !showAnalysis) return null

  const scoreColor = (score: number) =>
    score >= 75 ? "text-emerald-600"
    : score >= 50 ? "text-amber-600"
    : "text-red-600"

  // Position of the score indicator on the 0–100 gradient bar
  const indicatorLeft = `calc(${Math.min(Math.max(routeSafety.overallScore, 0), 100)}% - 6px)`

  const segments = [
    { pct: routeSafety.safePercentage,     color: "bg-emerald-500", label: "Safe",      text: "text-emerald-600", dist: routeSafety.totalDistance * routeSafety.safePercentage / 100 },
    { pct: routeSafety.moderatePercentage, color: "bg-amber-400",   label: "Moderate",  text: "text-amber-600",   dist: routeSafety.totalDistance * routeSafety.moderatePercentage / 100 },
    { pct: routeSafety.unsafePercentage,   color: "bg-red-500",     label: "High Risk", text: "text-red-600",     dist: routeSafety.totalDistance * routeSafety.unsafePercentage / 100 },
  ].filter(({ pct }) => pct > 0)

  return (
    <div className="rounded-xl border border-border/50 bg-muted/20 p-3.5 space-y-3.5">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <svg className="w-3.5 h-3.5 text-primary shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
          <span className="text-xs font-semibold">Route Safety</span>
        </div>
        <span className={cn("text-sm font-bold tabular-nums", scoreColor(routeSafety.overallScore))}>
          {routeSafety.overallScore}
          <span className="text-[10px] font-normal text-muted-foreground"> / 100</span>
        </span>
      </div>

      {/* Gradient bar + indicator */}
      <div className="relative pt-0.5 pb-3">
        <div className="h-2 rounded-full bg-gradient-to-r from-[#ef4444] via-[#f59e0b] to-[#10b981]" />
        <div
          className="absolute top-0.5 w-3 h-3 rounded-full bg-white border-2 border-gray-600 shadow-sm transition-all duration-500"
          style={{ left: indicatorLeft }}
        />
        <div className="absolute bottom-0 left-0 right-0 flex justify-between">
          <span className="text-[10px] text-muted-foreground">High Risk</span>
          <span className="text-[10px] text-muted-foreground">Safe</span>
        </div>
      </div>

      {/* Per-segment breakdown */}
      <div className="space-y-2">
        {segments.map(({ pct, color, label, text, dist }) => (
          <div key={label} className="flex items-center gap-2">
            <div className={cn("w-1.5 h-1.5 rounded-full shrink-0", color)} />
            <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
              <div className={cn("h-full rounded-full", color)} style={{ width: `${pct}%` }} />
            </div>
            <span className={cn("text-[10px] font-semibold tabular-nums w-7 text-right shrink-0", text)}>{pct}%</span>
            <span className="text-[10px] text-muted-foreground w-16 shrink-0">{label}</span>
            <span className="text-[10px] text-muted-foreground/70 shrink-0">{formatDistance(dist)}</span>
          </div>
        ))}
      </div>

      {/* High-risk zone notice */}
      {routeSafety.highRiskZoneCount > 0 && (
        <p className="text-[10px] text-red-600 bg-red-50 dark:bg-red-950/30 px-2.5 py-1.5 rounded-lg leading-snug">
          ⚠ Route passes through {routeSafety.highRiskZoneCount} high-risk {routeSafety.highRiskZoneCount === 1 ? "zone" : "zones"}
        </p>
      )}
    </div>
  )
}
