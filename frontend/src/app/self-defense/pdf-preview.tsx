"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { FileDown, Eye } from "lucide-react"
import { downloadSelfDefenseGuide } from "@/lib/pdf-generator"

export function PDFPreviewButton() {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1">
          <Eye className="h-4 w-4" />
          Preview Guide
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>Women's Self-Defense Guide Preview</DialogTitle>
          <DialogDescription>A preview of our comprehensive self-defense guide for women</DialogDescription>
        </DialogHeader>

        <div className="mt-4 space-y-6">
          {/* PDF Preview Content */}
          <div className="bg-muted p-6 rounded-lg">
            <h2 className="text-2xl font-bold text-primary mb-4">WOMEN'S SELF-DEFENSE GUIDE</h2>
            <p className="text-sm mb-6">Essential techniques and safety tips for women</p>

            <h3 className="text-lg font-semibold mb-2">Introduction</h3>
            <p className="text-sm mb-4">
              This guide provides essential self-defense techniques and safety tips designed specifically for women. The
              information contained in this guide is meant to empower you with knowledge and skills that could be
              valuable in potentially dangerous situations.
            </p>

            <h3 className="text-lg font-semibold mb-2">Basic Self-Defense Techniques</h3>
            <div className="space-y-3 mb-4">
              <div>
                <h4 className="font-medium">1. Basic Stance and Movement</h4>
                <p className="text-sm">
                  Stand with feet shoulder-width apart, knees slightly bent, and one foot slightly forward. This
                  balanced stance provides stability and allows for quick movement in any direction.
                </p>
              </div>
              <div>
                <h4 className="font-medium">2. Wrist Grab Escapes</h4>
                <p className="text-sm">
                  If someone grabs your wrist, don't pull directly back. Instead, rotate your arm in the direction of
                  your thumb while stepping to the side.
                </p>
              </div>
            </div>

            <p className="text-sm italic">
              This is just a preview. The full guide contains detailed instructions for all techniques, safety tips,
              emergency contacts, and more.
            </p>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Close
            </Button>
            <Button
              onClick={() => {
                downloadSelfDefenseGuide()
                setOpen(false)
              }}
              className="gap-1"
            >
              <FileDown className="h-4 w-4" />
              Download Full Guide
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

