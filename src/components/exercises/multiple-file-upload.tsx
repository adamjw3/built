"use client"

import { useEffect, useRef, useState } from "react"
import { X, Image } from "lucide-react"

interface MultipleFileUploadProps {
  value: string[]
  onChange: (value: string[]) => void
  maxFiles?: number
}

export function MultipleFileUpload({
  value,
  onChange,
  maxFiles = 4
}: MultipleFileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [previews, setPreviews] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)

  // Handle existing images from server (when editing)
  useEffect(() => {
    if (value && value.length > 0) {
      const existingPreviews = value.map(filename =>
        filename.startsWith('data:') ? filename : `/images/exercises/${filename}`
      )
      setPreviews(existingPreviews)
    } else {
      setPreviews([])
    }
  }, [value])

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    const validFiles = files.filter(file =>
      ['image/gif', 'image/jpeg', 'image/jpg', 'image/png'].includes(file.type)
    )

    if (validFiles.length + value.length > maxFiles) {
      alert(`Maximum ${maxFiles} images allowed`)
      return
    }

    setUploading(true)

    try {
      // Create previews and filenames
      const newPreviews: string[] = []
      const newFileNames: string[] = []

      // Process files sequentially to maintain order
      for (const file of validFiles) {
        const preview = await new Promise<string>((resolve) => {
          const reader = new FileReader()
          reader.onload = (e) => resolve(e.target?.result as string)
          reader.readAsDataURL(file)
        })
        newPreviews.push(preview)
        newFileNames.push(file.name)
      }

      setPreviews([...previews, ...newPreviews])
      onChange([...value, ...newFileNames])
    } catch (error) {
      console.error('Error processing files:', error)
      alert('Error processing files. Please try again.')
    } finally {
      setUploading(false)
      // Clear the file input
      if (event.target) {
        event.target.value = ''
      }
    }
  }

  const removeImage = (index: number) => {
    const newValue = value.filter((_, i) => i !== index)
    const newPreviews = previews.filter((_, i) => i !== index)
    onChange(newValue)
    setPreviews(newPreviews)
  }

  const openFileDialog = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="space-y-4">
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".gif,.jpg,.jpeg,.png"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Photos Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">PHOTOS</h3>
        <div className="text-xs text-gray-400">
          {value.length}/{maxFiles}
        </div>
      </div>

      {/* Horizontal layout with slots */}
      <div className="grid grid-cols-4 gap-3">
        {Array.from({ length: maxFiles }).map((_, index) => (
          <div key={index} className="relative">
            {value[index] ? (
              <div className="relative aspect-square border border-gray-200 rounded-lg overflow-hidden bg-white">
                {previews[index] ? (
                  <img
                    src={previews[index]}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                    <Image className="h-8 w-8 text-gray-400" />
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute -top-2 -right-2 bg-black text-white rounded-full p-1 hover:bg-gray-800 shadow-md"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={openFileDialog}
                disabled={value.length >= maxFiles || uploading}
                className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center hover:border-gray-400 hover:bg-gray-50/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 bg-white"
              >
                <div className="flex flex-col items-center justify-center space-y-2">
                  <div className="w-8 h-8 border border-gray-300 rounded-md flex items-center justify-center bg-gray-50">
                    <Image className="h-4 w-4 text-gray-400" />
                  </div>
                  <div className="text-xl text-gray-400 font-light">+</div>
                </div>
              </button>
            )}
          </div>
        ))}
      </div>

      {/* File info */}
      <div className="text-xs text-gray-500 flex items-center justify-between">
        <span>Accepts: GIF, JPG, PNG</span>
        {uploading && <span className="text-blue-600">Processing files...</span>}
      </div>
    </div>
  )
}
