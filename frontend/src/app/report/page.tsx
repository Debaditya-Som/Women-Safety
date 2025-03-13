"use client"
import type React from "react"
import { useState } from "react"
import dynamic from "next/dynamic"
import { AlertTriangle, MapPin, Send, CheckCircle2, Loader2, ChevronDown, Info } from "lucide-react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import L from "leaflet" 


const MapContainer = dynamic(() => import("react-leaflet").then((mod) => mod.MapContainer), { ssr: false })
const TileLayer = dynamic(() => import("react-leaflet").then((mod) => mod.TileLayer), { ssr: false })
const Marker = dynamic(() => import("react-leaflet").then((mod) => mod.Marker), { ssr: false })
const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), { ssr: false })

const LocationPicker = dynamic(
  () =>
    import("react-leaflet").then((mod) => {
      const { useMapEvents } = mod
      return ({ onLocationSelect }: { onLocationSelect: (lat: number, lng: number) => void }) => {
        useMapEvents({
          click(e) {
            onLocationSelect(e.latlng.lat, e.latlng.lng)
          },
        })
        return null
      }
    }),
  { ssr: false },
)

const incidentTypes = [
  {
    id: "harassment",
    label: "Harassment",
    description: "Verbal, physical, or sexual harassment in public or private spaces",
    icon: "🚫",
  },
  {
    id: "assault",
    label: "Assault",
    description: "Physical or sexual assault",
    icon: "⚠️",
  },
  {
    id: "stalking",
    label: "Stalking",
    description: "Being followed, watched, or repeatedly contacted",
    icon: "👁️",
  },
  {
    id: "unsafe_area",
    label: "Unsafe Area",
    description: "Areas with poor lighting, isolation, or known safety concerns",
    icon: "🔍",
  },
  {
    id: "domestic_violence",
    label: "Domestic Violence",
    description: "Violence or abuse in a domestic setting",
    icon: "🏠",
  },
  {
    id: "other",
    label: "Other",
    description: "Any other safety concern not listed above",
    icon: "❓",
  },
]

const severityLevels = [
  { id: "low", label: "Low", description: "Concerning but not immediately threatening" },
  { id: "medium", label: "Medium", description: "Potentially dangerous situation" },
  { id: "high", label: "High", description: "Immediate danger or serious incident" },
]

const ReportPage = () => {
 
  const [position, setPosition] = useState<[number, number] | null>(null)
  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [report, setReport] = useState({
    type: "",
    severity: "medium",
    description: "",
    date: new Date().toISOString().split("T")[0],
    time: new Date().toTimeString().slice(0, 5),
    isAnonymous: "no",
    contactInfo: "",
    hasWitnesses: "no",
    witnessInfo: "",
  })

  const handleLocationSelect = (lat: number, lng: number) => {
    setPosition([lat, lng])
   
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setReport((prev) => ({ ...prev, [name]: value }))
  }
  const handleSelectChange = (name: string, value: string) => {
    setReport((prev) => ({ ...prev, [name]: value }))
  }

  // Handle radio button changes
  const handleRadioChange = (name: string, value: string) => {
    setReport((prev) => ({ ...prev, [name]: value }))
  }

  // Move to next step
  const nextStep = () => {
    if (step === 1 && !report.type) {
    
      return
    }

    if (step === 2 && !position) {
    
      return
    }

    if (step === 3 && !report.description) {
      
      return
    }

    setStep(step + 1)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const prevStep = () => {
    setStep(step - 1)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!position) {
     
      return
    }

    setIsSubmitting(true)

    const reportData = {
      ...report,
      latitude: position[0],
      longitude: position[1],
    }

    try {
      const response = await fetch("http://127.0.0.1:8000/api/report/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reportData),
      })

      if (response.ok) {
        setIsSubmitting(false)
        setIsSuccess(true)
     
      } else {
        throw new Error("Failed to submit report")
      }
    } catch (error) {
      setIsSubmitting(false)
      
    }
  }

  const resetForm = () => {
    setReport({
      type: "",
      severity: "medium",
      description: "",
      date: new Date().toISOString().split("T")[0],
      time: new Date().toTimeString().slice(0, 5),
      isAnonymous: "no",
      contactInfo: "",
      hasWitnesses: "no",
      witnessInfo: "",
    })
    setPosition(null)
    setStep(1)
    setIsSuccess(false)
  }
  const getMarkerIcon = () => {
    if (typeof window === "undefined" || typeof L === "undefined") return undefined

    return new L.Icon({
      iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
    })
  }

  const renderForm = () => {
    if (isSuccess) {
      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center py-8"
        >
          <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-4">
            <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Report Submitted Successfully</h2>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Thank you for your report. Your contribution helps make our community safer for everyone.
          </p>
          <Button onClick={resetForm}>Submit Another Report</Button>
        </motion.div>
      )
    }
    switch (step) {
      case 1:
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <div>
              <h3 className="text-lg font-medium mb-2">What type of incident are you reporting?</h3>
              <p className="text-muted-foreground mb-4">Select the category that best describes the incident</p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {incidentTypes.map((type) => (
                  <div
                    key={type.id}
                    className={`border rounded-lg p-4 cursor-pointer transition-all ${
                      report.type === type.id
                        ? "border-primary bg-primary/5 dark:bg-primary/20"
                        : "hover:border-primary/50"
                    }`}
                    onClick={() => handleSelectChange("type", type.id)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="text-2xl">{type.icon}</div>
                      <div>
                        <div className="font-medium">{type.label}</div>
                        <div className="text-xs text-muted-foreground mt-1">{type.description}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-lg font-medium mb-2">How severe was this incident?</h3>
              <RadioGroup
                value={report.severity}
                onValueChange={(value) => handleRadioChange("severity", value)}
                className="flex flex-col space-y-1"
              >
                {severityLevels.map((level) => (
                  <div key={level.id} className="flex items-center space-x-2">
                    <RadioGroupItem value={level.id} id={`severity-${level.id}`} />
                    <Label htmlFor={`severity-${level.id}`} className="flex items-center gap-2">
                      <span>{level.label}</span>
                      <span className="text-xs text-muted-foreground">({level.description})</span>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
            <div className="flex justify-end">
              <Button onClick={nextStep}>
                Continue
                <ChevronDown className="h-4 w-4 ml-1 rotate-[-90deg]" />
              </Button>
            </div>
          </motion.div>
        )

      case 2:
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <div>
              <h3 className="text-lg font-medium mb-2">Where did this incident occur?</h3>
              <p className="text-muted-foreground mb-4">Click on the map to mark the location of the incident</p>
              <div className="rounded-lg overflow-hidden border h-[400px] mb-4">
                {typeof window !== "undefined" && (
                  <MapContainer center={[22.5726, 88.3639]} zoom={12} style={{ height: "100%", width: "100%" }}>
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <LocationPicker onLocationSelect={handleLocationSelect} />
                    {position && (
                      <Marker position={position} icon={getMarkerIcon()}>
                        <Popup>Incident location</Popup>
                      </Marker>
                    )}
                  </MapContainer>
                )}
              </div>
              {position && (
                <div className="bg-muted p-3 rounded-lg">
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-primary" />
                    <span>
                      Location selected: {position[0].toFixed(6)}, {position[1].toFixed(6)}
                    </span>
                  </div>
                </div>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">When did this happen? (Date)</Label>
                <Input
                  type="date"
                  id="date"
                  name="date"
                  value={report.date}
                  onChange={handleInputChange}
                  max={new Date().toISOString().split("T")[0]}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="time">Approximate time</Label>
                <Input type="time" id="time" name="time" value={report.time} onChange={handleInputChange} />
              </div>
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={prevStep}>
                <ChevronDown className="h-4 w-4 mr-1 rotate-90" />
                Back
              </Button>
              <Button onClick={nextStep}>
                Continue
                <ChevronDown className="h-4 w-4 ml-1 rotate-[-90deg]" />
              </Button>
            </div>
          </motion.div>
        )

      case 3:
        return (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="space-y-6"        >
            <div className="space-y-2">
              <Label htmlFor="description">
                Please describe what happened
                <span className="text-destructive"> *</span>
              </Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Provide details about the incident..."
                value={report.description}
                onChange={handleInputChange}
                className="min-h-[150px]"
                required
              />
              <p className="text-xs text-muted-foreground">
                Include any relevant details that might help others stay safe
              </p>
            </div>

            <div className="space-y-2">
              <Label>Were there any witnesses?</Label>
              <RadioGroup value={report.hasWitnesses}  onValueChange={(value) => handleRadioChange("hasWitnesses", value)}
                className="flex space-x-4">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes" id="witnesses-yes" />
                  <Label htmlFor="witnesses-yes">Yes</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id="witnesses-no" />
                  <Label htmlFor="witnesses-no">No</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="unsure" id="witnesses-unsure" />
                  <Label htmlFor="witnesses-unsure">Not sure</Label>
                </div>
              </RadioGroup>
            </div>

            {report.hasWitnesses === "yes" && (
              <div className="space-y-2">
                <Label htmlFor="witnessInfo">Witness information (optional)</Label>
                <Textarea  id="witnessInfo" name="witnessInfo" placeholder="Number of witnesses, descriptions, etc."  value={report.witnessInfo}  onChange={handleInputChange}   />
              </div>
            )}

            <div className="flex justify-between">
              <Button variant="outline" onClick={prevStep}>
                <ChevronDown className="h-4 w-4 mr-1 rotate-90" />
                Back
              </Button>
              <Button onClick={nextStep}>
                Continue
                <ChevronDown className="h-4 w-4 ml-1 rotate-[-90deg]" />
              </Button>
            </div>
          </motion.div>
        )

      case 4:
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <div className="space-y-2">
              <Label>Would you like to remain anonymous?</Label>
              <RadioGroup
                value={report.isAnonymous}
                onValueChange={(value) => handleRadioChange("isAnonymous", value)}
                className="flex space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes" id="anonymous-yes" />
                  <Label htmlFor="anonymous-yes">Yes</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id="anonymous-no" />
                  <Label htmlFor="anonymous-no">No</Label>
                </div>
              </RadioGroup>
              <p className="text-xs text-muted-foreground">Your identity will be protected regardless of your choice</p>
            </div>

            {report.isAnonymous === "no" && (
              <div className="space-y-2">
                <Label htmlFor="contactInfo">Contact information (optional)</Label>
                <Input
                  id="contactInfo"
                  name="contactInfo"
                  placeholder="Email or phone number"
                  value={report.contactInfo}
                  onChange={handleInputChange}
                />
                <p className="text-xs text-muted-foreground">
                  This will only be used if authorities need additional information
                </p>
              </div>
            )}

            <div className="bg-muted p-4 rounded-lg space-y-4">
              <div className="flex items-center gap-2">
                <Info className="h-5 w-5 text-primary" />
                <h3 className="font-medium">Report Summary</h3>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Incident Type:</span>
                  <span className="font-medium">
                    {incidentTypes.find((t) => t.id === report.type)?.label || report.type}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Severity:</span>
                  <span className="font-medium capitalize">{report.severity}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Date & Time:</span>
                  <span className="font-medium">
                    {report.date} at {report.time}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Location:</span>
                  <span className="font-medium">
                    {position ? `${position[0].toFixed(4)}, ${position[1].toFixed(4)}` : "Not selected"}
                  </span>
                </div>
                <Separator />
                <div>
                  <span className="text-muted-foreground">Description:</span>
                  <p className="mt-1">{report.description}</p>
                </div>
              </div>
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={prevStep}>
                <ChevronDown className="h-4 w-4 mr-1 rotate-90" />
                Back
              </Button>
              <Button onClick={handleSubmit} disabled={isSubmitting} className="gap-2">
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Submit Report
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        )

      default:
        return null
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-3xl mx-auto"
      >
        <div className="mb-8 space-y-2">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <AlertTriangle className="h-6 w-6 text-primary" />
            Report an Incident
          </h1>
          <p className="text-muted-foreground">Help make our community safer by reporting incidents or unsafe areas</p>
        </div>

        {!isSuccess && (
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant={step >= 1 ? "default" : "outline"}>1</Badge>
                <span className={step >= 1 ? "font-medium" : "text-muted-foreground"}>Incident Details</span>
              </div>
              <Separator className="flex-1 mx-4" />
              <div className="flex items-center gap-2">
                <Badge variant={step >= 2 ? "default" : "outline"}>2</Badge>
                <span className={step >= 2 ? "font-medium" : "text-muted-foreground"}>Location & Time</span>
              </div>
              <Separator className="flex-1 mx-4" />
              <div className="flex items-center gap-2">
                <Badge variant={step >= 3 ? "default" : "outline"}>3</Badge>
                <span className={step >= 3 ? "font-medium" : "text-muted-foreground"}>Description</span>
              </div>
              <Separator className="flex-1 mx-4" />
              <div className="flex items-center gap-2">
                <Badge variant={step >= 4 ? "default" : "outline"}>4</Badge>
                <span className={step >= 4 ? "font-medium" : "text-muted-foreground"}>Review</span>
              </div>
            </div>
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>
              {isSuccess ? "Report Submitted" : step === 1   ? "Incident Information"   : step === 2     ? "Location & Time" : step === 3       ? "Incident Description"      : "Review & Submit"}
            </CardTitle>
            <CardDescription>
              {isSuccess
                ? "Thank you for your contribution"
                : step === 1
                  ? "Tell us about the type of incident"
                  : step === 2
                    ? "Mark where and when it happened"
                    : step === 3
                      ? "Provide details about what occurred"
                      : "Review your report before submission"}
            </CardDescription>
          </CardHeader>
          <CardContent>{renderForm()}</CardContent>
          {!isSuccess && step === 1 && (
            <CardFooter className="flex flex-col items-start border-t p-4 bg-muted/50">
              <div className="flex items-start gap-2">
                <Info className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <h4 className="font-medium">Why Report Incidents?</h4>
                  <p className="text-sm text-muted-foreground">
                    Your reports help identify unsafe areas and patterns, allowing authorities to take action and
                    helping other women stay informed about potential risks.
                  </p>
                </div>
              </div>
            </CardFooter>
          )}
        </Card>
      </motion.div>
    </div>
  )
}

export default ReportPage