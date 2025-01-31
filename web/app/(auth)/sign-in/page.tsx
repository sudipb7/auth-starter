"use client";

import { Loader2 } from "lucide-react";
import { useState, useTransition } from "react";

import { Google, GitHub } from "@/components/icons";

export default function SignInPage() {
  const [isPending, startTransition] = useTransition();
  const [loading, setLoading] = useState<"github" | "google" | null>(null);

  async function onSubmit(provider: "github" | "google") {
    try {
      setLoading(provider);
      window.open(`${process.env.NEXT_PUBLIC_API_URL}/auth/sign-in/social/${provider}`);
    } catch (error) {
      console.error(error);
      alert("An error occurred. Please try again.");
    } finally {
      setLoading(null);
    }
  }

  return (
    <main className="bg-background-secondary min-h-full grid place-items-center">
      <div className="p-4 sm:p-6 md:p-8 space-y-4 sm:bg-background rounded-lg shadow-sm border flex flex-col max-w-sm w-full">
        <h1 className="text-2xl font-bold text-gray-950">Sign In</h1>
        <div className="space-y-2">
          <button
            onClick={() => {
              startTransition(async () => {
                await onSubmit("github");
              });
            }}
            disabled={isPending}
            className="w-full inline-flex items-center justify-center px-6 py-2.5 text-sm font-medium rounded-lg text-background bg-gray-950 outline-none hover:opacity-85 focus-visible:ring-2 focus-visible:ring-sky-600 focus-visible:ring-offset-1 focus-visible:ring-offset-background disabled:opacity-85 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
          >
            {loading === "github" ? (
              <Loader2 className="size-4 shrink-0 mr-2.5 animate-spin" />
            ) : (
              <GitHub width={16} height={16} className="shrink-0 mr-2.5" />
            )}
            Continue with GitHub
          </button>
          <button
            onClick={() => {
              startTransition(async () => {
                await onSubmit("google");
              });
            }}
            disabled={isPending}
            className="w-full inline-flex items-center justify-center px-6 py-2.5 text-sm font-medium rounded-lg text-background bg-gray-950 outline-none hover:opacity-85 focus-visible:ring-2 focus-visible:ring-sky-600 focus-visible:ring-offset-1 focus-visible:ring-offset-background disabled:opacity-85 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
          >
            {loading === "google" ? (
              <Loader2 className="size-4 shrink-0 mr-2.5 animate-spin" />
            ) : (
              <Google width={16} height={16} className="shrink-0 mr-2.5" />
            )}
            Continue with Google
          </button>
        </div>
      </div>
    </main>
  );
}
