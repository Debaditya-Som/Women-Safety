"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import axios from "axios"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { MessageCircle, X, Send, Bot } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

type Message = {
  role: "user" | "bot"
  content: string
  timestamp: Date
}

export default function SHEildChatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const isFirstRender = useRef(true)

  useEffect(() => {
    // Skip the first render to avoid unnecessary scroll
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }

    // Scroll to bottom when messages change
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current
      setTimeout(() => {
        scrollContainer.scrollTop = scrollContainer.scrollHeight
      }, 100) // Small delay to ensure content is rendered
    }
  }, [messages])

  const sendMessage = async () => {
    if (!input.trim()) return

    const userMessage: Message = {
      role: "user",
      content: input,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("") // Clear input
    setIsTyping(true)

    try {
      const { data } = await axios.post("http://127.0.0.1:8000/api/chatbot/chat", { message: input })

      // Simulate a slight delay for typing effect
      setTimeout(() => {
        const botMessage: Message = {
          role: "bot",
          content: data.response,
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, botMessage])
        setIsTyping(false)
      }, 500)
    } catch (error) {
      console.error("Error fetching response:", error)
      setIsTyping(false)

      const errorMessage: Message = {
        role: "bot",
        content: "Sorry, I could not process your request. Please try again.",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isOpen ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="relative"
          >
            <Card className="w-[350px] sm:w-[400px] h-[500px] shadow-xl rounded-2xl overflow-hidden border-0 flex flex-col">
              <div className="bg-gradient-to-r from-violet-500 to-indigo-600 p-4 flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <Bot className="h-6 w-6 text-white" />
                  <h2 className="text-white font-medium">SHEild</h2>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-white hover:bg-white/20 rounded-full p-1 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <CardContent className="p-0 flex-1 flex flex-col min-h-0">
                <div 
                  ref={scrollAreaRef}
                  className="flex-1 p-4 overflow-y-auto min-h-0"
                >
                  {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-6 text-gray-500">
                      <Bot className="h-12 w-12 mb-4 text-indigo-500" />
                      <p className="mb-2 font-medium">Welcome to SHEild! How can I help you today?</p>
                      <p className="text-sm">Ask me anything and I will do my best to assist you!</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {messages.map((msg, index) => (
                        <div key={index} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                          <div
                            className={`
                              max-w-[80%] p-3 rounded-2xl 
                              ${
                                msg.role === "user"
                                  ? "bg-gradient-to-r from-indigo-500 to-violet-500 text-white rounded-tr-none"
                                  : "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-tl-none"
                              }
                            `}
                          >
                            <div>{msg.content}</div>
                            <div
                              className={`text-xs mt-1 ${msg.role === "user" ? "text-indigo-100" : "text-gray-500"}`}
                            >
                              {formatTime(msg.timestamp)}
                            </div>
                          </div>
                        </div>
                      ))}

                      {isTyping && (
                        <div className="flex justify-start">
                          <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-2xl rounded-tl-none max-w-[80%]">
                            <div className="flex space-x-1">
                              <span className="animate-bounce delay-0 h-2 w-2 bg-gray-500 rounded-full"></span>
                              <span className="animate-bounce delay-150 h-2 w-2 bg-gray-500 rounded-full"></span>
                              <span className="animate-bounce delay-300 h-2 w-2 bg-gray-500 rounded-full"></span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="p-4 border-t bg-white dark:bg-gray-950 mt-auto">
                  <div className="flex items-center space-x-2">
                    <Input
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKeyPress}
                      placeholder="Type your message..."
                      className="flex-1 rounded-full border-gray-300 focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                    />
                    <Button
                      onClick={sendMessage}
                      size="icon"
                      className="rounded-full bg-gradient-to-r from-violet-500 to-indigo-600 hover:from-violet-600 hover:to-indigo-700"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <motion.button
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsOpen(true)}
            className="w-14 h-14 rounded-full bg-gradient-to-r from-violet-500 to-indigo-600 text-white flex items-center justify-center shadow-lg hover:shadow-xl transition-all"
          >
            <MessageCircle className="h-6 w-6" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  )
}