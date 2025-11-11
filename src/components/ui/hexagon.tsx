"use client";
import { useId } from "react";

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
	const clipId = useId()

	const fillColor = hasImage && imageUrl
	  ? "url(#hexImage)"
	  : color === "bg-[#F59E0B]"
		? "#F59E0B"
		: color === "bg-amber-400"
		  ? "#FBBF24"
		  : color === "bg-amber-300"
			? "#FCD34D"
			: "#FFFFFF";

	const strokeColor = color === "bg-[#F59E0B]"
	  ? "#C87E00"
	  : color === "bg-amber-400"
		? "#D97706"
		: color === "bg-amber-300"
		  ? "#F59E0B"
		  : "#E5E7EB";

	if (hasVideo && videoUrl) {
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
				<path d="M76.7605 3.57703C82.6664 0.141539 89.9621 0.141455 95.8679 3.57703L162.181 42.1532C168.03 45.5552 171.628 51.8104 171.628 58.576V135.991C171.628 142.757 168.03 149.013 162.181 152.415L95.8679 190.991C89.9621 194.427 82.6663 194.426 76.7605 190.991L10.446 152.415C4.59777 149.013 0.999756 142.757 0.999756 135.991V58.576C0.999892 51.8104 4.59797 45.5552 10.446 42.1532L76.7605 3.57703Z" />
			  </clipPath>
			</defs>
			<foreignObject x="0" y="0" width="173" height="195" clipPath={`url(#${clipId})`}>
			  <video
				autoPlay
				loop
				muted
				playsInline
				className="w-full h-full object-cover"
			  >
				<source src={videoUrl} type="video/mp4" />
			  </video>
			</foreignObject>
			<path
			  d="M76.7605 3.57703C82.6664 0.141539 89.9621 0.141455 95.8679 3.57703L162.181 42.1532C168.03 45.5552 171.628 51.8104 171.628 58.576V135.991C171.628 142.757 168.03 149.013 162.181 152.415L95.8679 190.991C89.9621 194.427 82.6663 194.426 76.7605 190.991L10.446 152.415C4.59777 149.013 0.999756 142.757 0.999756 135.991V58.576C0.999892 51.8104 4.59797 45.5552 10.446 42.1532L76.7605 3.57703Z"
			  fill="none"
			  stroke="#E5E7EB"
			  strokeWidth="1"
			/>
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
			{hasImage && imageUrl && (
			  <pattern id="hexImage" x="0" y="0" width="1" height="1">
				<image
				  href={imageUrl}
				  x="0"
				  y="0"
				  width="173"
				  height="195"
				  preserveAspectRatio="xMidYMid slice"
				/>
			  </pattern>
			)}
		  </defs>
		  <path
			d="M76.7605 3.57703C82.6664 0.141539 89.9621 0.141455 95.8679 3.57703L162.181 42.1532C168.03 45.5552 171.628 51.8104 171.628 58.576V135.991C171.628 142.757 168.03 149.013 162.181 152.415L95.8679 190.991C89.9621 194.427 82.6663 194.426 76.7605 190.991L10.446 152.415C4.59777 149.013 0.999756 142.757 0.999756 135.991V58.576C0.999892 51.8104 4.59797 45.5552 10.446 42.1532L76.7605 3.57703Z"
			fill={fillColor}
			stroke={hasImage ? "none" : strokeColor}
			strokeWidth="1"
		  />
		</svg>
	  </div>
	);
  }
