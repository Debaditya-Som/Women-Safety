"use client"

import { useEffect, useRef, useState } from "react"
import L from "leaflet"
import "leaflet.heat"
import harassmentData from "../../../public/harassment_reports.json"
import { Layers, X } from "lucide-react"

// Severity weights used for heatmap intensity and filter badge colors.
// NOTE: The heatmap gradient (amber→red) is separate from these badge colors —
// badge colors represent individual severity categories, gradient represents density.
export const severityConfig = {
  low:      { weight: 2,  color: "#f59e0b", label: "Low" },
  medium:   { weight: 5,  color: "#f97316", label: "Medium" },
  high:     { weight: 9,  color: "#ef4444", label: "High" },
  critical: { weight: 14, color: "#b91c1c", label: "Critical" },
}

// Semantic gradient: transparent at zero density → amber → orange → dark red.
// Every color on this scale means RISK — no misleading blue/green "safe" tones.
const HEATMAP_GRADIENT = {
  0.0: "rgba(251,191,36,0)",   // transparent (no incidents)
  0.3: "#fbbf24",              // amber   – sparse incidents
  0.55: "#f97316",             // orange  – moderate density
  0.8: "#ef4444",              // red     – high density
  1.0: "#991b1b",              // dark red – critical cluster
}

interface HeatmapLayerProps {
  map: L.Map | null
  visible: boolean
}

export default function HeatmapLayer({ map, visible }: HeatmapLayerProps) {
  const layersRef = useRef<{ heatmap: L.LayerGroup | null }>({ heatmap: null })
  const [isPanelOpen, setIsPanelOpen] = useState(false)
  const [filterSeverity, setFilterSeverity] = useState<Record<string, boolean>>({
    low: true, medium: true, high: true, critical: true,
  })

  // Fixed visual defaults — tuned for good coverage without noise
  const RADIUS = 40
  const BLUR   = 15

  useEffect(() => {
    // Clear existing layer whenever visibility or filters change
    if (layersRef.current.heatmap) {
      layersRef.current.heatmap.clearLayers()
      map?.removeLayer(layersRef.current.heatmap)
      layersRef.current.heatmap = null
    }

    if (!map || !visible || !harassmentData.reports?.length) return

    layersRef.current.heatmap = L.layerGroup().addTo(map)

    const points = harassmentData.reports
      .filter((r) => filterSeverity[r.severity as keyof typeof severityConfig])
      .map((r) => {
        const sev = r.severity as keyof typeof severityConfig
        return [r.latitude, r.longitude, severityConfig[sev]?.weight ?? 2]
      })

    if (!points.length) return

    try {
      const heat = (L as any).heatLayer(points, {
        radius: RADIUS,
        blur: BLUR,
        maxZoom: 18,
        minOpacity: 0.35,
        gradient: HEATMAP_GRADIENT,
      })
      layersRef.current.heatmap.addLayer(heat)
    } catch (err) {
      console.error("Heatmap error:", err)
    }

    return () => {
      if (layersRef.current.heatmap) {
        layersRef.current.heatmap.clearLayers()
        map?.removeLayer(layersRef.current.heatmap)
      }
    }
  }, [map, visible, filterSeverity])

  const toggleSeverity = (key: string) =>
    setFilterSeverity((prev) => ({ ...prev, [key]: !prev[key] }))

  if (!visible) return null

  return (
    <div className="fixed bottom-20 right-4 z-[1000] flex flex-col items-end gap-2">
      {/* Expanded panel */}
      {isPanelOpen && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-border/50 p-4 w-52 mb-1">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-semibold">Incident Heatmap</h3>
            <button
              onClick={() => setIsPanelOpen(false)}
              className="w-5 h-5 rounded-full flex items-center justify-center hover:bg-muted transition-colors"
            >
              <X className="h-3 w-3 text-muted-foreground" />
            </button>
          </div>

          {/* Gradient legend — matches HEATMAP_GRADIENT above */}
          <div className="mb-3">
            <div className="h-2 rounded-full bg-gradient-to-r from-amber-400 via-orange-500 to-red-800" />
            <div className="flex justify-between mt-1">
              <span className="text-[10px] text-muted-foreground">Few reports</span>
              <span className="text-[10px] text-muted-foreground">High density</span>
            </div>
          </div>

          {/* Severity filter */}
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
              Filter severity
            </p>
            <div className="flex flex-wrap gap-1.5">
              {Object.entries(severityConfig).map(([key, cfg]) => (
                <button
                  key={key}
                  onClick={() => toggleSeverity(key)}
                  className="flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-medium border transition-all"
                  style={{
                    backgroundColor: filterSeverity[key] ? cfg.color + "20" : "transparent",
                    borderColor:      cfg.color + "80",
                    color:            filterSeverity[key] ? cfg.color : "#9ca3af",
                  }}
                >
                  <div
                    className="w-1.5 h-1.5 rounded-full shrink-0"
                    style={{ backgroundColor: filterSeverity[key] ? cfg.color : "#d1d5db" }}
                  />
                  {cfg.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Toggle button — only shows when incidents layer is on */}
      <button
        onClick={() => setIsPanelOpen((v) => !v)}
        className="w-10 h-10 bg-white dark:bg-gray-800 rounded-full shadow-lg border border-border/50 flex items-center justify-center hover:bg-muted/60 transition-colors"
        title="Incident heatmap filter"
      >
        <Layers className="h-4 w-4 text-foreground/70" />
      </button>
    </div>
  )
}
