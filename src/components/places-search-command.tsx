"use client"

import * as React from "react"
import { SearchIcon, MapPinIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import Script from "next/script"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"

type PlaceSuggestion = google.maps.places.AutocompleteSuggestion

type ExtendedPlacePrediction = google.maps.places.PlacePrediction & {
  structuredFormat?: {
    mainText?: {
      text: string
    }
    secondaryText?: {
      text: string
    }
  }
}

type UserLocation = {
  lat: number
  lng: number
} | null

export default function PlacesSearchCommand() {
  const router = useRouter()
  const [open, setOpen] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [places, setPlaces] = React.useState<PlaceSuggestion[]>([])
  const [isLoading, setIsLoading] = React.useState(false)
  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null)

  const [userLocation, setUserLocation] = React.useState<UserLocation>(null)
  const [isRequestingLocation, setIsRequestingLocation] = React.useState(false)
  const locationRequestedRef = React.useRef(false)

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  React.useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    const trimmed = searchQuery.trim()

    if (
      trimmed &&
      !locationRequestedRef.current &&
      !userLocation &&
      typeof navigator !== "undefined" &&
      "geolocation" in navigator
    ) {
      locationRequestedRef.current = true
      setIsRequestingLocation(true)

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          })
          setIsRequestingLocation(false)
        },
        (err) => {
          console.info("Geolocation error in search:", err.message)
          setIsRequestingLocation(false)
        },
        {
          enableHighAccuracy: true,
          maximumAge: 0,
          timeout: 10000,
        }
      )
    }

    if (!trimmed) {
      setPlaces([])
      setIsLoading(false)
      return
    }

    setIsLoading(true)

    timeoutRef.current = setTimeout(async () => {
      if (typeof window === "undefined" || !window.google?.maps?.places) {
        console.error("Google Maps API not loaded yet")
        setIsLoading(false)
        return
      }

      try {
        const requestOptions: any = {
          input: trimmed,
          locationRestriction: {
            south: 39.86,
            west: -75.30,
            north: 40.14,
            east: -74.95,
          },
          region: "us",
        }

        if (userLocation) {
          requestOptions.origin = new google.maps.LatLng(
            userLocation.lat,
            userLocation.lng
          )
        }

        const { suggestions } =
          await google.maps.places.AutocompleteSuggestion.fetchAutocompleteSuggestions(
            requestOptions
          )

        setIsLoading(false)
        const validSuggestions = suggestions?.filter((s) => s.placePrediction) || []
        setPlaces(validSuggestions)
      } catch (error) {
        console.error("Error fetching place suggestions:", error)
        setIsLoading(false)
        setPlaces([])
      }
    }, 500)

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [searchQuery, userLocation])

  const handleSelectPlace = (placeId: string) => {
    router.push(`/map/places/${encodeURIComponent(placeId)}`)
    setOpen(false)
    setSearchQuery("")
  }

  const formatMiles = (meters?: number | null) => {
    if (meters == null) return ""; 
    const miles = meters * 0.000621371;
    if (miles < 0.1) return "<0.1 mi";
    return `${miles.toFixed(1)} mi`;
  };

  return (
    <>
      <Script
        id="google-maps-script"
        src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`}
        strategy="afterInteractive"
      />
      <button
        className="inline-flex h-9 w-fit rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-xs transition-[color,box-shadow] outline-none placeholder:text-muted-foreground/70 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
        onClick={() => setOpen(true)}
      >
        <span className="flex grow items-center">
          <SearchIcon
            className="-ms-1 me-3 text-muted-foreground/80"
            size={16}
            aria-hidden="true"
          />
        <span className="font-normal text-muted-foreground/70">
          Search places...
        </span>
        </span>
        <kbd className="ms-12 -me-1 inline-flex h-5 max-h-full items-center rounded border bg-background px-1 font-[inherit] text-[0.625rem] font-medium text-muted-foreground/70">
          ⌘K
        </kbd>
      </button>
      <CommandDialog open={open} onOpenChange={setOpen} title="Search places">
        <CommandInput
          placeholder="Search places in Philadelphia..."
          value={searchQuery}
          onValueChange={setSearchQuery}
        />
        <CommandList>
          <CommandEmpty>
            {isLoading
              ? "Searching..."
              : isRequestingLocation
              ? "Requesting your location..."
              : "No places found."}
          </CommandEmpty>
          {places.length > 0 && (
            <CommandGroup heading="Places">
              {places.map((suggestion) => {
                const prediction =
                  suggestion.placePrediction as ExtendedPlacePrediction | null
                if (!prediction?.placeId) return null

                const distanceLabel = formatMiles(prediction.distanceMeters)

                return (
                  <CommandItem
                    key={prediction.placeId}
                    onSelect={() => {
                      if (prediction.placeId) {
                        handleSelectPlace(prediction.placeId)
                      } else {
                        setSearchQuery(prediction.text?.text || "")
                      }
                    }}
                    className="cursor-pointer flex items-center justify-between"
                  >
                    <div className="flex items-start">
                      <MapPinIcon className="mr-2 mt-[2px] h-4 w-4" />
                      <div className="flex flex-col">
                        <span>
                          {prediction.structuredFormat?.mainText?.text ||
                            prediction.text?.text ||
                            ""}
                        </span>
                        {prediction.structuredFormat?.secondaryText?.text && (
                          <span className="text-xs text-muted-foreground">
                            {prediction.structuredFormat.secondaryText.text}
                          </span>
                        )}
                      </div>
                    </div>

                    {distanceLabel && (
                      <span className="ml-4 text-xs text-muted-foreground whitespace-nowrap">
                        {distanceLabel} away
                      </span>
                    )}
                  </CommandItem>
                )
              })}
            </CommandGroup>
          )}
        </CommandList>
      </CommandDialog>
    </>
  )
}

