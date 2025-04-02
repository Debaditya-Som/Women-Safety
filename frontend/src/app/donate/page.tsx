"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { CreditCard, Heart, DollarSign, CheckCircle2, Coffee, Lightbulb, Rocket, ArrowRight } from 'lucide-react'
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

// import { toast } from "@/components/ui/toast"

const donationTiers = [
  { 
    value: "50", 
    label: "₹50", 
    description: "Coffee supporter", 
    icon: Coffee 
  },
  { 
    value: "100", 
    label: "₹100", 
    description: "Project believer", 
    icon: Lightbulb 
  },
  { 
    value: "250", 
    label: "₹250", 
    description: "Healthcare hero", 
    icon: Heart 
  },
  { 
    value: "1000", 
    label: "₹1000", 
    description: "Major contributor", 
    icon: Rocket 
  },
  { 
    value: "custom", 
    label: "Custom", 
    description: "Your choice", 
    icon: DollarSign 
  }
]

export default function DonatePage() {
  const router = useRouter()
  const [donationAmount, setDonationAmount] = useState<string>("25")
  const [customAmount, setCustomAmount] = useState<string>("")
  const [paymentMethod, setPaymentMethod] = useState<string>("card")
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [name, setName] = useState<string>("")
  const [email, setEmail] = useState<string>("")
  const [message, setMessage] = useState<string>("")
  const [isAnonymous, setIsAnonymous] = useState<boolean>(false)

  const handleDonationSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    const finalAmount = donationAmount === "custom" ? customAmount : donationAmount

    // Simulate payment processing
    try {
      // In a real app, you would integrate with a payment processor here
      await new Promise(resolve => setTimeout(resolve, 1500))
      
    //   toast({
    //     title: "Thank you for your donation!",
    //     description: `Your contribution of $${finalAmount} will help improve healthcare accessibility.`,
    //   })
      
      // Redirect to thank you page
      router.push("/donate/thank-you")
    } catch (error) {
    //   toast({
    //     title: "Something went wrong",
    //     description: "Please try again later.",
    //     variant: "destructive",
    //   })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container max-w-5xl mx-auto px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl font-bold mb-4">Support Our Healthcare Initiative</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Your contribution helps us improve healthcare accessibility and provide better medical facility information to those in need.
        </p>
      </motion.div>

      <div className="grid md:grid-cols-3 gap-8">
        <motion.div 
          className="md:col-span-2"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-primary" />
                Make a Donation
              </CardTitle>
              <CardDescription>
                Choose an amount to donate to our healthcare mapping project
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleDonationSubmit}>
                <div className="space-y-6">
                  <div>
                    <Label className="text-base">Select donation amount</Label>
                    <RadioGroup 
                      value={donationAmount} 
                      onValueChange={setDonationAmount}
                      className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-3"
                    >
                      {donationTiers.map((tier) => {
                        const Icon = tier.icon
                        return (
                          <Label
                            key={tier.value}
                            htmlFor={`amount-${tier.value}`}
                            className={`
                              flex flex-col items-center justify-between p-4 border rounded-lg cursor-pointer
                              transition-all hover:border-primary hover:bg-primary/5
                              ${donationAmount === tier.value ? 'border-primary bg-primary/5' : 'border-input'}
                            `}
                          >
                            <RadioGroupItem 
                              value={tier.value} 
                              id={`amount-${tier.value}`} 
                              className="sr-only" 
                            />
                            <Icon className="h-6 w-6 mb-2 text-primary" />
                            <span className="font-medium">{tier.label}</span>
                            <span className="text-xs text-muted-foreground">{tier.description}</span>
                          </Label>
                        )
                      })}
                    </RadioGroup>
                  </div>

                  {donationAmount === "custom" && (
                    <div className="space-y-2">
                      <Label htmlFor="custom-amount">Enter custom amount</Label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="custom-amount"
                          type="number"
                          min="1"
                          step="1"
                          placeholder="Enter amount"
                          className="pl-9"
                          value={customAmount}
                          onChange={(e) => setCustomAmount(e.target.value)}
                          required={donationAmount === "custom"}
                        />
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label>Payment method</Label>
                    <Tabs defaultValue="card" value={paymentMethod} onValueChange={setPaymentMethod}>
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="card">Credit Card</TabsTrigger>
                        <TabsTrigger value="paypal">PayPal</TabsTrigger>
                      </TabsList>
                      <TabsContent value="card" className="space-y-4 mt-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="col-span-2">
                            <Label htmlFor="card-number">Card Number</Label>
                            <Input id="card-number" placeholder="1234 5678 9012 3456" />
                          </div>
                          <div>
                            <Label htmlFor="expiry">Expiry Date</Label>
                            <Input id="expiry" placeholder="MM/YY" />
                          </div>
                          <div>
                            <Label htmlFor="cvc">CVC</Label>
                            <Input id="cvc" placeholder="123" />
                          </div>
                        </div>
                      </TabsContent>
                      <TabsContent value="paypal" className="mt-4">
                        <div className="text-center p-4 border rounded-lg bg-muted/30">
                          <p className="mb-2">You will be redirected to PayPal to complete your donation.</p>
                          <Button variant="outline" className="w-full">
                            Continue with PayPal
                          </Button>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </div>

                  <div className="space-y-4 border-t pt-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-base">Your Information</Label>
                      <Label className="flex items-center gap-2 cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="rounded border-gray-300" 
                          checked={isAnonymous}
                          onChange={() => setIsAnonymous(!isAnonymous)}
                        />
                        <span className="text-sm">Donate anonymously</span>
                      </Label>
                    </div>
                    
                    {!isAnonymous && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="col-span-2 md:col-span-1">
                            <Label htmlFor="name">Name</Label>
                            <Input 
                              id="name" 
                              placeholder="Your name" 
                              value={name}
                              onChange={(e) => setName(e.target.value)}
                            />
                          </div>
                          <div className="col-span-2 md:col-span-1">
                            <Label htmlFor="email">Email</Label>
                            <Input 
                              id="email" 
                              type="email" 
                              placeholder="your.email@example.com" 
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                            />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="message">Message (Optional)</Label>
                          <Textarea 
                            id="message" 
                            placeholder="Share why you're supporting our project..." 
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full mt-6" 
                  size="lg"
                  disabled={isSubmitting || (donationAmount === "custom" && !customAmount)}
                >
                  {isSubmitting ? "Processing..." : "Complete Donation"}
                  {!isSubmitting && <ArrowRight className="ml-2 h-4 w-4" />}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Your Impact</CardTitle>
              <CardDescription>
                How your donation helps
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-start gap-3">
                  <div className="bg-primary/10 p-2 rounded-full">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium">Improve Data Accuracy</h4>
                    <p className="text-sm text-muted-foreground">Help us maintain accurate information about healthcare facilities.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-primary/10 p-2 rounded-full">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium">Expand Coverage</h4>
                    <p className="text-sm text-muted-foreground">Support our efforts to map more hospitals and clinics.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-primary/10 p-2 rounded-full">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium">Enhance Features</h4>
                    <p className="text-sm text-muted-foreground">Fund development of new tools to help people find care faster.</p>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t">
                <h4 className="font-medium mb-2">Project Progress</h4>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Hospitals Mapped</span>
                      <span className="font-medium">1,245 / 2,000</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2.5">
                      <div className="bg-primary h-2.5 rounded-full" style={{ width: '62%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Monthly Goal</span>
                      <span className="font-medium">$3,750 / $5,000</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2.5">
                      <div className="bg-primary h-2.5 rounded-full" style={{ width: '75%' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col">
              <p className="text-sm text-muted-foreground mb-4">
                Your donation is tax-deductible where applicable. You'll receive a receipt via email.
              </p>
              <div className="flex items-center justify-center w-full gap-2 text-xs text-muted-foreground">
                <CreditCard className="h-4 w-4" />
                <span>Secure payment processing</span>
              </div>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}