"use client";
import React, { useState, useEffect } from 'react';
import { Phone, Shield, Trash2, Save } from 'lucide-react';

function App() {
  const [contact, setContact] = useState<string>("");
  const [countryCode, setCountryCode] = useState<string>("+91");
  const [savedContact, setSavedContact] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const countryCodes = [
    { code: "+91", country: "India", flag: "🇮🇳" },
    { code: "+1", country: "USA", flag: "🇺🇸" },
    { code: "+44", country: "UK", flag: "🇬🇧" },
    { code: "+61", country: "Australia", flag: "🇦🇺" },
    { code: "+81", country: "Japan", flag: "🇯🇵" },
    { code: "+49", country: "Germany", flag: "🇩🇪" },
    { code: "+33", country: "France", flag: "🇫🇷" },
    { code: "+971", country: "UAE", flag: "🇦🇪" },
  ];

  useEffect(() => {
    const storedContact = localStorage.getItem("emergencyContact");
    if (storedContact) {
      setSavedContact(storedContact);
    }
  }, []);

  const handleSave = () => {
    if (!/^\d{10}$/.test(contact)) {
      showNotification("Please enter a valid 10-digit phone number.", "error");
      return;
    }

    const formattedContact = `${countryCode}${contact}`;
    localStorage.setItem("emergencyContact", formattedContact);
    setSavedContact(formattedContact);
    showNotification("Emergency contact saved successfully!", "success");
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleReset = () => {
    localStorage.removeItem("emergencyContact");
    setSavedContact(null);
    setContact("");
    setCountryCode("+91");
    showNotification("Emergency contact has been reset.", "info");
  };

  const showNotification = (message: string, type: 'success' | 'error' | 'info') => {
    const bgColor = type === 'success' ? 'bg-green-500' : type === 'error' ? 'bg-red-500' : 'bg-blue-500';
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 ${bgColor} text-white px-6 py-3 rounded-lg shadow-lg transform transition-all duration-500 ease-in-out`;
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => {
      notification.style.opacity = '0';
      setTimeout(() => notification.remove(), 500);
    }, 3000);
  };

  return (
    <section className="w-full py-12 md:py-24 lg:py-30">
      <div className="container px-4 md:px-6">
        <div className="flex items-center gap-3 mb-8">
          <Shield className="w-8 h-8 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-800">Emergency Contact</h2>
        </div>

        {savedContact && (
          <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
            <div className="text-sm text-blue-600 font-medium mb-1">Saved Contact</div>
            <div className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <Phone className="w-5 h-5" />
              {savedContact}
            </div>
          </div>
        )}

        <div className="space-y-4">
          <div className="flex gap-3">
            <div className="w-1/3">
              <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
              <select
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              >
                {countryCodes.map(({ code, country, flag }) => (
                  <option key={code} value={code}>
                    {flag} {code}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              <input
                type="tel"
                placeholder="Enter 10-digit number"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                maxLength={10}
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={handleSave}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-white font-medium transition-all duration-200 ${
                showSuccess ? 'bg-green-500' : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {showSuccess ? (
                <>✓ Saved</>
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
                className="flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg font-medium hover:bg-red-100 transition-all duration-200"
              >
                <Trash2 className="w-5 h-5" />
                Reset
              </button>
            )}
          </div>
        </div>

        {!savedContact && (
          <div className="mt-6 text-center text-sm text-gray-500">
            No emergency contact saved yet
          </div>
        )}
      </div>
    </section>
 
  );
}

export default App;