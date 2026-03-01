import { AlertTriangle, X } from "lucide-react"
import { useState, useEffect, useRef } from "react"
import { RouteSafetyAnalysis } from "./routeSafety"

interface SafetyAlertProps {
  routeSafety: RouteSafetyAnalysis | null
}

export default function SafetyAlert({ routeSafety }: SafetyAlertProps) {
  const [visible, setVisible] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (routeSafety && routeSafety.unsafePercentage > 0) {
      setVisible(true)
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      timeoutRef.current = setTimeout(() => setVisible(false), 10000)
    } else {
      setVisible(false)
    }
    return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current) }
  }, [routeSafety])

  if (!visible) return null

  return (
    <div className="absolute top-[4.5rem] left-3 right-3 md:top-4 md:left-1/2 md:right-auto md:-translate-x-1/2 md:w-auto md:max-w-sm z-30">
      <div className="bg-white dark:bg-gray-900 shadow-lg rounded-2xl border border-red-100 dark:border-red-900/40 overflow-hidden">
        {/* Red accent top bar */}
        <div className="h-0.5 bg-red-500 w-full" />
        <div className="flex items-start gap-3 px-4 py-3">
          <div className="w-8 h-8 rounded-xl bg-red-50 dark:bg-red-950/40 flex items-center justify-center shrink-0 mt-0.5">
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground leading-none mb-1">High-Risk Area</p>
            <p className="text-xs text-muted-foreground leading-snug">
              Your route passes through areas with recent harassment reports. Stay alert.
            </p>
          </div>
          <button
            onClick={() => setVisible(false)}
            className="w-6 h-6 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors shrink-0"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  )
}
