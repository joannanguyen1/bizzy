"use client";
import { useId, useState, useEffect, useRef } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import Script from "next/script"
import BizzyLogo from "./logo"
import {
  Navbar,
  NavBody,
  NavItems,
  MobileNav,
  NavbarLogo,
  NavbarButton,
  MobileNavHeader,
  MobileNavToggle,
  MobileNavMenu,
} from "@/components/ui/resizable-navbar"
import SearchInput, { PlaceSuggestion } from "./search-input";


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


export default function NavBar() {
  const id = useId()
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [places, setPlaces] = useState<PlaceSuggestion[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
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

  const navItems = links.map(link => ({
    name: link.label,
    link: link.href,
  }));

  return (
    <>
      <Script
        id="google-maps-script"
        src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`}
        strategy="afterInteractive"
      />
      <Navbar>
        <NavBody>
          <div className="flex flex-row items-center gap-2">
          <NavbarLogo>
            <Link href="/" className="text-primary hover:text-primary/90 mr-2" aria-label="Home">
              <BizzyLogo width={40} height={40} />
            </Link>
          </NavbarLogo>
          <NavItems items={navItems} />

          </div>
          <div className="flex-1 flex items-center justify-center max-w-md mx-4">
            <SearchInput
              id={id}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              places={places}
              isOpen={isOpen}
              setIsOpen={setIsOpen}
              isLoading={isLoading}
              router={router}
            />
          </div>
          <div className="flex items-center gap-2">
            <NavbarButton variant="secondary" asChild>
              <a href="/auth/signin">Login</a>
            </NavbarButton>
            <NavbarButton variant="primary" asChild>
              <a href="/auth/register">Get Started</a>
            </NavbarButton>
          </div>
        </NavBody>

        <MobileNav>
          <MobileNavHeader>
            <NavbarLogo>
              <Link href="/" className="text-primary hover:text-primary/90" aria-label="Home">
                <BizzyLogo width={40} height={40} />
              </Link>
            </NavbarLogo>
            <MobileNavToggle
              isOpen={isMobileMenuOpen}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            />
          </MobileNavHeader>

          <MobileNavMenu
            isOpen={isMobileMenuOpen}
            onClose={() => setIsMobileMenuOpen(false)}
          >
            <SearchInput
              className="mb-4"
              id={id}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              places={places}
              isOpen={isOpen}
              setIsOpen={setIsOpen}
              isLoading={isLoading}
              router={router}
              setIsMobileMenuOpen={setIsMobileMenuOpen}
            />
            {navItems.map((item, idx) => (
              <Link
                key={`mobile-link-${idx}`}
                href={item.link}
                onClick={() => setIsMobileMenuOpen(false)}
                className="block text-sm font-medium text-foreground hover:text-primary transition-colors py-2"
              >
                {item.name}
              </Link>
            ))}
            <div className="flex w-full flex-col gap-4 pt-4">
              <NavbarButton
                onClick={() => setIsMobileMenuOpen(false)}
                variant="secondary"
                className="w-full"
                asChild
              >
                <a href="/auth/signin">Login</a>
              </NavbarButton>
              <NavbarButton
                onClick={() => setIsMobileMenuOpen(false)}
                variant="primary"
                className="w-full"
                asChild
              >
                <a href="/auth/register">Get Started</a>
              </NavbarButton>
            </div>
          </MobileNavMenu>
        </MobileNav>
      </Navbar>
    </>
  )
}
