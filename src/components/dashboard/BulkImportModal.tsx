"use client"

import * as React from "react"
import { Upload, FileText, Check, AlertCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Modal } from "./ActionModals"
import { useNotification } from "@/components/NotificationProvider"
import { bulkAddTeamMembers } from "@/app/actions/team"

interface BulkImportModalProps {
  isOpen: boolean
  onClose: () => void
}

export function BulkImportModal({ isOpen, onClose }: BulkImportModalProps) {
  const [file, setFile] = React.useState<File | null>(null)
  const [isParsing, setIsParsing] = React.useState(false)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [previewData, setPreviewData] = React.useState<any[]>([])
  const [error, setError] = React.useState<string | null>(null)
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const { showNotification } = useNotification()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      if (selectedFile.type !== "text/csv" && !selectedFile.name.endsWith(".csv")) {
        setError("Please upload a valid CSV file.")
        return
      }
      setFile(selectedFile)
      setError(null)
      parseCSV(selectedFile)
    }
  }

  const parseCSV = (file: File) => {
    setIsParsing(true)
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string
        const lines = text.split(/\r?\n/).filter(line => line.trim() !== "")
        if (lines.length < 2) {
          setError("CSV file is empty or missing headers.")
          setIsParsing(false)
          return
        }

        const headers = lines[0].split(",").map(h => h.trim().toLowerCase())
        const data = lines.slice(1).map(line => {
          const values = line.split(",").map(v => v.trim())
          const obj: any = {}
          headers.forEach((header, index) => {
            // Map common header names to our database fields
            const key = mapHeaderToField(header)
            if (key) {
              obj[key] = values[index]
            }
          })
          return obj
        })

        // Filter out rows that don't have a name or wallet address
        const validData = data.filter(item => item.name && item.wallet_address)
        
        if (validData.length === 0) {
          setError("No valid recipients found. Ensure headers include 'Name' and 'Wallet Address'.")
        } else {
          setPreviewData(validData)
        }
      } catch (err) {
        setError("Failed to parse CSV file.")
      } finally {
        setIsParsing(false)
      }
    }
    reader.readAsText(file)
  }

  const mapHeaderToField = (header: string) => {
    const mapping: { [key: string]: string } = {
      "name": "name",
      "full name": "name",
      "role": "role",
      "title": "role",
      "email": "email",
      "email address": "email",
      "wallet": "wallet_address",
      "wallet address": "wallet_address",
      "stx address": "wallet_address",
      "btc": "btc_address",
      "btc address": "btc_address",
      "rate": "rate",
      "amount": "rate",
      "frequency": "payment_frequency",
      "payment frequency": "payment_frequency",
      "type": "type"
    }
    return mapping[header] || null
  }

  const handleImport = async () => {
    if (previewData.length === 0) return

    setIsSubmitting(true)
    try {
      const formattedData = previewData.map(item => ({
        ...item,
        payment_frequency: item.payment_frequency || "monthly",
        type: item.type === "employee" ? "employee" : "contractor"
      }))

      const result = await bulkAddTeamMembers(formattedData)
      if (result.error) throw new Error(result.error)

      showNotification("success", "Import Successful", `Successfully imported ${previewData.length} recipients.`)
      onClose()
      // Reset state
      setFile(null)
      setPreviewData([])
    } catch (err: any) {
      showNotification("error", "Import Failed", err.message || "An error occurred during import.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Import Recipients"
      description="Upload a CSV file to bulk add employees and contractors."
    >
      <div className="space-y-6">
        {!file ? (
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-muted-foreground/20 rounded-2xl p-12 flex flex-col items-center justify-center gap-4 hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer group"
          >
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Upload className="h-8 w-8 text-primary" />
            </div>
            <div className="text-center">
              <p className="font-bold">Click to upload or drag and drop</p>
              <p className="text-sm text-muted-foreground">CSV files only (max. 10MB)</p>
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              accept=".csv" 
              className="hidden" 
            />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-accent/50 rounded-xl border border-border/50">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-bold truncate max-w-[200px]">{file.name}</p>
                  <p className="text-[10px] text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</p>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => {
                  setFile(null)
                  setPreviewData([])
                  setError(null)
                }}
              >
                Change
              </Button>
            </div>

            {isParsing ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : error ? (
              <div className="p-4 bg-red-50 dark:bg-red-950/20 rounded-xl flex gap-3 text-red-600 dark:text-red-400">
                <AlertCircle className="h-5 w-5 shrink-0" />
                <p className="text-sm">{error}</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold">Preview ({previewData.length} recipients)</h4>
                  <p className="text-[10px] text-muted-foreground">Headers matched automatically</p>
                </div>
                <div className="max-h-[200px] overflow-y-auto rounded-xl border border-border/50 divide-y divide-border/50 bg-background">
                  {previewData.map((row, i) => (
                    <div key={i} className="p-3 flex items-center justify-between text-xs">
                      <div>
                        <p className="font-bold">{row.name}</p>
                        <p className="text-muted-foreground">{row.email || 'No email'}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-mono text-[10px]">{row.wallet_address.substring(0, 6)}...{row.wallet_address.substring(row.wallet_address.length - 4)}</p>
                        <p className="text-primary font-bold">{row.role || 'No role'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="bg-primary/5 border border-primary/10 rounded-2xl p-4 flex gap-3">
          <Check className="h-5 w-5 text-primary shrink-0" />
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            CSV should include headers like: <strong>Name, Role, Email, Wallet Address, Rate, Frequency</strong>. Other fields will use default values.
          </p>
        </div>

        <Button 
          className="w-full h-14 rounded-2xl text-base font-bold shadow-xl shadow-primary/20 bg-primary"
          onClick={handleImport}
          disabled={!file || !!error || isParsing || isSubmitting || previewData.length === 0}
        >
          {isSubmitting ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Upload className="mr-2 h-4 w-4" />
          )}
          {isSubmitting ? "Importing..." : `Import ${previewData.length} Recipients`}
        </Button>
      </div>
    </Modal>
  )
}
