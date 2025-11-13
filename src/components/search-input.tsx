import { cn } from "@/lib/utils";
import { Input } from "./ui/input";
import { useRouter } from "next/navigation";
import { SearchIcon, MapPinIcon } from "lucide-react";

const DROPDOWN_CLOSE_DELAY = 200;

export type PlaceSuggestion = google.maps.places.AutocompleteSuggestion

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

interface SearchInputProps {
	className?: string;
	id: string;
	searchQuery: string;
	setSearchQuery: (value: string) => void;
	places: PlaceSuggestion[];
	isOpen: boolean;
	setIsOpen: (value: boolean) => void;
	isLoading: boolean;
	router: ReturnType<typeof useRouter>;
	setIsMobileMenuOpen?: (value: boolean) => void;
}

const SearchInput = ({
	className,
	id,
	searchQuery,
	setSearchQuery,
	places,
	isOpen,
	setIsOpen,
	isLoading,
	router,
	setIsMobileMenuOpen
}: SearchInputProps) => (
	<div className={cn("relative w-full", className)}>
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
										if (prediction.placeId) {
											router.push(`/map/places/${encodeURIComponent(prediction.placeId)}`)
											setIsOpen(false)
											setSearchQuery("")
											setIsMobileMenuOpen?.(false)
										} else {
											setSearchQuery(prediction.text?.text || "")
											setIsOpen(false)
										}
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
);

SearchInput.displayName = "SearchInput";
export default SearchInput;
