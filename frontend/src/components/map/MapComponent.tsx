"use client"

import { useEffect, useRef, useState } from "react"
import L from "leaflet"
import "leaflet.heat"
import harassmentData from "../../../public/harassment_reports.json"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { AlertCircle, Info } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

// Define severity levels with weights, colors, and descriptions
export const severityConfig = {
  low: { weight: 2, color: "#3b82f6", label: "Low" },
  medium: { weight: 4, color: "#10b981", label: "Medium" },
  high: { weight: 8, color: "#f59e0b", label: "High" },     // Increased from 6 to 8
  critical: { weight: 12, color: "#ef4444", label: "Critical" },  // Increased from 8 to 12
}

interface HeatmapLayerProps {
  map: L.Map | null
}

export default function HeatmapLayer({ map }: HeatmapLayerProps) {
  const layersRef = useRef<{ heatmap: L.LayerGroup | null }>({ heatmap: null })
  const [intensity, setIntensity] = useState<number>(1.0) // Higher default intensity
  const [radius, setRadius] = useState<number>(40) // Larger default radius
  const [blur, setBlur] = useState<number>(15)
  const [showLegend, setShowLegend] = useState<boolean>(true)
  const [darkMode, setDarkMode] = useState<boolean>(false)
  const [filterSeverity, setFilterSeverity] = useState<Record<string, boolean>>({
    low: true,
    medium: true,
    high: true,
    critical: true,
  })
  const [debugInfo, setDebugInfo] = useState<string>("")
  const initialRenderRef = useRef(true)

  // Generate gradient based on severity config
  const generateGradient = () => {
    return {
      0.2: severityConfig.low.color,
      0.5: severityConfig.medium.color,
      0.8: severityConfig.high.color,
      1.0: severityConfig.critical.color,
    }
  }

  useEffect(() => {
    if (!map) {
      setDebugInfo("Map not initialized")
      return
    }

    setDebugInfo("Map is ready")

    if (!harassmentData.reports || harassmentData.reports.length === 0) {
      setDebugInfo("No heatmap data available!")
      return
    }

    setDebugInfo(`Found ${harassmentData.reports.length} data points`)

    // Function to generate heatmap data with filtering
    const generateHeatmapData = () => {
      const filteredData = harassmentData.reports
        .filter((report) => {
          const severity = report.severity as keyof typeof severityConfig
          return filterSeverity[severity]
        })
        .map((report) => {
          const severity = report.severity as keyof typeof severityConfig
          // Multiply by intensity for better visibility
          return [report.latitude, report.longitude, severityConfig[severity]?.weight * intensity || 2 * intensity]
        })

      setDebugInfo(`Processed ${filteredData.length} points for heatmap`)
      return filteredData
    }

    // Clear any existing heatmap layers
    if (layersRef.current.heatmap) {
      layersRef.current.heatmap.clearLayers()
      map.removeLayer(layersRef.current.heatmap)
      layersRef.current.heatmap = null
    }

    // Create a new layer group
    layersRef.current.heatmap = L.layerGroup().addTo(map)

    // Function to update heatmap
    const updateHeatmap = () => {
      if (!layersRef.current.heatmap || !map) return

      // Clear existing layers
      layersRef.current.heatmap.clearLayers()

      // Generate heatmap data
      const heatmapData = generateHeatmapData()

      if (heatmapData.length === 0) {
        setDebugInfo("No data points after filtering")
        return
      }

      try {
        // Create heat layer with more visible settings
        const heatLayer = (L as any).heatLayer(heatmapData, {
          radius: radius,
          blur: blur,
          maxZoom: 18,
          minOpacity: 0.5, // Ensure minimum opacity for visibility
          gradient: generateGradient(),
        })

        // Add the heat layer to the layer group
        layersRef.current.heatmap.addLayer(heatLayer)

        // Remove the auto-fitting bounds code
        setDebugInfo(`Heatmap rendered with ${heatmapData.length} points`)
      } catch (error) {
        setDebugInfo(`Error creating heatmap: ${error}`)
      }
    }

    // Initial heatmap render
    updateHeatmap()

    // Make sure to remove the zoomend event handler - it's not needed
    // and could be causing issues with zoom functionality

    return () => {
      if (layersRef.current.heatmap) {
        layersRef.current.heatmap.clearLayers()
        map.removeLayer(layersRef.current.heatmap)
      }
    }
  }, [map, radius, blur, intensity, filterSeverity])

  // Toggle severity filter
  const toggleSeverity = (severity: string) => {
    setFilterSeverity((prev) => ({
      ...prev,
      [severity]: !prev[severity],
    }))
  }

  return (
    <>
      <div className={`fixed bottom-4 right-4 z-[1000] flex flex-col gap-2 ${darkMode ? "dark" : ""}`}>
        {/* Debug Info */}
        <Card className="p-2 w-64 bg-background shadow-lg border border-border">
          <p className="text-xs text-foreground">Status: {debugInfo}</p>
        </Card>

        {/* Controls Card */}
        <Card className="p-4 w-64 bg-background shadow-lg border border-border">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-medium text-foreground">Heatmap Controls</h3>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="w-60">Adjust these settings to customize the heatmap visualization</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="intensity">Intensity: {Math.round(intensity * 100)}%</Label>
              </div>
              <Slider
                id="intensity"
                min={0.1}
                max={2.0}
                step={0.1}
                value={[intensity]}
                onValueChange={(value) => setIntensity(value[0])}
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="radius">Radius: {radius}px</Label>
              </div>
              <Slider
                id="radius"
                min={10}
                max={80}
                step={5}
                value={[radius]}
                onValueChange={(value) => setRadius(value[0])}
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="blur">Blur: {blur}px</Label>
              </div>
              <Slider id="blur" min={0} max={30} step={1} value={[blur]} onValueChange={(value) => setBlur(value[0])} />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="legend-toggle">Show Legend</Label>
              <Switch id="legend-toggle" checked={showLegend} onCheckedChange={setShowLegend} />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="dark-mode">Dark Mode</Label>
              <Switch id="dark-mode" checked={darkMode} onCheckedChange={setDarkMode} />
            </div>

            <div className="space-y-2">
              <Label>Filter by Severity</Label>
              <div className="flex flex-wrap gap-2">
                {Object.entries(severityConfig).map(([key, config]) => (
                  <Badge
                    key={key}
                    variant={filterSeverity[key] ? "default" : "outline"}
                    className="cursor-pointer"
                    style={{
                      backgroundColor: filterSeverity[key] ? config.color : "transparent",
                      color: filterSeverity[key] ? "white" : "inherit",
                      borderColor: config.color,
                    }}
                    onClick={() => toggleSeverity(key)}
                  >
                    {config.label}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Legend Card */}
        {showLegend && (
          <Card className="p-4 w-64 bg-background shadow-lg border border-border">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-medium text-foreground">Severity Legend</h3>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="space-y-2">
              {Object.entries(severityConfig).map(([key, config]) => (
                <div key={key} className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: config.color }} />
                  <span className="text-sm text-foreground">{config.label}</span>
                </div>
              ))}
            </div>
            <div className="mt-3">
              <div className="w-full h-4 rounded-full bg-gradient-to-r from-blue-500 via-green-500 via-yellow-500 to-red-500" />
              <div className="flex justify-between mt-1">
                <span className="text-xs text-muted-foreground">Low</span>
                <span className="text-xs text-muted-foreground">Critical</span>
              </div>
            </div>
          </Card>
        )}
      </div>
    </>
  )
}
