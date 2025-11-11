import ImagesSection from "@/components/landing/images-section";
import NavBar from "@/components/nav-bar";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Hexagon from "@/components/ui/hexagon";
import "./page.css";
import { cn } from "@/lib/utils";

export default function HomePage() {
  return (
    <>
      <main>
        <section className="min-h-screen max-w-screen flex flex-col">
          <NavBar />
          <div className={cn(
            "w-full flex-1 flex flex-col items-center justify-between gap-8 px-4 pt-20",
            "md:mx-auto md:px-20 md:pb-10 md:pt-0 md:flex-row"
          )}>
            <div className="w-full sm:w-[unset] flex-1 flex flex-col items-start">
              <div className="font-light text-4xl sm:text-3xl md:text-4xl lg:text-5xl leading-tight mb-6">
                <h1>Your circle.</h1>
                <h1>Your city.</h1>
                <h1>Your friends.</h1>
              </div>
              <Button className="rounded-full px-6 py-6 text-base">Begin your hive</Button>
              <div className="flex flex-row items-center gap-2 lg:gap-1 mt-6">
                <div className="flex -space-x-[0.6rem] pointer-events-none select-none">
                  <Image
                    className="rounded-full size-8 md:size-6 lg:size-6 ring-2 ring-background"
                    src="/avatars/avatar-1.jpg"
                    width={32}
                    height={32}
                    alt="Community Member Avatar"
                  />
                  <Image
                    className="rounded-full size-8 md:size-6 lg:size-6 ring-2 ring-background"
                    src="/avatars/avatar-2.jpg"
                    width={32}
                    height={32}
                    alt="Community Member Avatar"
                  />
                  <Image
                    className="rounded-full size-8 md:size-6 lg:size-6 ring-2 ring-background"
                    src="/avatars/avatar-4.jpg"
                    width={32}
                    height={32}
                    alt="Community Member Avatar"
                  />
                </div>
                <p className="text-sm text-muted-foreground">Sarah and 100 others discovering hidden gems</p>
              </div>
            </div>

            <div className="flex-1 flex justify-center items-center">
              <div
                className="grid hex-grid"
                style={{
                  gridTemplateColumns: 'repeat(4, var(--hex-size))',
                  gridAutoRows: 'var(--hex-row)',
                  columnGap: 'var(--hex-gap)',
                  rowGap: '0',
                }}
              >
                <div style={{ gridColumn: '2', gridRow: '1 / 3' }}>
                  <Hexagon color="bg-[#F59E0B]" />
                </div>
                <div style={{ gridColumn: '3', gridRow: '1 / 3' }}>
                  <Hexagon color="bg-amber-300" />
                </div>

                <div
                  className="hex-offset-row"
                  style={{
                    gridColumn: '1',
                    gridRow: '3 / 5',
                    marginLeft: 'var(--hex-offset)'
                  }}
                >
                  <Hexagon color="bg-amber-300" />
                </div>
                <div
                  className="hex-offset-row"
                  style={{
                    gridColumn: '2',
                    gridRow: '3 / 5',
                    marginLeft: 'var(--hex-offset)'
                  }}
                >
                  <Hexagon color="bg-white" hasVideo videoUrl="/videos/park_skating.mp4" />
                </div>
                <div
                  className="hex-offset-row"
                  style={{
                    gridColumn: '3',
                    gridRow: '3 / 5',
                    marginLeft: 'var(--hex-offset)'
                  }}
                >
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
        <ImagesSection />
      </main>
    </>
  );
}
