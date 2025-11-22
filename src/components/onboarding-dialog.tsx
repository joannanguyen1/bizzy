"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import {
  ArrowLeftIcon,
  ArrowRight,
  CircleUserRoundIcon,
  XIcon,
  ZoomInIcon,
  ZoomOutIcon,
  Check,
} from "lucide-react"
import { useFileUpload } from "@/hooks/use-file-upload"
import { Button } from "@/components/ui/button"
import {
  Cropper,
  CropperCropArea,
  CropperDescription,
  CropperImage,
} from "@/components/ui/cropper"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Slider } from "@/components/ui/slider"
import { cn } from "@/lib/utils"
import { Card } from "@/components/ui/card"

type Area = { x: number; y: number; width: number; height: number }

const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image()
    image.addEventListener("load", () => resolve(image))
    image.addEventListener("error", (error) => reject(error))
    image.setAttribute("crossOrigin", "anonymous")
    image.src = url
  })

async function getCroppedImg(
  imageSrc: string,
  pixelCrop: Area,
  outputWidth: number = pixelCrop.width,
  outputHeight: number = pixelCrop.height
): Promise<Blob | null> {
  try {
    const image = await createImage(imageSrc)
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")

    if (!ctx) {
      return null
    }

    canvas.width = outputWidth
    canvas.height = outputHeight

    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      outputWidth,
      outputHeight
    )

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob)
      }, "image/jpeg")
    })
  } catch (error) {
    console.error("Error in getCroppedImg:", error)
    return null
  }
}

interface InterestCategory {
  id: string
  label: string
  emoji: string
}

const INTEREST_CATEGORIES: InterestCategory[] = [
  { id: "amusement_park", label: "Amusement Parks", emoji: "🎢" },
  { id: "aquarium", label: "Aquariums", emoji: "🐠" },
  { id: "museum", label: "Museums", emoji: "🏛️" },
  { id: "movie_theater", label: "Movies", emoji: "🎬" },
  { id: "night_club", label: "Nightlife", emoji: "🎉" },
  { id: "park", label: "Parks", emoji: "🌳" },
  { id: "zoo", label: "Zoos", emoji: "🦁" },
  { id: "restaurant", label: "Restaurants", emoji: "🍽️" },
  { id: "cafe", label: "Cafes", emoji: "☕" },
  { id: "bar", label: "Bars", emoji: "🍺" },
  { id: "bakery", label: "Bakeries", emoji: "🥐" },
  { id: "gym", label: "Gyms", emoji: "💪" },
  { id: "art_gallery", label: "Art Galleries", emoji: "🎨" },
  { id: "library", label: "Libraries", emoji: "📚" },
  { id: "beach", label: "Beaches", emoji: "🏖️" },
]

interface User {
  id: string
  name: string
  image: string | null
  sharedInterests: number
}

interface OnboardingDialogProps {
  open: boolean
  userId: string
  onComplete: () => void
}

export function OnboardingDialog({ open, userId, onComplete }: OnboardingDialogProps) {
  const [step, setStep] = useState(1)
  const [selectedInterests, setSelectedInterests] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [suggestedUsers, setSuggestedUsers] = useState<User[]>([])
  const [loadingUsers, setLoadingUsers] = useState(false)

  const [
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
  ] = useFileUpload({
    accept: "image/*",
  })

  const previewUrl = files[0]?.preview || null
  const fileId = files[0]?.id

  const [finalImageUrl, setFinalImageUrl] = useState<string | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const previousFileIdRef = useRef<string | undefined | null>(null)

  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)

  const [zoom, setZoom] = useState(1)

  const handleCropChange = useCallback((pixels: Area | null) => {
    setCroppedAreaPixels(pixels)
  }, [])

  const handleApply = async () => {
    if (!previewUrl || !fileId || !croppedAreaPixels) {
      if (fileId) {
        removeFile(fileId)
        setCroppedAreaPixels(null)
      }
      return
    }

    try {
      const croppedBlob = await getCroppedImg(previewUrl, croppedAreaPixels)

      if (!croppedBlob) {
        throw new Error("Failed to generate cropped image blob.")
      }

      const newFinalUrl = URL.createObjectURL(croppedBlob)

      if (finalImageUrl) {
        URL.revokeObjectURL(finalImageUrl)
      }

      setFinalImageUrl(newFinalUrl)

      setIsDialogOpen(false)
    } catch (error) {
      console.error("Error during apply:", error)
      setIsDialogOpen(false)
    }
  }

  const handleRemoveFinalImage = () => {
    if (finalImageUrl) {
      URL.revokeObjectURL(finalImageUrl)
    }
    setFinalImageUrl(null)
  }

  useEffect(() => {
    const currentFinalUrl = finalImageUrl
    return () => {
      if (currentFinalUrl && currentFinalUrl.startsWith("blob:")) {
        URL.revokeObjectURL(currentFinalUrl)
      }
    }
  }, [finalImageUrl])

  useEffect(() => {
    if (fileId && fileId !== previousFileIdRef.current) {
      setIsDialogOpen(true)
      setCroppedAreaPixels(null)
      setZoom(1)
    }
    previousFileIdRef.current = fileId
  }, [fileId])

  const toggleInterest = (interestId: string) => {
    setSelectedInterests((prev) =>
      prev.includes(interestId)
        ? prev.filter((id) => id !== interestId)
        : [...prev, interestId]
    )
  }

  const fetchSuggestedUsers = async () => {
    setLoadingUsers(true)
    try {
      const response = await fetch(
        `/api/users/suggestions?interests=${encodeURIComponent(
          JSON.stringify(selectedInterests)
        )}`
      )
      if (response.ok) {
        const data = await response.json()
        setSuggestedUsers(data.users || [])
      }
    } catch (error) {
      console.error("Error fetching users:", error)
    } finally {
      setLoadingUsers(false)
    }
  }

  const handleNextStep = () => {
    if (step === 1) {
      setStep(2)
    } else if (step === 2) {
      fetchSuggestedUsers()
      setStep(3)
    }
  }

  const handleComplete = async () => {
    setIsSubmitting(true)
    try {
      const response = await fetch("/api/onboarding", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          interests: selectedInterests,
        }),
      })

      if (response.ok) {
        onComplete()
      } else {
        console.error("Failed to save onboarding data")
      }
    } catch (error) {
      console.error("Error completing onboarding:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const totalSteps = 3

  const stepContent = [
    {
      title: "Choose Your Interests",
      description: "Select the types of places you'd like to discover",
    },
    {
      title: "Add Profile Picture",
      description: "Personalize your profile with a photo (optional)",
    },
    {
      title: "Connect With Others",
      description: "Discover people with similar interests",
    },
  ]

  return (
    <>
      <Dialog open={open} onOpenChange={() => {}}>
        <DialogContent
          className="gap-0 p-0 sm:max-w-2xl"
          onPointerDownOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
        >
          <DialogDescription className="sr-only">
            Complete your profile setup
          </DialogDescription>
          <div className="space-y-6 px-6 pb-6 pt-6">
            <DialogHeader>
              <DialogTitle className="text-2xl">{stepContent[step - 1].title}</DialogTitle>
              <DialogDescription className="text-base">
                {stepContent[step - 1].description}
              </DialogDescription>
            </DialogHeader>

            <div className="min-h-[300px]">
              {step === 1 && (
                <div className="grid grid-cols-3 gap-3">
                  {INTEREST_CATEGORIES.map((category) => (
                    <Card
                      key={category.id}
                      className={cn(
                        "cursor-pointer border-2 p-4 transition-all hover:border-amber-500",
                        selectedInterests.includes(category.id)
                          ? "border-amber-500 bg-amber-50"
                          : "border-border"
                      )}
                      onClick={() => toggleInterest(category.id)}
                    >
                      <div className="flex flex-col items-center gap-2 text-center">
                        <span className="text-3xl">{category.emoji}</span>
                        <span className="text-sm font-medium">{category.label}</span>
                        {selectedInterests.includes(category.id) && (
                          <Check className="h-4 w-4 text-amber-600" />
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              )}

              {step === 2 && (
                <div className="flex flex-col items-center gap-4">
                  <div className="relative inline-flex">
                    <button
                      className="relative flex size-32 items-center justify-center overflow-hidden rounded-full border border-dashed border-input transition-colors outline-none hover:bg-accent/50 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 has-disabled:pointer-events-none has-disabled:opacity-50 has-[img]:border-none data-[dragging=true]:bg-accent/50"
                      onClick={openFileDialog}
                      onDragEnter={handleDragEnter}
                      onDragLeave={handleDragLeave}
                      onDragOver={handleDragOver}
                      onDrop={handleDrop}
                      data-dragging={isDragging || undefined}
                      aria-label={finalImageUrl ? "Change image" : "Upload image"}
                    >
                      {finalImageUrl ? (
                        <img
                          className="size-full object-cover"
                          src={finalImageUrl}
                          alt="User avatar"
                          width={128}
                          height={128}
                          style={{ objectFit: "cover" }}
                        />
                      ) : (
                        <div aria-hidden="true">
                          <CircleUserRoundIcon className="size-12 opacity-60" />
                        </div>
                      )}
                    </button>
                    {finalImageUrl && (
                      <Button
                        onClick={handleRemoveFinalImage}
                        size="icon"
                        className="absolute -top-1 -right-1 size-6 rounded-full border-2 border-background shadow-none focus-visible:border-background"
                        aria-label="Remove image"
                      >
                        <XIcon className="size-3.5" />
                      </Button>
                    )}
                    <input
                      {...getInputProps()}
                      className="sr-only"
                      aria-label="Upload image file"
                      tabIndex={-1}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Click or drag to upload a profile picture
                  </p>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-4">
                  {loadingUsers ? (
                    <p className="text-center text-muted-foreground">Loading users...</p>
                  ) : suggestedUsers.length === 0 ? (
                    <p className="text-center text-muted-foreground">
                      No users found yet. Be the first to explore!
                    </p>
                  ) : (
                    <div className="max-h-[400px] space-y-3 overflow-y-auto pr-2">
                      {suggestedUsers.map((user) => (
                        <Card key={user.id} className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              {user.image ? (
                                <img
                                  src={user.image}
                                  alt={user.name}
                                  className="size-12 rounded-full object-cover"
                                />
                              ) : (
                                <div className="flex size-12 items-center justify-center rounded-full bg-amber-100">
                                  <CircleUserRoundIcon className="size-6 text-amber-600" />
                                </div>
                              )}
                              <div>
                                <p className="font-medium">{user.name}</p>
                                {user.sharedInterests > 0 && (
                                  <p className="text-sm text-muted-foreground">
                                    {user.sharedInterests} shared interest
                                    {user.sharedInterests !== 1 ? "s" : ""}
                                  </p>
                                )}
                              </div>
                            </div>
                            <Button variant="outline" size="sm" disabled>
                              Follow
                            </Button>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div className="flex justify-center space-x-1.5 max-sm:order-1">
                {[...Array(totalSteps)].map((_, index) => (
                  <div
                    key={index}
                    className={cn(
                      "h-1.5 w-1.5 rounded-full bg-primary",
                      index + 1 === step ? "bg-primary" : "opacity-20"
                    )}
                  />
                ))}
              </div>
              <DialogFooter>
                <Button type="button" variant="ghost" onClick={handleNextStep}>
                  Skip
                </Button>
                {step < totalSteps ? (
                  <Button className="group" type="button" onClick={handleNextStep}>
                    Next
                    <ArrowRight
                      className="-me-1 ms-2 opacity-60 transition-transform group-hover:translate-x-0.5"
                      size={16}
                      strokeWidth={2}
                      aria-hidden="true"
                    />
                  </Button>
                ) : (
                  <Button
                    type="button"
                    onClick={handleComplete}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Completing..." : "Complete"}
                  </Button>
                )}
              </DialogFooter>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="gap-0 p-0 sm:max-w-140 *:[button]:hidden">
          <DialogDescription className="sr-only">
            Crop image dialog
          </DialogDescription>
          <DialogHeader className="contents space-y-0 text-left">
            <DialogTitle className="flex items-center justify-between border-b p-4 text-base">
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="-my-1 opacity-60"
                  onClick={() => setIsDialogOpen(false)}
                  aria-label="Cancel"
                >
                  <ArrowLeftIcon aria-hidden="true" />
                </Button>
                <span>Crop image</span>
              </div>
              <Button
                className="-my-1"
                onClick={handleApply}
                disabled={!previewUrl}
                autoFocus
              >
                Apply
              </Button>
            </DialogTitle>
          </DialogHeader>
          {previewUrl && (
            <Cropper
              className="h-96 sm:h-120"
              image={previewUrl}
              zoom={zoom}
              onCropChange={handleCropChange}
              onZoomChange={setZoom}
            >
              <CropperDescription />
              <CropperImage />
              <CropperCropArea />
            </Cropper>
          )}
          <DialogFooter className="border-t px-4 py-6">
            <div className="mx-auto flex w-full max-w-80 items-center gap-4">
              <ZoomOutIcon
                className="shrink-0 opacity-60"
                size={16}
                aria-hidden="true"
              />
              <Slider
                defaultValue={[1]}
                value={[zoom]}
                min={1}
                max={3}
                step={0.1}
                onValueChange={(value) => setZoom(value[0])}
                aria-label="Zoom slider"
              />
              <ZoomInIcon
                className="shrink-0 opacity-60"
                size={16}
                aria-hidden="true"
              />
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

