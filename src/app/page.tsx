"use client";
import NavBar from "@/components/nav-bar";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export default function HomePage() {
  return (
    <>
      <main>
        <section className="min-h-screen max-w-screen flex flex-col">
          <NavBar />
          <div className="container flex-1 mx-auto px-20 pb-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex-1 flex flex-col items-start">
              <div className="font-light text-5xl leading-tight mb-6">
                <h1>Your circle.</h1>
                <h1>Your city.</h1>
                <h1>Your friends.</h1>
              </div>
              <Button className="rounded-full px-6 py-6 text-base">Begin your hive</Button>
              <div className="flex flex-row items-center gap-2 mt-6">
                <div className="flex -space-x-[0.6rem] pointer-events-none select-none">
                  <Image
                    className="rounded-full ring-2 ring-background"
                    src="/avatars/avatar-1.jpg"
                    width={32}
                    height={32}
                    alt="Community Member Avatar"
                  />
                  <Image
                    className="rounded-full ring-2 ring-background"
                    src="/avatars/avatar-2.jpg"
                    width={32}
                    height={32}
                    alt="Community Member Avatar"
                  />
                  <Image
                    className="rounded-full ring-2 ring-background"
                    src="/avatars/avatar-4.jpg"
                    width={32}
                    height={32}
                    alt="Community Member Avatar"
                  />
                </div>
                <p className="text-sm text-muted-foreground">Join Sarah and 100 others discovering hidden gems</p>
              </div>
            </div>

            <div className="flex-1 flex justify-center items-center">
              <div className="grid" style={{
                gridTemplateColumns: 'repeat(4, 180px)',
                gridAutoRows: '90px',
                columnGap: '1rem',
                rowGap: '0',
              }}>
                <div style={{ gridColumn: '2', gridRow: '1 / 3' }}>
                  <Hexagon color="bg-[#F59E0B]" />
                </div>
                <div style={{ gridColumn: '3', gridRow: '1 / 3' }}>
                  <Hexagon color="bg-amber-300" />
                </div>

                <div style={{ gridColumn: '1', gridRow: '3 / 5', marginLeft: '90px' }}>
                  <Hexagon color="bg-amber-300" />
                </div>
                <div style={{ gridColumn: '2', gridRow: '3 / 5', marginLeft: '90px' }}>
                  <Hexagon color="bg-white" hasVideo videoUrl="/videos/park_skating.mp4" />
                </div>
                <div style={{ gridColumn: '3', gridRow: '3 / 5', marginLeft: '90px' }}>
                  <Hexagon color="bg-amber-300" />
                </div>

                <div style={{ gridColumn: '2', gridRow: '5 / 7' }}>
                  <Hexagon color="bg-amber-400" />
                </div>
                <div style={{ gridColumn: '3', gridRow: '5 / 7' }}>
                  <Hexagon color="bg-[#F59E0B]" />
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}

function Hexagon({
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
      <div className="relative w-[180px] h-[210px]">
        <svg viewBox="0 0 173 195" className="w-full h-full drop-shadow-md">
          <defs>
            <clipPath id="hexClip">
              <path d="M76.7605 3.57703C82.6664 0.141539 89.9621 0.141455 95.8679 3.57703L162.181 42.1532C168.03 45.5552 171.628 51.8104 171.628 58.576V135.991C171.628 142.757 168.03 149.013 162.181 152.415L95.8679 190.991C89.9621 194.427 82.6663 194.426 76.7605 190.991L10.446 152.415C4.59777 149.013 0.999756 142.757 0.999756 135.991V58.576C0.999892 51.8104 4.59797 45.5552 10.446 42.1532L76.7605 3.57703Z" />
            </clipPath>
          </defs>
          <foreignObject x="0" y="0" width="173" height="195" clipPath="url(#hexClip)">
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
    <div className="relative w-[180px] h-[210px]">
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
