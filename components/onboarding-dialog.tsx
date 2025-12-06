"use client"

import { useCallback, useEffect, useRef, useState, useMemo } from "react"
import {
  ArrowLeftIcon,
  ArrowRight,
  CircleUserRoundIcon,
  XIcon,
  ZoomInIcon,
  ZoomOutIcon,
  CheckIcon,
} from "lucide-react"
import { toast } from "sonner"
import { useFileUpload } from "@/hooks/use-file-upload"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
import { motion, AnimatePresence } from "framer-motion"
import { nameSchema } from "@/schema/auth-schema"
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from "./ui/alert-dialog"

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
  mimeType: string = "image/jpeg",
  outputWidth: number = pixelCrop.width,
  outputHeight: number = pixelCrop.height
): Promise<Blob | null> {
  try {
    const image = await createImage(imageSrc)
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d", { alpha: true })

    if (!ctx) {
      return null
    }

    canvas.width = outputWidth
    canvas.height = outputHeight

    if (mimeType === "image/png") {
      ctx.clearRect(0, 0, outputWidth, outputHeight)
    }

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

    const quality = mimeType === "image/jpeg" ? 0.95 : undefined

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob)
      }, mimeType, quality)
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
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [firstNameError, setFirstNameError] = useState("")
  const [lastNameError, setLastNameError] = useState("")
  const [selectedInterests, setSelectedInterests] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [suggestedUsers, setSuggestedUsers] = useState<User[]>([])
  const [loadingUsers, setLoadingUsers] = useState(false)
  const [followingUsers, setFollowingUsers] = useState<Set<string>>(new Set())

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
    accept: "image/png, image/jpeg, image/jpg",
    maxSize: 5 * 1024 * 1024,
    onError: (message) => toast.error(message),
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
      const originalFile = files[0]?.file
      const mimeType = originalFile?.type || "image/jpeg"

      const croppedBlob = await getCroppedImg(previewUrl, croppedAreaPixels, mimeType)

      if (!croppedBlob) {
        throw new Error("Failed to generate cropped image blob.")
      }

      const newFinalUrl = URL.createObjectURL(croppedBlob)

      if (finalImageUrl) {
        URL.revokeObjectURL(finalImageUrl)
      }

      setFinalImageUrl(newFinalUrl)

      removeFile(fileId)
      previousFileIdRef.current = null
      setCroppedAreaPixels(null)
      setZoom(1)

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
    previousFileIdRef.current = null
    setCroppedAreaPixels(null)
    setZoom(1)
  }

  const handleCancelCrop = () => {
    if (fileId) {
      removeFile(fileId)
      setCroppedAreaPixels(null)
      setZoom(1)
      previousFileIdRef.current = null
    }
    setIsDialogOpen(false)
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

  const isStep1Valid = useMemo(() => {
    if (!firstName.trim() || !lastName.trim()) {
      return false
    }

    const validation = nameSchema.safeParse({
      firstName: firstName,
      lastName: lastName,
    })

    return validation.success
  }, [firstName, lastName])

  const validateNames = () => {
    setFirstNameError("")
    setLastNameError("")

    const validation = nameSchema.safeParse({
      firstName: firstName,
      lastName: lastName,
    })

    if (!validation.success) {
      const errors = validation.error.flatten().fieldErrors
      if (errors.firstName?.[0]) {
        setFirstNameError(errors.firstName[0])
      }
      if (errors.lastName?.[0]) {
        setLastNameError(errors.lastName[0])
      }
      return null
    }

    return validation.data
  }

  const handleNextStep = async () => {
    if (step === 1) {
      const validatedData = validateNames()
      if (validatedData) {
        try {
          const response = await fetch("/api/profile/update-name", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              name: `${validatedData.firstName} ${validatedData.lastName}`,
            }),
          })

          if (response.ok) {
            setFirstName(validatedData.firstName)
            setLastName(validatedData.lastName)
            setStep(2)
          } else {
            const data = await response.json()
            toast.error(data.error || "Failed to update name")
          }
        } catch (error) {
          console.error("Error updating name:", error)
          toast.error("Failed to update name")
        }
      }
    } else if (step === 2) {
      setStep(3)
    } else if (step === 3) {
      fetchSuggestedUsers()
      setStep(4)
    }
  }

  const handleFollowUser = async (targetUserId: string) => {
    const isCurrentlyFollowing = followingUsers.has(targetUserId)

    setFollowingUsers((prev) => {
      const updated = new Set(prev)
      if (isCurrentlyFollowing) {
        updated.delete(targetUserId)
      } else {
        updated.add(targetUserId)
      }
      return updated
    })

    try {
      const response = await fetch(`/api/users/${targetUserId}/follow`, {
        method: isCurrentlyFollowing ? "DELETE" : "POST",
      })

      if (!response.ok) {
        const data = await response.json()
        if (data.error === "Already following this user") {
          return
        }
        throw new Error(data.error || "Failed to update follow status")
      }
    } catch (error) {
      setFollowingUsers((prev) => {
        const updated = new Set(prev)
        if (isCurrentlyFollowing) {
          updated.add(targetUserId)
        } else {
          updated.delete(targetUserId)
        }
        return updated
      })
      console.error("Error following user:", error)
      toast.error("Failed to update follow status")
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

  const totalSteps = 4

  const stepContent = [
    {
      title: "Tell Us Your Name",
      description: "Let's get to know you better",
    },
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
      <AlertDialog open={open}>
        <AlertDialogContent
          className="gap-0 p-0 sm:max-w-2xl"
        >
          <AlertDialogDescription className="sr-only">
            Complete your profile setup
          </AlertDialogDescription>
          <div className="space-y-6 px-6 pb-6 pt-6">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-2xl">{stepContent[step - 1].title}</AlertDialogTitle>
              <AlertDialogDescription className="text-base">
                {stepContent[step - 1].description}
              </AlertDialogDescription>
            </AlertDialogHeader>

            <div className="min-h-[300px]">
              {step === 1 && (
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        type="text"
                        placeholder="Enter your first name"
                        value={firstName}
                        onChange={(e) => {
                          const value = e.target.value
                          setFirstName(value)

                          if (value.trim()) {
                            const result = nameSchema.shape.firstName.safeParse(value)
                            if (!result.success) {
                              setFirstNameError(result.error.issues[0]?.message || "Invalid first name")
                            } else {
                              setFirstNameError("")
                            }
                          } else {
                            setFirstNameError("")
                          }
                        }}
                        onBlur={() => {
                          if (firstName.trim()) {
                            const result = nameSchema.shape.firstName.safeParse(firstName)
                            if (!result.success) {
                              setFirstNameError(result.error.issues[0]?.message || "Invalid first name")
                            }
                          } else {
                            setFirstNameError("First name is required")
                          }
                        }}
                        className={cn("w-full", firstNameError && "border-red-500")}
                        maxLength={15}
                        aria-invalid={!!firstNameError}
                        aria-describedby={firstNameError ? "firstName-error" : undefined}
                      />
                      {firstNameError && (
                        <p id="firstName-error" className="text-sm text-red-500">
                          {firstNameError}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {firstName.length}/15 characters
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        type="text"
                        placeholder="Enter your last name"
                        value={lastName}
                        onChange={(e) => {
                          const value = e.target.value
                          setLastName(value)

                          if (value.trim()) {
                            const result = nameSchema.shape.lastName.safeParse(value)
                            if (!result.success) {
                              setLastNameError(result.error.issues[0]?.message || "Invalid last name")
                            } else {
                              setLastNameError("")
                            }
                          } else {
                            setLastNameError("")
                          }
                        }}
                        onBlur={() => {
                          if (lastName.trim()) {
                            const result = nameSchema.shape.lastName.safeParse(lastName)
                            if (!result.success) {
                              setLastNameError(result.error.issues[0]?.message || "Invalid last name")
                            }
                          } else {
                            setLastNameError("Last name is required")
                          }
                        }}
                        className={cn("w-full", lastNameError && "border-red-500")}
                        maxLength={15}
                        aria-invalid={!!lastNameError}
                        aria-describedby={lastNameError ? "lastName-error" : undefined}
                      />
                      {lastNameError && (
                        <p id="lastName-error" className="text-sm text-red-500">
                          {lastNameError}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {lastName.length}/15 characters
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {step === 2 && (
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
                        <span className="text-sm font-medium flex items-center gap-2">
                          {category.label}
                          <AnimatePresence mode="wait">
                            {selectedInterests.includes(category.id) && (
                              <motion.div
                                key="check-icon"
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 10 }}
                                transition={{ duration: 0.15, ease: "easeInOut" }}
                              >
                                <CheckIcon className="h-4 w-4 text-amber-600" />
                              </motion.div>
                            )}
                          </AnimatePresence>
                          </span>
                      </div>
                    </Card>
                  ))}
                </div>
              )}

              {step === 3 && (
                <div className="flex flex-col items-center gap-4">
                  <div className="relative inline-flex">
                    <button
                      className="relative flex size-32 items-center justify-center overflow-hidden rounded-full border border-dashed border-input outline-none hover:bg-accent/50 hover:brightness-75 transition-all focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 has-disabled:pointer-events-none has-disabled:opacity-50 has-[img]:border-none data-[dragging=true]:bg-accent/50"
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

              {step === 4 && (
                <div className="space-y-4">
                  {followingUsers.size === 0 && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
                      <p className="text-sm text-amber-800">
                        Follow at least 1 person to complete onboarding
                      </p>
                    </div>
                  )}
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
                            <Button
                              variant={followingUsers.has(user.id) ? "default" : "outline"}
                              size="sm"
                              onClick={() => handleFollowUser(user.id)}
                            >
                              {followingUsers.has(user.id) ? "Following" : "Follow"}
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
                {step === 3 && (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={handleNextStep}
                  >
                    Skip
                  </Button>
                )}
                {step < totalSteps ? (
                  <Button
                    className="group"
                    type="button"
                    onClick={handleNextStep}
                    disabled={(step === 1 && !isStep1Valid) || (step === 2 && selectedInterests.length === 0)}
                  >
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
                    disabled={isSubmitting || followingUsers.size === 0}
                  >
                    {isSubmitting ? "Completing..." : "Complete"}
                  </Button>
                )}
              </DialogFooter>
            </div>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={isDialogOpen} onOpenChange={(open) => !open && handleCancelCrop()}>
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
                  onClick={handleCancelCrop}
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
              className="h-96 sm:h-120 bg-black"
              image={previewUrl}
              zoom={zoom}
              aspectRatio={1}
              minZoom={1}
              maxZoom={4}
              onCropChange={handleCropChange}
              onZoomChange={setZoom}
            >
              <CropperDescription>
                Drag to reposition the image. Use the slider below to zoom in or out.
              </CropperDescription>
              <CropperImage />
              <CropperCropArea className="rounded-full" />
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
                max={4}
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

