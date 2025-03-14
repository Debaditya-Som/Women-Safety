import jsPDF from "jspdf"

export const downloadSelfDefenseGuide = () => {
  const doc = new jsPDF()

  doc.setProperties({
    title: "Women's Self-Defense Guide",
    author: "SafetyNet",
    subject: "Self-Defense Techniques and Safety Tips",
    keywords: "self-defense, women, safety, techniques",
  })

  const primaryColor = "#d6336c" 
  const textColor = "#333333"
  const headingColor = "#d6336c"

  doc.setFillColor(primaryColor)
  doc.rect(0, 0, 210, 30, "F")
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(24)
  doc.setFont("helvetica", "bold")
  doc.text("WOMEN'S SELF-DEFENSE GUIDE", 105, 20, { align: "center" })

  doc.setTextColor(255, 255, 255)
  doc.setFontSize(12)
  doc.setFont("helvetica", "normal")
  doc.text("Essential techniques and safety tips for women", 105, 27, { align: "center" })

  doc.setTextColor(textColor)
  doc.setFontSize(12)
  doc.setFont("helvetica", "normal")
  doc.text("Provided by SafetyNet - Your Resource for Women's Safety", 105, 40, { align: "center" })

  doc.setFontSize(14)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(headingColor)
  doc.text("Introduction", 20, 55)

  doc.setFontSize(11)
  doc.setFont("helvetica", "normal")
  doc.setTextColor(textColor)
  const introText =
    "This guide provides essential self-defense techniques and safety tips designed specifically for women. The information contained in this guide is meant to empower you with knowledge and skills that could be valuable in potentially dangerous situations. Remember that the best self-defense is awareness and avoidance of dangerous situations."

  const splitIntro = doc.splitTextToSize(introText, 170)
  doc.text(splitIntro, 20, 65)

  doc.setFontSize(14)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(headingColor)
  doc.text("Basic Self-Defense Techniques", 20, 90)

  doc.setFontSize(12)
  doc.setFont("helvetica", "bold")
  doc.text("1. Basic Stance and Movement", 20, 100)

  doc.setFontSize(11)
  doc.setFont("helvetica", "normal")
  const technique1 =
    "Stand with feet shoulder-width apart, knees slightly bent, and one foot slightly forward. This balanced stance provides stability and allows for quick movement in any direction. Keep your hands up to protect your face and vital areas."
  const splitTechnique1 = doc.splitTextToSize(technique1, 170)
  doc.text(splitTechnique1, 20, 110)

  doc.setFontSize(12)
  doc.setFont("helvetica", "bold")
  doc.text("2. Wrist Grab Escapes", 20, 125)

  doc.setFontSize(11)
  doc.setFont("helvetica", "normal")
  const technique2 =
    "If someone grabs your wrist, don't pull directly back. Instead, rotate your arm in the direction of your thumb while stepping to the side. This uses leverage rather than strength to break the grip."
  const splitTechnique2 = doc.splitTextToSize(technique2, 170)
  doc.text(splitTechnique2, 20, 135)

  doc.setFontSize(12)
  doc.setFont("helvetica", "bold")
  doc.text("3. Front Attack Defense", 20, 150)

  doc.setFontSize(11)
  doc.setFont("helvetica", "normal")
  const technique3 =
    "If confronted from the front, maintain distance. Use your voice firmly. If attacked, strike vulnerable areas like eyes, nose, throat, or groin. Use the heel of your palm for upward strikes to the nose or chin."
  const splitTechnique3 = doc.splitTextToSize(technique3, 170)
  doc.text(splitTechnique3, 20, 160)

  doc.addPage()

  doc.setFontSize(12)
  doc.setFont("helvetica", "bold")
  doc.text("4. Rear Attack Defense", 20, 20)

  doc.setFontSize(11)
  doc.setFont("helvetica", "normal")
  const technique4 =
    "If grabbed from behind, lower your center of gravity by bending your knees. This makes you harder to lift or move. Strike backward with elbows, stomp on the attacker's foot, or turn into the attacker while creating space."
  const splitTechnique4 = doc.splitTextToSize(technique4, 170)
  doc.text(splitTechnique4, 20, 30)

  doc.setFontSize(12)
  doc.setFont("helvetica", "bold")
  doc.text("5. Ground Defense", 20, 45)

  doc.setFontSize(11)
  doc.setFont("helvetica", "normal")
  const technique5 =
    "If taken to the ground, protect your head by bringing your arms up. Use your legs to create distance and look for opportunities to escape. Bridge and roll to improve your position if someone is on top of you."
  const splitTechnique5 = doc.splitTextToSize(technique5, 170)
  doc.text(splitTechnique5, 20, 55)

  doc.setFontSize(14)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(headingColor)
  doc.text("Essential Safety Tips", 20, 75)

  doc.setFontSize(11)
  doc.setFont("helvetica", "normal")
  doc.setTextColor(textColor)

  const tips = [
    "Be aware of your surroundings at all times. Minimize distractions like phone use when walking.",
    "Trust your instincts - if something feels wrong, it probably is.",
    "Use well-lit, populated routes when walking at night.",
    "Share your location with trusted friends when going out.",
    "If being followed, change direction or cross the street to confirm. Head toward populated areas.",
    "Keep your phone charged and accessible.",
    "When using rideshare services, verify the driver's identity and share your trip details.",
    "Install quality locks on all doors and windows at home.",
    "Consider using a personal safety app that can quickly alert contacts in an emergency.",
  ]

  let yPosition = 85
  tips.forEach((tip, index) => {
    const bulletPoint = `• ${tip}`
    const splitTip = doc.splitTextToSize(bulletPoint, 170)
    doc.text(splitTip, 20, yPosition)
    yPosition += 10 + (splitTip.length - 1) * 5
  })

  doc.setFontSize(14)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(headingColor)
  doc.text("Emergency Contacts", 20, 180)

  doc.setFontSize(11)
  doc.setFont("helvetica", "normal")
  doc.setTextColor(textColor)
  doc.text("• Emergency Services: 911", 20, 190)
  doc.text("• National Domestic Violence Hotline: 1-800-799-7233", 20, 200)
  doc.text("• Women's Crisis Center: +1 (555) 123-4567", 20, 210)

  doc.addPage()

  doc.setFillColor(primaryColor)
  doc.rect(0, 0, 210, 30, "F")
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(20)
  doc.setFont("helvetica", "bold")
  doc.text("ABOUT SAFETYNET", 105, 20, { align: "center" })

  doc.setTextColor(textColor)
  doc.setFontSize(14)
  doc.setFont("helvetica", "bold")
  doc.text("Visit Our Website", 20, 50)

  doc.setFontSize(11)
  doc.setFont("helvetica", "normal")
  doc.text("For more resources, interactive tutorials, and information about local workshops, visit:", 20, 60)

  doc.setTextColor(primaryColor)
  doc.setFont("helvetica", "bold")
  doc.text("www.safetynet-womens-portal.com", 20, 70)

  doc.setTextColor(textColor)
  doc.setFont("helvetica", "normal")
  doc.text("Our website offers:", 20, 85)

  const websiteFeatures = [
    "Interactive maps to find nearby hospitals, police stations, and women's safety services",
    "Detailed self-defense technique videos and tutorials",
    "Information about local self-defense workshops and classes",
    "Community forums and support groups",
    "Safety resources and educational materials",
    "Mobile app with emergency features and location sharing",
  ]

  yPosition = 95
  websiteFeatures.forEach((feature, index) => {
    const bulletPoint = `• ${feature}`
    const splitFeature = doc.splitTextToSize(bulletPoint, 170)
    doc.text(splitFeature, 20, yPosition)
    yPosition += 10 + (splitFeature.length - 1) * 5
  })

  doc.setFontSize(10)
  doc.setFont("helvetica", "italic")
  doc.text(
    "Disclaimer: This guide is for educational purposes only. The techniques described should be practiced with qualified instructors. SafetyNet is not liable for any injuries resulting from the use or misuse of this information.",
    20,
    160,
  )

  doc.setFontSize(10)
  doc.setFont("helvetica", "normal")
  doc.text(`© ${new Date().getFullYear()} SafetyNet. All rights reserved.`, 105, 280, { align: "center" })

  doc.save("SafetyNet-Womens-Self-Defense-Guide.pdf")
}
