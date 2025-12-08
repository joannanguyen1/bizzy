"use client";
import { useId } from "react";
import { useSafari } from "@/hooks/use-safari";

export default function Hexagon({
	color,
	hasImage = false,
	imageUrl,
	hasVideo = false,
	videoUrl
}: {
	color: string;
	hasImage?: boolean;
	imageUrl?: string;
	hasVideo?: boolean;
	videoUrl?: string;
}) {
	const gradientId = useId()
	const clipId = useId()
	const isSafari = useSafari()

	const colorConfig = {
		'bg-[#F59E0B]': { base: '#F59E0B', light: '#FCD34D', stroke: '#C87E00' },
		'bg-amber-400': { base: '#FBBF24', light: '#FDE68A', stroke: '#D97706' },
		'bg-amber-300': { base: '#FCD34D', light: '#FEF3C7', stroke: '#F59E0B' },
		default: { base: '#FFFFFF', light: '#F9FAFB', stroke: '#E5E7EB' }
	};
	const { base: baseColor, light: lightColor } = colorConfig[color as keyof typeof colorConfig] || colorConfig.default;
	const fillColor = hasImage && imageUrl
		? "url(#hexImage)"
		: `url(#${gradientId})`;

	if (hasVideo && videoUrl) {
		const hexPath = "M76.7605 3.57703C82.6664 0.141539 89.9621 0.141455 95.8679 3.57703L162.181 42.1532C168.03 45.5552 171.628 51.8104 171.628 58.576V135.991C171.628 142.757 168.03 149.013 162.181 152.415L95.8679 190.991C89.9621 194.427 82.6663 194.426 76.7605 190.991L10.446 152.415C4.59777 149.013 0.999756 142.757 0.999756 135.991V58.576C0.999892 51.8104 4.59797 45.5552 10.446 42.1532L76.7605 3.57703Z";

		//? Safari-friendly implementation with CSS clip-path
		if (isSafari) {
			//? Approximate hexagon polygon for CSS clip-path (more Safari-friendly)
			//? Top point, top-right, bottom-right, bottom point, bottom-left, top-left
			const cssHexPolygon = "polygon(50% 1.8%, 93.7% 21.6%, 93.7% 78.2%, 50% 98.2%, 6.3% 78.2%, 6.3% 21.6%)";

			return (
				<div
					className="relative hex-grid"
					style={{
						width: 'var(--hex-size)',
						height: 'var(--hex-height)',
						transform: 'translate3d(0, 0, 0)', //* Force Safari to create new stacking context
					}}
				>
					{/*! Container with CSS clip-path - Safari handles this better */}
					<div
						style={{
							width: '100%',
							height: '100%',
							position: 'relative',
							clipPath: cssHexPolygon,
							WebkitClipPath: cssHexPolygon, //* Safari prefix
							overflow: 'hidden',
							transform: 'translate3d(0, 0, 0)', //* Force Safari rendering
							willChange: 'transform', //* Optimize for Safari
						}}
					>
						<video
							autoPlay
							loop
							muted
							playsInline
							style={{
								width: '100%',
								height: '100%',
								objectFit: 'cover',
								display: 'block',
								position: 'relative',
								transform: 'translate3d(0, 0, 0)', //* Force hardware acceleration
							}}
							aria-label="Video of a park skating"
						>
							<source src={videoUrl} type="video/mp4" />
						</video>
					</div>
				</div>
			);
		}

		//? Original implementation for Chrome and other browsers (with rounded corners)
		return (
			<div
				className="relative hex-grid"
				style={{
					width: 'var(--hex-size)',
					height: 'var(--hex-height)',
				}}
			>
				<svg viewBox="0 0 173 195" className="w-full h-full drop-shadow-md">
					<defs>
						<clipPath id={clipId}>
							<path d={hexPath} />
						</clipPath>
					</defs>
					<foreignObject x="0" y="0" width="173" height="195" clipPath={`url(#${clipId})`}>
						<video
							autoPlay
							loop
							muted
							playsInline
							className="w-full h-full object-cover"
							aria-label="Video of a park skating"
						>
							<source src={videoUrl} type="video/mp4" />
						</video>
					</foreignObject>
				</svg>
			</div>
		);
	}

	return (
		<div
			className="relative hex-grid"
			style={{
				width: 'var(--hex-size)',
				height: 'var(--hex-height)',
			}}
		>
			<svg viewBox="0 0 173 195" className="w-full h-full drop-shadow-md">
				<defs>
					<linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
						<stop offset="0%" stopColor={lightColor} />
						<stop offset="100%" stopColor={baseColor} />
					</linearGradient>
					{hasImage && imageUrl && (
						<pattern id="hexImage" x="0" y="0" width="1" height="1">
							<image
								href={imageUrl}
								x="0"
								y="0"
								width="173"
								height="195"
								preserveAspectRatio="xMidYMid slice"
								aria-label="Image of a park skating"
							/>
						</pattern>
					)}
				</defs>
				<path
					d="M76.7605 3.57703C82.6664 0.141539 89.9621 0.141455 95.8679 3.57703L162.181 42.1532C168.03 45.5552 171.628 51.8104 171.628 58.576V135.991C171.628 142.757 168.03 149.013 162.181 152.415L95.8679 190.991C89.9621 194.427 82.6663 194.426 76.7605 190.991L10.446 152.415C4.59777 149.013 0.999756 142.757 0.999756 135.991V58.576C0.999892 51.8104 4.59797 45.5552 10.446 42.1532L76.7605 3.57703Z"
					fill={fillColor}
				/>
			</svg>
		</div>
	);
}
