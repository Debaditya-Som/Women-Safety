import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Info } from "lucide-react"
import { formatDistance, RouteSafetyAnalysis as RouteSafetyAnalysisType } from "./routeSafety"

interface RouteSafetyAnalysisProps {
  routeSafety: RouteSafetyAnalysisType | null
  showAnalysis: boolean
}

export default function RouteSafetyAnalysis({ routeSafety, showAnalysis }: RouteSafetyAnalysisProps) {
  if (!routeSafety || !showAnalysis) return null

  // Determine color for safety score
  const getSafetyScoreColor = (score: number) => {
    if (score >= 75) return "text-[#10b981]" // Safe - Green
    if (score >= 50) return "text-[#f59e0b]" // Moderate - Orange
    return "text-[#ef4444]" // Unsafe - Red
  }

  return (
    <Card className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-4 border border-gray-200 dark:border-gray-700">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-medium text-sm flex items-center">
          <svg 
            className="w-4 h-4 mr-2 text-primary" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
          Route Safety Analysis
        </h3>
        <Badge variant="outline" className="bg-[#ef4444]/10 text-[#ef4444] border-[#ef4444]/20">New</Badge>
      </div>
      
      <div className="space-y-4">
        {/* Safety Score */}
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span>Route Safety Score</span>
            <span className={`font-medium ${getSafetyScoreColor(routeSafety.overallScore)}`}>
              {routeSafety.overallScore}/100
            </span>
          </div>
          <div className="h-2 rounded-full bg-gradient-to-r from-[#ef4444] via-[#f59e0b] to-[#10b981]"></div>
          <div className="flex justify-between mt-1 text-[10px] text-gray-500 dark:text-gray-400">
            <span>High Risk</span>
            <span>Low Risk</span>
          </div>
        </div>
        
        {/* Safety Breakdown */}
        <div className="space-y-1.5">
          <h4 className="text-xs font-medium">Route Analysis</h4>
          
          {routeSafety.unsafePercentage > 0 && (
            <div className="flex items-center text-xs py-1.5 border-b border-gray-100 dark:border-gray-700">
              <div className="w-3 h-3 rounded-full bg-[#ef4444] mr-2"></div>
              <span className="flex-1">
                High risk segments ({formatDistance(routeSafety.totalDistance * routeSafety.unsafePercentage / 100)})
              </span>
              <span className="text-[#ef4444] font-medium">{routeSafety.unsafePercentage}%</span>
            </div>
          )}
          
          {routeSafety.moderatePercentage > 0 && (
            <div className="flex items-center text-xs py-1.5 border-b border-gray-100 dark:border-gray-700">
              <div className="w-3 h-3 rounded-full bg-[#f59e0b] mr-2"></div>
              <span className="flex-1">
                Moderate risk segments ({formatDistance(routeSafety.totalDistance * routeSafety.moderatePercentage / 100)})
              </span>
              <span className="text-[#f59e0b] font-medium">{routeSafety.moderatePercentage}%</span>
            </div>
          )}
          
          {routeSafety.safePercentage > 0 && (
            <div className="flex items-center text-xs py-1.5">
              <div className="w-3 h-3 rounded-full bg-[#10b981] mr-2"></div>
              <span className="flex-1">
                Safe segments ({formatDistance(routeSafety.totalDistance * routeSafety.safePercentage / 100)})
              </span>
              <span className="text-[#10b981] font-medium">{routeSafety.safePercentage}%</span>
            </div>
          )}
        </div>
        
        {routeSafety.highRiskZoneCount > 0 && (
          <div className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 p-2 rounded flex items-start">
            <Info className="h-3 w-3 mt-0.5 mr-1 flex-shrink-0" />
            <span>
              This route passes through {routeSafety.highRiskZoneCount} reported harassment {routeSafety.highRiskZoneCount === 1 ? 'zone' : 'zones'}
            </span>
          </div>
        )}
      </div>
    </Card>
  )
}
