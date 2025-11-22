"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

type Area = { x: number; y: number; width: number; height: number }

interface CropperContextType {
  image: string
  zoom: number
  crop: { x: number; y: number }
  setCrop: (crop: { x: number; y: number }) => void
  onCropChange?: (pixels: Area | null) => void
  onZoomChange?: (zoom: number) => void
}

const CropperContext = React.createContext<CropperContextType | undefined>(
  undefined
)

interface CropperProps extends React.HTMLAttributes<HTMLDivElement> {
  image: string
  zoom?: number
  onCropChange?: (pixels: Area | null) => void
  onZoomChange?: (zoom: number) => void
}

const Cropper = React.forwardRef<HTMLDivElement, CropperProps>(
  ({ className, image, zoom = 1, onCropChange, onZoomChange, children, ...props }, ref) => {
    const [crop, setCrop] = React.useState({ x: 0, y: 0 })
    const [isDragging, setIsDragging] = React.useState(false)
    const [dragStart, setDragStart] = React.useState({ x: 0, y: 0 })
    const containerRef = React.useRef<HTMLDivElement>(null)
    const imageRef = React.useRef<HTMLImageElement>(null)

    const calculateCropArea = React.useCallback(() => {
      if (!containerRef.current || !imageRef.current) return null

      const containerRect = containerRef.current.getBoundingClientRect()
      const imageElement = imageRef.current

      const naturalWidth = imageElement.naturalWidth
      const naturalHeight = imageElement.naturalHeight
      const displayWidth = imageElement.width * zoom
      const displayHeight = imageElement.height * zoom

      const cropSize = Math.min(containerRect.width, containerRect.height)

      const scaleX = naturalWidth / displayWidth
      const scaleY = naturalHeight / displayHeight

      const cropX = ((containerRect.width - displayWidth) / 2 - crop.x) * scaleX
      const cropY = ((containerRect.height - displayHeight) / 2 - crop.y) * scaleY
      const cropWidth = cropSize * scaleX
      const cropHeight = cropSize * scaleY

      return {
        x: Math.max(0, cropX),
        y: Math.max(0, cropY),
        width: cropWidth,
        height: cropHeight,
      }
    }, [crop, zoom])

    React.useEffect(() => {
      const area = calculateCropArea()
      onCropChange?.(area)
    }, [calculateCropArea, onCropChange])

    const handleMouseDown = (e: React.MouseEvent) => {
      setIsDragging(true)
      setDragStart({ x: e.clientX - crop.x, y: e.clientY - crop.y })
    }

    const handleMouseMove = (e: React.MouseEvent) => {
      if (!isDragging) return
      setCrop({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      })
    }

    const handleMouseUp = () => {
      setIsDragging(false)
    }

    return (
      <CropperContext.Provider
        value={{ image, zoom, crop, setCrop, onCropChange, onZoomChange }}
      >
        <div
          ref={ref}
          className={cn("relative overflow-hidden bg-black", className)}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          {...props}
        >
          <div ref={containerRef} className="relative h-full w-full">
            {children}
          </div>
        </div>
      </CropperContext.Provider>
    )
  }
)
Cropper.displayName = "Cropper"

const CropperImage = React.forwardRef<
  HTMLImageElement,
  React.ImgHTMLAttributes<HTMLImageElement>
>(({ className, ...props }, ref) => {
  const context = React.useContext(CropperContext)
  if (!context) throw new Error("CropperImage must be used within Cropper")

  const { image, zoom, crop } = context

  return (
    <img
      ref={ref}
      src={image}
      alt="Crop preview"
      className={cn("pointer-events-none absolute select-none", className)}
      style={{
        transform: `translate(${crop.x}px, ${crop.y}px) scale(${zoom})`,
        transformOrigin: "center",
        maxWidth: "none",
      }}
      draggable={false}
      {...props}
    />
  )
})
CropperImage.displayName = "CropperImage"

const CropperCropArea = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-[0_0_0_9999px_rgba(0,0,0,0.5)]",
        className
      )}
      style={{
        width: "min(80%, 320px)",
        height: "min(80%, 320px)",
      }}
      {...props}
    />
  )
})
CropperCropArea.displayName = "CropperCropArea"

const CropperDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, children, ...props }, ref) => {
  return (
    <p
      ref={ref}
      className={cn("sr-only", className)}
      {...props}
    >
      {children || "Drag to reposition the image within the crop area"}
    </p>
  )
})
CropperDescription.displayName = "CropperDescription"

export { Cropper, CropperImage, CropperCropArea, CropperDescription }

