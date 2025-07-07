"use client";
import Link from "next/link";
import { BookOpen } from "lucide-react";

import { ModeToggle } from "./mode-toggle";
import { usePathname } from "next/navigation";
import { cn } from "@/ui";

export default function Header() {
  const pathname = usePathname();
  const isReading = pathname.includes("/read");
  const links = [
    { to: "/", label: "Home" },
  ];

  return (
    <header className={cn("sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60", {"hidden": isReading})}>
      <div className="container mx-auto max-w-7xl px-4">
        <div className="flex h-14 items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <BookOpen className="h-6 w-6" />
              <span className="text-xl">Manga Reader</span>
            </Link>
            <nav className="hidden md:flex gap-6">
              {links.map(({ to, label }) => {
                return (
                  <Link 
                    key={to} 
                    href={to}
                    className="text-sm font-medium transition-colors hover:text-primary"
                  >
                    {label}
                  </Link>
                );
              })}
            </nav>
          </div>
          <div className="flex items-center gap-2">
            <ModeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}
