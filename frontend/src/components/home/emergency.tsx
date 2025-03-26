"use client"

import { useState, useEffect } from "react"
import { Phone, Shield, Trash2, Save, Check } from "lucide-react"

export default function EmergencyContact() {
  const [contact, setContact] = useState<string>("")
  const [countryCode, setCountryCode] = useState<string>("+91")
  const [savedContact, setSavedContact] = useState<string | null>(null)
  const [showSuccess, setShowSuccess] = useState(false)

  const countryCodes = [
    { code: "+91", country: "India", flag: "🇮🇳" },
    { code: "+1", country: "USA", flag: "🇺🇸" },
    { code: "+44", country: "UK", flag: "🇬🇧" },
    { code: "+61", country: "Australia", flag: "🇦🇺" },
    { code: "+81", country: "Japan", flag: "🇯🇵" },
    { code: "+49", country: "Germany", flag: "🇩🇪" },
    { code: "+33", country: "France", flag: "🇫🇷" },
    { code: "+971", country: "UAE", flag: "🇦🇪" },
    { code: "+86", country: "China", flag: "🇨🇳" },
    { code: "+7", country: "Russia", flag: "🇷🇺" },
    { code: "+55", country: "Brazil", flag: "🇧🇷" },
    { code: "+82", country: "South Korea", flag: "🇰🇷" },
    { code: "+39", country: "Italy", flag: "🇮🇹" },
    { code: "+34", country: "Spain", flag: "🇪🇸" },
    { code: "+52", country: "Mexico", flag: "🇲🇽" },
    { code: "+65", country: "Singapore", flag: "🇸🇬" },
    { code: "+31", country: "Netherlands", flag: "🇳🇱" },
    { code: "+64", country: "New Zealand", flag: "🇳🇿" },
    { code: "+27", country: "South Africa", flag: "🇿🇦" },
    { code: "+966", country: "Saudi Arabia", flag: "🇸🇦" },
  ]

  useEffect(() => {
    const storedContact = localStorage.getItem("emergencyContact")
    if (storedContact) {
      setSavedContact(storedContact)
    }
  }, [])

  const handleSave = () => {
    if (!/^\d{10}$/.test(contact)) {
      showNotification("Please enter a valid 10-digit phone number.", "error")
      return
    }

    const formattedContact = `${countryCode}${contact}`
    localStorage.setItem("emergencyContact", formattedContact)
    setSavedContact(formattedContact)
    showNotification("Emergency contact saved successfully!", "success")
    setShowSuccess(true)
    setTimeout(() => setShowSuccess(false), 3000)
  }

  const handleReset = () => {
    localStorage.removeItem("emergencyContact")
    setSavedContact(null)
    setContact("")
    setCountryCode("+91")
    showNotification("Emergency contact has been reset.", "info")
  }

  const showNotification = (message: string, type: "success" | "error" | "info") => {
    const bgColor = type === "success" ? "bg-green-500" : type === "error" ? "bg-red-500" : "bg-blue-500"
    const notification = document.createElement("div")
    notification.className = `fixed top-4 right-4 ${bgColor} text-white px-6 py-3 rounded-lg shadow-lg transform transition-all duration-500 ease-in-out z-50`
    notification.textContent = message
    document.body.appendChild(notification)
    setTimeout(() => {
      notification.style.opacity = "0"
      setTimeout(() => notification.remove(), 500)
    }, 3000)
  }

  return (
    <section className="w-full py-12 md:py-24 lg:py-30 bg-gradient-to-b from-primary/10 to-white">
      <div className="container px-4 md:px-6 max-w-md mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-pink-500 to-rose-400 p-5">
            <div className="flex items-center justify-center gap-3">
              <div className="bg-white p-2 rounded-full">
                <Shield className="w-6 h-6 text-pink-500" />
              </div>
              <h2 className="text-2xl font-bold text-white">Emergency Contact</h2>
            </div>
          </div>

          <div className="p-6">
            {savedContact && (
              <div className="mb-6 p-4 bg-pink-50 rounded-lg border border-pink-100 animate-fadeIn">
                <div className="text-sm text-pink-600 font-medium mb-1">Saved Contact</div>
                <div className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <Phone className="w-5 h-5 text-pink-500" />
                  {savedContact}
                </div>
              </div>
            )}

            <div className="space-y-5">
              <div className="flex gap-3">
                <div className="w-1/3">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Country</label>
                  <select
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value)}
                    className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200"
                  >
                    {countryCodes.map(({ code, country, flag }) => (
                      <option key={code} value={code}>
                        {flag} {country} ({code})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone Number</label>
                  <input
                    type="tel"
                    placeholder="Enter 10-digit number"
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200"
                    maxLength={10}
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleSave}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-white font-medium transition-all duration-200 ${
                    showSuccess
                      ? "bg-green-500"
                      : "bg-gradient-to-r from-pink-500 to-rose-400 hover:from-pink-600 hover:to-rose-500 shadow-md hover:shadow-lg"
                  }`}
                >
                  {showSuccess ? (
                    <>
                      <Check className="w-5 h-5" />
                      Saved Successfully
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      Save Contact
                    </>
                  )}
                </button>

                {savedContact && (
                  <button
                    onClick={handleReset}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-all duration-200"
                  >
                    <Trash2 className="w-5 h-5 text-red-500" />
                    Reset
                  </button>
                )}
              </div>
            </div>

            {!savedContact && (
              <div className="mt-6 text-center text-sm text-gray-500 flex items-center justify-center gap-2">
                <Phone className="w-4 h-4 text-gray-400" />
                No emergency contact saved yet
              </div>
            )}

            <div className="mt-6 pt-5 border-t border-gray-100">
              <p className="text-xs text-gray-500">
                Your emergency contact will be stored locally on this device and can be accessed even when offline.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

