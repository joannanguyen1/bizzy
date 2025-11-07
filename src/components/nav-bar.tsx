import { useId } from "react"
import { MicIcon, SearchIcon } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import BizzyLogo from "./logo"

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

  return (
    <header className="border-b px-4 md:px-6">
      <div className="flex h-16 items-center justify-between gap-4">
        <div className="flex-1 flex flex-row items-center gap-4">
          <a href="#" className="text-primary hover:text-primary/90">
            <BizzyLogo />
          </a>
		  {links.map((link) => (
			<Link key={link.href} href={link.href}>
				{link.label}
			</Link>
		  ))}
        </div>
        <div className="grow max-sm:hidden">
          <div className="relative mx-auto w-full max-w-xs">
            <Input
              id={id}
              className="peer h-8 px-8"
              placeholder="Search places in Philadelphia..."
              type="search"
            />
            <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-2 text-muted-foreground/80 peer-disabled:opacity-50">
              <SearchIcon size={16} />
            </div>
            <button
              className="absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center rounded-e-md text-muted-foreground/80 transition-[color,box-shadow] outline-none hover:text-foreground focus:z-10 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="Press to speak"
              type="submit"
            >
              <MicIcon size={16} aria-hidden="true" />
            </button>
          </div>
        </div>
        {/* Right side */}
        <div className="flex flex-1 items-center justify-end gap-2">
          <Button asChild variant="ghost" size="sm" className="text-sm">
            <a href="#">Community</a>
          </Button>
          <Button asChild size="sm" className="text-sm">
            <a href="#">Get Started</a>
          </Button>
        </div>
      </div>
    </header>
  )
}
