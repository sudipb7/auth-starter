import Link from "next/link";
import { ArrowRight, Github } from "lucide-react";

import { cn } from "@/lib/utils";
import { DotPattern } from "@/components/magicui/dot-pattern";

export default function Home() {
  return (
    <div className="min-h-full flex flex-col items-center justify-center relative overflow-hidden bg-background-secondary">
      <DotPattern
        className={cn(
          "max-md:[mask-image:radial-gradient(320px_circle_at_center,white,transparent)] md:[mask-image:radial-gradient(460px_circle_at_center,white,transparent)]"
        )}
      />
      <main className="container mx-auto px-4 py-16 sm:px-6 sm:py-24 lg:px-8 lg:py-32 sm:text-center relative z-10">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="space-y-4">
            <h2 className="text-sm font-mono font-medium tracking-tight leading-none uppercase text-gray-600">
              Next.js + Express.js
            </h2>
            <h1 className="text-4xl font-bold tracking-tight md:text-5xl">Auth Starter Template</h1>
            <p className="font-mono max-sm:text-sm tracking-tight text-gray-900 font-medium">
              Kickstart your project with a secure and scalable authentication solution built with
              Next.js and Express.js.
            </p>
          </div>
          <div className="flex max-sm:flex-col items-center sm:justify-center gap-4">
            <Link
              href="/sign-in"
              className="max-sm:w-full inline-flex items-center px-6 sm:px-8 py-3 max-sm:text-sm font-medium rounded-full text-background bg-gray-950 outline-none transition-all duration-200 ease-in-out justify-center shadow-sm hover:opacity-85"
            >
              Get Started
              <ArrowRight className="ml-2 -mr-1 h-5 w-5" />
            </Link>
            <Link
              href="https://github.com/sudipb7/auth-starter"
              target="_blank"
              rel="noopener noreferrer"
              className="max-sm:w-full inline-flex items-center px-6 sm:px-8 py-3 max-sm:text-sm font-medium rounded-full outline-none bg-background border text-gray-900 hover:bg-background-secondary hover:border-gray-400 transition-all duration-200 ease-in-out justify-center shadow-sm"
            >
              <Github className="mr-2 -ml-1 h-5 w-5" />
              View GitHub
            </Link>
          </div>
        </div>
      </main>
      <footer>
        <p className="text-center text-sm text-gray-700 font-medium">
          Made by{" "}
          <Link
            href="https://x.com/sudipbiswas_7"
            target="_blank"
            className="text-gray-900 underline underline-offset-2"
          >
            Sudip Biswas
          </Link>
        </p>
      </footer>
    </div>
  );
}
