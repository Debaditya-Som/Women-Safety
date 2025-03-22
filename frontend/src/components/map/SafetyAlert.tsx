import { AlertCircle, X } from "lucide-react"
import { useState, useEffect, useRef } from "react"
import { RouteSafetyAnalysis } from "./routeSafety"

interface SafetyAlertProps {
  routeSafety: RouteSafetyAnalysis | null
}

export default function SafetyAlert({ routeSafety }: SafetyAlertProps) {
  const [visible, setVisible] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    // Show alert if route has unsafe segments
    if (routeSafety && routeSafety.unsafePercentage > 0) {
      setVisible(true)
      
      // Auto-hide after 10 seconds
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      
      timeoutRef.current = setTimeout(() => {
        setVisible(false)
      }, 10000)
    } else {
      setVisible(false)
    }
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [routeSafety])
  
  if (!visible) return null
  
  return (
    <div className="absolute top-6 left-1/2 transform -translate-x-1/2 z-30 transition-all duration-500 ease-in-out">
      <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-3 flex items-center gap-3 max-w-md border-l-4 border-[#ef4444] animate-pulse">
        <div className="text-[#ef4444] flex-shrink-0">
          <AlertCircle className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <h3 className="font-medium text-sm">Caution: High-Risk Area</h3>
          <p className="text-xs text-gray-600 dark:text-gray-300">
            Your route passes through areas with recent harassment reports
          </p>
        </div>
        <button 
          className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
          onClick={() => setVisible(false)}
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
