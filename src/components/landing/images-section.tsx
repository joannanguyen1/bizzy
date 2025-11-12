"use client";
import { useEffect } from "react"
import { cn } from '@/lib/utils';
import Lenis from 'lenis';
import { ZoomParallax } from "@/components/ui/zoom-parallax";

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
			alt: 'Modern architecture building',
		},
		{
			src: '/assets/landing2.png',
			alt: 'Urban cityscape at sunset',
		},
		{
			src: '/assets/landing3.png',
			alt: 'Abstract geometric pattern',
		},
		{
			src: '/assets/landing4.png',
			alt: 'Mountain landscape',
		},
		{
			src: '/assets/landing5.png',
			alt: 'Minimalist design elements',
		},
		{
			src: '/assets/landing6.png',
			alt: 'Ocean waves and beach',
		},
		{
			src: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1280&h=720&fit=crop&crop=entropy&auto=format&q=80',
			alt: 'Forest trees and sunlight',
		},
	];

	return (
		<section className="min-h-screen max-w-screen flex flex-col">
			<h2 className="text-4xl text-center font-light px-4 py-20">Find the new, <span className="text-primary">forget the past.</span></h2>
			<ZoomParallax images={images} />
			<div className="h-[50vh]" />
		</section>

	)
}
