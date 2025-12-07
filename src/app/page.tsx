import ImagesSection from "@/components/landing/images-section";
import NavBar from "@/components/nav-bar";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Hexagon from "@/components/ui/hexagon";
import "./page.css";
import { cn } from "@/lib/utils";
import { auth } from "@/lib/auth";
import { Footer } from "@/components/landing/footer";
import BizzyLogo from "@/components/logo";
import { GithubIcon, TwitterIcon } from "lucide-react";
import { LoggedInLayout } from "@/components/logged-in-layout";
import { headers } from "next/headers";
import Link from "next/link";

export default async function HomePage() {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  console.log({ session });

  if (session) {
    return <LoggedInLayout session={session} />;
  }

  return (
    <>
      <main>
        <section className="min-h-screen max-w-screen flex flex-col mb-10">
          <NavBar />
          <div className={cn(
            "w-full flex flex-col items-center justify-between gap-8 pb-16 px-4 pt-20 overflow-hidden",
            "md:flex-1 md:mx-auto md:px-4 lg:px-18 xl:px-28 2xl:px-60 md:pb-10 md:pt-0 md:flex-row"
          )}>
            <div className="w-full flex-1 flex flex-col items-start mb-10 md:mb-0">
              <div className="font-light text-5xl md:text-4xl lg:text-4xl xl:text-5xl 2xl:text-6xl leading-tight mb-6">
                <h1>Your circle.</h1>
                <h1>Your city.</h1>
                <h1>Your friends.</h1>
              </div>
              <Link href="/auth/register">
                <Button className="rounded-lg px-6 py-6 text-base">Begin your hive</Button>
              </Link>
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

            <div className={cn(
              "flex-1 flex justify-center items-center",
              "xl:max-w-[unset] lg:max-w-xl md:max-w-sm"
            )}>
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
        <Footer
          logo={<BizzyLogo width={40} height={40} />}
          brandName="bizzy"
          socialLinks={[
            {
              icon: <TwitterIcon className="h-5 w-5" />,
              href: "https://twitter.com",
              label: "Twitter",
            },
            {
              icon: <GithubIcon className="h-5 w-5" />,
              href: "https://github.com",
              label: "GitHub",
            },
          ]}
          mainLinks={[
            { href: "/products", label: "Products" },
            { href: "/about", label: "About" },
            { href: "/blog", label: "Blog" },
            { href: "/contact", label: "Contact" },
          ]}
          legalLinks={[
            { href: "/privacy", label: "Privacy" },
            { href: "/terms", label: "Terms" },
          ]}
          copyright={{
            text: "© 2025 Bizzy",
            license: "All rights reserved",
          }}
        />
      </main>
    </>
  );
}
