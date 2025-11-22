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
}

interface UseFileUploadReturn {
  0: {
    files: FileWithPreview[]
    isDragging: boolean
  }
  1: {
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
}

export function useFileUpload(
  options: UseFileUploadOptions = {}
): UseFileUploadReturn {
  const {
    accept = "*",
    maxFiles = 1,
    maxSize = 5 * 1024 * 1024,
    onFilesChange,
  } = options

  const [files, setFiles] = useState<FileWithPreview[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const dragCounter = useRef(0)

  const addFiles = useCallback(
    (newFiles: File[]) => {
      const validFiles = newFiles.filter((file) => {
        if (maxSize && file.size > maxSize) {
          console.warn(`File ${file.name} is too large`)
          return false
        }
        return true
      })

      const filesToAdd = validFiles.slice(0, maxFiles - files.length)

      const filesWithPreview: FileWithPreview[] = filesToAdd.map((file) => ({
        id: Math.random().toString(36).substring(7),
        file,
        preview: URL.createObjectURL(file),
      }))

      setFiles((prev) => {
        const updated = [...prev, ...filesWithPreview].slice(0, maxFiles)
        onFilesChange?.(updated)
        return updated
      })
    },
    [files.length, maxFiles, maxSize, onFilesChange]
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

