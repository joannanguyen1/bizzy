"use client";
import { useId, memo, useMemo } from "react";

function BizzyLogoComponent({ width = 54, height = 54 }: { width?: number, height?: number }) {
	const id = useId();
	const ids = useMemo(() => ({
		filter0: `filter0_${id}`,
		filter1: `filter1_${id}`,
		clip0: `clip0_${id}`,
		paint0: `paint0_${id}`,
		paint1: `paint1_${id}`,
		paint2: `paint2_${id}`,
		paint3: `paint3_${id}`,
		paint4: `paint4_${id}`,
		paint5: `paint5_${id}`,
	}), [id]);

	return (
		<svg width={width} height={height} viewBox="0 0 54 54" fill="none" xmlns="http://www.w3.org/2000/svg">
			<g filter={`url(#${ids.filter0})`}>
				<g clipPath={`url(#${ids.clip0})`}>
					<rect x="3" width="48" height="48" rx="12" fill="#F59E0B" />
					<rect width="48" height="48" transform="translate(3)" fill={`url(#${ids.paint0})`} />
					<g filter={`url(#${ids.filter1})`}>
						<path d="M28.6341 33.673C43.2016 40.1838 35.2016 39.1838 36.3191 28.0105C36.8777 24.3246 34.3425 20.8839 30.6566 20.3254C30.6566 20.3254 27.1483 20.2555 25.4999 21.5C23.8945 22.7121 22.9715 25.9879 22.9715 25.9879C22.413 29.6737 24.9482 33.1145 28.6341 33.673Z" fill={`url(#${ids.paint1})`} />
						<path d="M37.348 9.70061C41.0338 10.2591 43.5691 13.6999 43.0105 17.3857C42.452 21.0716 38.7518 20.0062 35.2064 21.0175C35.2064 21.0175 34.2064 20.0175 33.2064 19.5175C32.3114 19.07 31.2064 19.0175 31.2064 19.0175L31.7064 16.5175C32.7064 14.0175 33.6622 9.1421 37.348 9.70061Z" fill={`url(#${ids.paint2})`} />
						<path d="M10.6547 26.2996C9.18852 29.7271 10.7785 33.6942 14.206 35.1603C17.6335 36.6265 18.6764 32.9198 21.403 30.4384C21.403 30.4384 21.0795 29.0617 21.1811 27.9483C21.272 26.9518 21.8092 25.9848 21.8092 25.9848L19.4206 25.0933C16.7688 24.6269 12.1209 22.8721 10.6547 26.2996Z" fill={`url(#${ids.paint3})`} />
						<path d="M37 33.5C37 33.5 34.3913 33.9328 33.5 36" stroke="#F59E0B" strokeWidth="2" />
						<path d="M36.7626 29.5829C36.7626 29.5829 31.701 30.1284 29.2373 34.4172" stroke="#F59E0B" strokeWidth="2" />
						<path d="M36.7529 24.3863C36.7529 24.3863 28.3202 27.0785 24.718 32.4273" stroke="#F59E0B" strokeWidth="2" />
						<path d="M15.0204 15.6738C15.5789 11.988 19.0197 9.45276 22.7055 10.0113C26.3913 10.5698 29.2024 14.9772 28.6439 18.6631C28.6439 18.6631 25.2055 19.0113 24.2055 20.0113C22.7478 21.469 22.2227 23.6542 22.2227 23.6542C18.5368 23.0957 14.4619 19.3597 15.0204 15.6738Z" fill={`url(#${ids.paint4})`} />
					</g>
				</g>
				<rect x="4" y="1" width="46" height="46" rx="11" stroke={`url(#${ids.paint5})`} strokeWidth="2" />
			</g>
			<defs>
				<filter id={ids.filter0} x="0" y="-3" width="54" height="57" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
					<feFlood floodOpacity="0" result="BackgroundImageFix" />
					<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
					<feOffset dy="1" />
					<feGaussianBlur stdDeviation="0.5" />
					<feComposite in2="hardAlpha" operator="out" />
					<feColorMatrix type="matrix" values="0 0 0 0 0.162923 0 0 0 0 0.162923 0 0 0 0 0.162923 0 0 0 0.08 0" />
					<feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_43_255" />
					<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
					<feMorphology radius="1" operator="erode" in="SourceAlpha" result="effect2_dropShadow_43_255" />
					<feOffset dy="3" />
					<feGaussianBlur stdDeviation="2" />
					<feComposite in2="hardAlpha" operator="out" />
					<feColorMatrix type="matrix" values="0 0 0 0 0.164706 0 0 0 0 0.164706 0 0 0 0 0.164706 0 0 0 0.14 0" />
					<feBlend mode="normal" in2="effect1_dropShadow_43_255" result="effect2_dropShadow_43_255" />
					<feBlend mode="normal" in="SourceGraphic" in2="effect2_dropShadow_43_255" result="shape" />
					<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
					<feOffset dy="-3" />
					<feGaussianBlur stdDeviation="1.5" />
					<feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
					<feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0" />
					<feBlend mode="normal" in2="shape" result="effect3_innerShadow_43_255" />
					<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
					<feOffset dy="3" />
					<feGaussianBlur stdDeviation="1.5" />
					<feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
					<feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.1 0" />
					<feBlend mode="normal" in2="effect3_innerShadow_43_255" result="effect4_innerShadow_43_255" />
					<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
					<feMorphology radius="1" operator="erode" in="SourceAlpha" result="effect5_innerShadow_43_255" />
					<feOffset />
					<feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
					<feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.2 0" />
					<feBlend mode="normal" in2="effect4_innerShadow_43_255" result="effect5_innerShadow_43_255" />
				</filter>
				<filter id={ids.filter1} x="7" y="3.25" width="40.3133" height="45.9758" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
					<feFlood floodOpacity="0" result="BackgroundImageFix" />
					<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
					<feMorphology radius="1.5" operator="erode" in="SourceAlpha" result="effect1_dropShadow_43_255" />
					<feOffset dy="2.25" />
					<feGaussianBlur stdDeviation="2.25" />
					<feComposite in2="hardAlpha" operator="out" />
					<feColorMatrix type="matrix" values="0 0 0 0 0.141176 0 0 0 0 0.141176 0 0 0 0 0.141176 0 0 0 0.1 0" />
					<feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_43_255" />
					<feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_43_255" result="shape" />
				</filter>
				<linearGradient id={ids.paint0} x1="24" y1="5.96047e-07" x2="26" y2="48" gradientUnits="userSpaceOnUse">
					<stop stopColor="white" stopOpacity="0" />
					<stop offset="1" stopColor="white" stopOpacity="0.12" />
				</linearGradient>
				<linearGradient id={ids.paint1} x1="29.4066" y1="12.4509" x2="25.456" y2="38.5222" gradientUnits="userSpaceOnUse">
					<stop stopColor="white" stopOpacity="0.8" />
					<stop offset="1" stopColor="white" stopOpacity="0.5" />
				</linearGradient>
				<linearGradient id={ids.paint2} x1="36.38" y1="9.42864" x2="34.3575" y2="22.7763" gradientUnits="userSpaceOnUse">
					<stop stopColor="white" stopOpacity="0.8" />
					<stop offset="1" stopColor="white" stopOpacity="0.5" />
				</linearGradient>
				<linearGradient id={ids.paint3} x1="10.9332" y1="25.3334" x2="23.3453" y2="30.6429" gradientUnits="userSpaceOnUse">
					<stop stopColor="white" stopOpacity="0.8" />
					<stop offset="1" stopColor="white" stopOpacity="0.5" />
				</linearGradient>
				<linearGradient id={ids.paint4} x1="23.7662" y1="10.172" x2="21.7345" y2="23.5802" gradientUnits="userSpaceOnUse">
					<stop stopColor="white" stopOpacity="0.8" />
					<stop offset="1" stopColor="white" stopOpacity="0.5" />
				</linearGradient>
				<linearGradient id={ids.paint5} x1="27" y1="0" x2="27" y2="48" gradientUnits="userSpaceOnUse">
					<stop stopColor="white" stopOpacity="0.12" />
					<stop offset="1" stopColor="white" stopOpacity="0" />
				</linearGradient>
				<clipPath id={ids.clip0}>
					<rect x="3" width="48" height="48" rx="12" fill="white" />
				</clipPath>
			</defs>
		</svg>
	)
}

const BizzyLogo = memo(BizzyLogoComponent);
BizzyLogo.displayName = "BizzyLogo";

export default BizzyLogo;
