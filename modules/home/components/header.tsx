"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { UserButton } from "@/modules/auth/components/user-button";
import { useSession } from "next-auth/react";
import { ThemeToggle } from "@/modules/home/components/theme-toggle";

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const { data: session } = useSession();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-background/90 backdrop-blur-md border-b border-border shadow-lg shadow-black/10"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="relative w-7 h-7">
            <div className="absolute inset-0 bg-violet-500 rounded-md rotate-6 group-hover:rotate-12 transition-transform duration-300" />
            <div className="absolute inset-0 bg-background border border-border rounded-md flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M2 4L5.5 7L2 10" stroke="#a78bfa" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M7.5 10H12" stroke="#a78bfa" strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
            </div>
          </div>
          <span className="text-foreground font-semibold tracking-tight text-[15px]">
            Vibe<span className="text-violet-400">Code</span>
          </span>
        </Link>

        {/* Nav Links */}
        <nav className="hidden md:flex items-center gap-1">
          {[
            { label: "Editor", href: "/editor" },
            { label: "Templates", href: "/templates" },
            { label: "Docs", href: "/docs" },
            { label: "Pricing", href: "/pricing" },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="px-3.5 py-1.5 text-sm text-muted-foreground hover:text-foreground rounded-md hover:bg-accent transition-all duration-150"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Right Side */}
        <div className="flex items-center gap-3">
          <ThemeToggle />
          {session?.user ? (
            <>
              <Link href="/editor">
                <Button
                  size="sm"
                  className="bg-violet-600 hover:bg-violet-500 text-white text-sm px-4 h-8 rounded-md transition-colors"
                >
                  Open Editor
                </Button>
              </Link>
              <UserButton />
            </>
          ) : (
            <>
              <Link href="/auth/sign-in">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-foreground text-sm h-8 px-3"
                >
                  Sign In
                </Button>
              </Link>
              <Link href="/auth/sign-up">
                <Button
                  size="sm"
                  className="bg-violet-600 hover:bg-violet-500 text-white text-sm px-4 h-8 rounded-md transition-colors"
                >
                  Get Started
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Bottom gradient line */}
      <div
        className={`absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-500/30 to-transparent transition-opacity duration-300 ${
          scrolled ? "opacity-100" : "opacity-0"
        }`}
      />
    </header>
  );
}