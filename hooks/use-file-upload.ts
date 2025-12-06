"use client"

import { useCallback, useRef, useState } from "react"

interface FileWithPreview {
  id: string
  file: File
  preview: string
}

interface UseFileUploadOptions {
  accept?: string
  maxFiles?: number
  maxSize?: number
  onFilesChange?: (files: FileWithPreview[]) => void
  onError?: (message: string) => void
}

type UseFileUploadReturn = [
  {
    files: FileWithPreview[]
    isDragging: boolean
  },
  {
    handleDragEnter: (e: React.DragEvent) => void
    handleDragLeave: (e: React.DragEvent) => void
    handleDragOver: (e: React.DragEvent) => void
    handleDrop: (e: React.DragEvent) => void
    openFileDialog: () => void
    removeFile: (id: string) => void
    getInputProps: () => {
      ref: React.RefObject<HTMLInputElement | null>
      type: "file"
      accept: string
      multiple: boolean
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
    }
  }
]

function validateFileType(file: File, acceptPattern: string): boolean {
  if (acceptPattern === "*") return true

  const acceptedTypes = acceptPattern.split(",").map(t => t.trim())
  const fileType = file.type.toLowerCase()
  const fileName = file.name.toLowerCase()

  return acceptedTypes.some(type => {
    if (type.startsWith(".")) {
      return fileName.endsWith(type)
    }
    if (type.endsWith("/*")) {
      const prefix = type.slice(0, -2)
      return fileType.startsWith(prefix)
    }
    return fileType === type
  })
}

export function useFileUpload(
  options: UseFileUploadOptions = {}
): UseFileUploadReturn {
  const {
    accept = "*",
    maxFiles = 1,
    maxSize = 5 * 1024 * 1024,
    onFilesChange,
    onError,
  } = options

  const [files, setFiles] = useState<FileWithPreview[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const dragCounter = useRef(0)

  const addFiles = useCallback(
    (newFiles: File[]) => {
      const validFiles: File[] = []

      for (const file of newFiles) {
        if (!validateFileType(file, accept)) {
          onError?.(`${file.name} is not a supported file type. Please upload a PNG, JPG, or JPEG image.`)
          continue
        }

        if (maxSize && file.size > maxSize) {
          const sizeMB = (maxSize / (1024 * 1024)).toFixed(1)
          onError?.(`${file.name} is too large. Maximum file size is ${sizeMB}MB.`)
          continue
        }

        validFiles.push(file)
      }

      const filesToAdd = validFiles.slice(0, maxFiles - files.length)

      const filesWithPreview: FileWithPreview[] = filesToAdd.map((file) => ({
        id: crypto.randomUUID(),
        file,
        preview: URL.createObjectURL(file),
      }))

      setFiles((prev) => {
        const updated = [...prev, ...filesWithPreview].slice(0, maxFiles)
        onFilesChange?.(updated)
        return updated
      })
    },
    [files.length, maxFiles, maxSize, onFilesChange, onError, accept]
  )

  const removeFile = useCallback(
    (id: string) => {
      setFiles((prev) => {
        const fileToRemove = prev.find((f) => f.id === id)
        if (fileToRemove) {
          URL.revokeObjectURL(fileToRemove.preview)
        }
        const updated = prev.filter((f) => f.id !== id)
        onFilesChange?.(updated)
        return updated
      })
    },
    [onFilesChange]
  )

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    dragCounter.current++
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true)
    }
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    dragCounter.current--
    if (dragCounter.current === 0) {
      setIsDragging(false)
    }
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragging(false)
      dragCounter.current = 0

      const droppedFiles = Array.from(e.dataTransfer.files)
      addFiles(droppedFiles)
    },
    [addFiles]
  )

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        const selectedFiles = Array.from(e.target.files)
        addFiles(selectedFiles)
        e.target.value = ""
      }
    },
    [addFiles]
  )

  const openFileDialog = useCallback(() => {
    inputRef.current?.click()
  }, [])

  const getInputProps = useCallback(
    () => ({
      ref: inputRef,
      type: "file" as const,
      accept,
      multiple: maxFiles > 1,
      onChange: handleFileInputChange,
    }),
    [accept, maxFiles, handleFileInputChange]
  )

  return [
    { files, isDragging },
    {
      handleDragEnter,
      handleDragLeave,
      handleDragOver,
      handleDrop,
      openFileDialog,
      removeFile,
      getInputProps,
    },
  ]
}

