"use client";
import { useId, useState, useEffect, useRef } from "react"
import { MicIcon, SearchIcon, MapPinIcon } from "lucide-react"
import Link from "next/link"
import Script from "next/script"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import BizzyLogo from "./logo"

const DROPDOWN_CLOSE_DELAY = 200;

const links = [
  {
    label: "Feed",
    href: "/",
  },
  {
    label: "Buzz List",
    href: "/buzz-list",
  },
  {
    label: "Leaderboard",
    href: "/leaderboard",
  }
]

type PlaceSuggestion = google.maps.places.AutocompleteSuggestion

interface ExtendedPlacePrediction extends google.maps.places.PlacePrediction {
  structuredFormat?: {
    mainText?: {
      text: string;
    };
    secondaryText?: {
      text: string;
    };
  };
}

export default function NavBar() {
  const id = useId()
  const [searchQuery, setSearchQuery] = useState("")
  const [places, setPlaces] = useState<PlaceSuggestion[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    if (!searchQuery.trim()) {
      queueMicrotask(() => {
        setPlaces([])
        setIsOpen(false)
      })
      return
    }

    queueMicrotask(() => setIsLoading(true))

    timeoutRef.current = setTimeout(async () => {
      if (typeof window === "undefined" || !window.google?.maps?.places) {
        console.error("Google Maps API not loaded yet")
        setIsLoading(false)
        return
      }

      try {
        const { suggestions } = await google.maps.places.AutocompleteSuggestion.fetchAutocompleteSuggestions({
          input: searchQuery,
          locationRestriction: {
            south: 39.86,
            west: -75.30,
            north: 40.14,
            east: -74.95,
          },
          includedPrimaryTypes: ["tourist_attraction", "museum", "park", "shopping_mall", "store"],
          region: "us",
        })

        setIsLoading(false)
        const validSuggestions = suggestions?.filter(s => s.placePrediction) || []
        if (validSuggestions.length > 0) {
          setPlaces(validSuggestions)
          setIsOpen(true)
        } else {
          setPlaces([])
          setIsOpen(false)
        }
      } catch (error) {
        console.error("Error fetching place suggestions:", error)
        setIsLoading(false)
        setPlaces([])
        setIsOpen(false)
      }
    }, 500);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [searchQuery]);

  return (
    <>
      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`}
        strategy="afterInteractive"
      />
      <header className="border-b px-4 md:px-6">
        <div className="flex h-16 items-center justify-between gap-4">
          <div className="flex-1 flex flex-row items-center gap-6">
            <Link href="/" className="text-primary hover:text-primary/90" aria-label="Home">
              <BizzyLogo width={40} height={40} />
            </Link>
            {links.map((link) => (
              <Link key={link.href} href={link.href} className="truncate">
                {link.label}
              </Link>
            ))}
          </div>
          <div className="grow max-sm:hidden">
            <div className="relative mx-auto w-full">
              <Input
                id={id}
                className="peer h-8 px-8"
                placeholder="Search places in Philadelphia..."
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => {
                  if (places.length > 0) setIsOpen(true)
                }}
                onBlur={() => {
                  setTimeout(() => setIsOpen(false), DROPDOWN_CLOSE_DELAY)
                }}
              />
              <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-2 text-muted-foreground/80 peer-disabled:opacity-50">
                <SearchIcon size={16} />
              </div>
              <button
                className="absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center rounded-e-md text-muted-foreground/80 transition-[color,box-shadow] outline-none hover:text-foreground focus:z-10 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Press to speak"
                type="button"
              >
                <MicIcon size={16} aria-hidden="true" />
              </button>

              {isOpen && (
                <div className="absolute top-full mt-1 w-full bg-popover border rounded-md shadow-md z-50 max-h-[300px] overflow-y-auto">
                  {isLoading ? (
                    <div className="px-2 py-1.5 text-sm text-muted-foreground">
                      Searching...
                    </div>
                  ) : places.length > 0 ? (
                    places.map((suggestion, index) => {
                      const prediction = suggestion.placePrediction as ExtendedPlacePrediction | null
                      if (!prediction) return null

                      return (
                        <div key={prediction.placeId}>
                          <button
                            className="w-full flex items-start gap-2 px-2 py-2 text-sm hover:bg-accent hover:text-accent-foreground cursor-pointer text-left"
                            onClick={() => {
                              setSearchQuery(prediction.text?.text || "")
                              setIsOpen(false)
                            }}
                          >
                            <MapPinIcon className="h-4 w-4 mt-0.5 shrink-0" />
                            <div className="flex flex-col">
                              <span className="">{prediction.structuredFormat?.mainText?.text || prediction.text?.text || ""}</span>
                              <span className="text-xs text-muted-foreground">
                                {prediction.structuredFormat?.secondaryText?.text || ""}
                              </span>
                            </div>
                          </button>
                          {index < places.length - 1 && (
                            <div className="border-b" />
                          )}
                        </div>
                      )
                    })
                  ) : null}
                </div>
              )}
            </div>
          </div>
          <div className="flex flex-1 items-center justify-end gap-2">
            <Button asChild variant="ghost" size="sm" className="text-sm">
              <a href="/auth/signin">Login</a>
            </Button>
            <Button asChild size="sm" className="text-sm">
              <a href="/auth/signup">Get Started</a>
            </Button>
          </div>
        </div>
      </header>
    </>
  )
}
