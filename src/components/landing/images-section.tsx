"use client";
import { useEffect } from "react"
import Lenis from 'lenis';
import { ZoomParallax } from "@/components/ui/zoom-parallax";
import Image from "next/image";
import { BookmarkIcon, SparklesIcon, StarIcon, XIcon } from "lucide-react";
import { Button } from "../ui/button";

export default function ImagesSection() {
	useEffect(() => {
		const lenis = new Lenis()

		function raf(time: number) {
			lenis.raf(time)
			requestAnimationFrame(raf)
		}

		requestAnimationFrame(raf)
	}, []);

	const images = [
		{
			src: '/assets/landing1.png',
			alt: 'Women holding shopping bags',
		},
		{
			src: '/assets/landing2.png',
			alt: 'Rowing',
		},
		{
			src: '/assets/landing3.png',
			alt: 'Friends on top of building',
		},
		{
			src: '/assets/landing4.png',
			alt: 'Selfie at a mall',
		},
		{
			src: '/assets/landing5.png',
			alt: 'Museum',
		},
		{
			src: '/assets/landing6.png',
			alt: 'Ice Skating',
		},
		{
			src: '/assets/landing7.png',
			alt: 'Philadelphia Trail Club',
		},
	];

	return (
		<section className="min-h-screen max-w-screen flex flex-col">
			<h2 className="text-4xl text-center font-light px-4 py-20">Find the new, <span className="text-primary">forget the past.</span></h2>
			<ZoomParallax images={images} />
			<div className="h-auto min-h-[50vh] flex flex-col items-center justify-center py-20 px-8">
				<h2 className="text-4xl text-center font-light py-20">Bizzy is more than just a platform, <span className="text-primary">it&apos;s a community.</span></h2>
				<div className="grid grid-cols-1 grid-rows-1 lg:grid-cols-2 lg:grid-rows-2 gap-8 w-full max-w-7xl justify-items-center">
					<div className="rounded-md h-[400px] w-[80vw] max-w-[600px] snap-start lg:h-auto lg:w-full lg:max-w-none lg:pl-0 ">
						<div
							style={{
								background: 'radial-gradient(167.08% 140.48% at 79.5% 0%, rgba(255, 255, 255, 0.06) 0%, rgba(255, 255, 255, 0.00) 100%), radial-gradient(120.74% 124.92% at 7.26% 100%, #F59E0B 0%, #FEE685 100%)',
								backgroundBlendMode: 'overlay, normal',
								boxShadow: 'inset 0 1px 2px #ffffff30, 0 1px 2px #00000030, 0 2px 4px #00000015'
							}}
							className="relative flex h-full w-full flex-col justify-end rounded-4xl text-white lg:h-[500px] lg:w-auto">
							<Image
								src="/assets/landing8-masked.png"
								alt="Discover hidden places"
								width={1340}
								height={880}
								className="pointer-events-none absolute top-0 right-0 rounded-3xl"
								style={{ color: 'transparent' }} />
							<div className="relative flex flex-col gap-3 px-8 pb-8">
								<h3 className="text-2xl leading-[28.5px] font-medium tracking-[-0.4px]">See authentic reviews</h3>
								<p className="text-lg leading-[24.75px]">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
							</div>
							<div
								className="z-10 max-w-60 md:max-w-sm absolute top-10 md:top-20 lg:top-40 left-10 bg-neutral-500/75 backdrop-blur-sm border-t border-neutral-300/80 rounded-lg py-2 px-3 shadow-[inset_0_1px_2px_#ffffff30,0_1px_2px_#00000030,0_2px_4px_#00000015]"
								style={{ isolation: 'isolate' }}
							>
								<div className="flex flex-row items-center gap-2 mb-2">
									<Image
										src="/avatars/avatar-5.jpg"
										alt="Community Member Avatar"
										width={32}
										height={32}
										className="rounded-full"
									/>
									<p className="text-lg leading-[24.75px] font-medium">Jane</p>
								</div>
								<p className="text-sm">Absolutely loved this place! The food was amazing and the service was excellent. I will definitely be back.</p>
								<span
									className="mt-4 inline-flex items-center text-amber-300"
									aria-hidden="true"
								>
									<StarIcon fill="currentColor" size={16} />
									<StarIcon fill="currentColor" size={16} />
									<StarIcon fill="currentColor" size={16} />
									<StarIcon fill="currentColor" size={16} />
									<StarIcon fill="currentColor" size={16} />
								</span>
							</div>

						</div>
					</div>
					<div className="h-[400px] w-[80vw] max-w-[600px] snap-start lg:h-[500px] lg:w-full lg:max-w-none lg:pl-0">
						<div style={{
							background: "radial-gradient(92.09% 124.47% at 50% 99.24%, rgba(221, 226, 238, 0.40) 58.91%, rgba(187, 197, 221, 0.40) 100%)"
						}}
							className="relative flex h-full w-full flex-col gap-10 overflow-hidden rounded-4xl border border-[#36393F]/5 pt-12">
							<div className="pointer-events-none absolute inset-0 rounded-[inherit] mix-blend-plus-lighter" style={{ boxShadow: '1.899px 1.77px 8.174px 0 rgba(255, 255, 255, 0.13) inset, 1.007px 0.939px 4.087px 0 rgba(255, 255, 255, 0.13) inset' }}></div>
							<div className="flex flex-col gap-3 px-8">
								<h3 className="text-3xl leading-[38.5px] font-medium tracking-[-0.7px] text-[#263043]">Build your own space</h3>
								<p className="leading-[24.75px] text-[#8C929D]">Send perfectly drafted follow-up emails within seconds after every call.</p>
							</div>
							<div className="bg-neutral-200/50 p-2 translate-x-20 mr-12w-fit rounded-xl lg:mr-0 relative drop-shadow-md">
								<div className="bg-white p-2 rounded-lg">
									<div className="flex flex-row items-center gap-2 bg-neutral-50 w-fit border rounded-lg p-1 pointer-events-none select-none">
										<Button className="bg-linear-to-r from-amber-300 to-primary text-white border-primary border drop-shadow-md">
											<SparklesIcon size={16} />
											Want to Go
										</Button>
										<Button variant="ghost">
											Been
										</Button>
										<Button variant="ghost">
											Recs
										</Button>
									</div>
									<div className="flex flex-col items-start gap-2 mt-4 ml-4">
										<div className="flex flex-row items-center gap-2">
											<Image
												src="/assets/please-touch-museum.png"
												alt="Please Touch Museum"
												width={1009}
												height={733}
												className="w-40 object-cover rounded-lg"
											/>
											<div>
												<p className="text-sm font-medium">Please Touch Museum</p>
												<p className="text-xs text-neutral-500">Philadelphia, PA</p>
												<div className="flex flex-row items-center gap-1">
													<BookmarkIcon className="size-6 text-neutral-400 fill-current stroke-1" />
													<XIcon className="size-4 text-neutral-300 stroke-1" />
												</div>
											</div>
										</div>
										<div className="h-px w-full bg-neutral-200/50 my-2" />
										<div className="flex flex-row items-center gap-2">
											<Image
												src="/assets/museum-of-art.png"
												alt="Museum of Art"
												width={1009}
												height={733}
												className="w-40 object-cover rounded-lg"
											/>
											<div>
												<p className="text-sm font-medium">Museum of Art</p>
												<p className="text-xs text-neutral-500">Philadelphia, PA</p>
												<div className="flex flex-row items-center gap-1">
													<BookmarkIcon className="size-6 text-neutral-400 fill-current stroke-1" />
													<XIcon className="size-4 text-neutral-300 stroke-1" />
												</div>
											</div>
										</div>
									</div>
								</div>
							</div>
						</div></div>
				</div>
			</div>
		</section>

	)
}
