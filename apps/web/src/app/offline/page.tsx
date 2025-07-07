"use client";

import React from "react";
import { Button } from "@/ui";
import { WifiOff, RefreshCw, BookOpen } from "lucide-react";
import { useRouter } from "next/navigation";

export default function OfflinePage() {
  const router = useRouter();

  const handleRefresh = () => {
    window.location.reload();
  };

  const handleGoHome = () => {
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="space-y-4">
          <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center">
            <WifiOff className="w-12 h-12 text-muted-foreground" />
          </div>
          
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">You&apos;re Offline</h1>
            <p className="text-lg text-muted-foreground">
              No internet connection detected. Some features may be limited.
            </p>
          </div>
        </div>

        <div className="bg-card rounded-lg p-6 space-y-4">
          <div className="flex items-center gap-3">
            <BookOpen className="w-5 h-5 text-primary" />
            <h2 className="font-semibold">What you can still do:</h2>
          </div>
          
          <ul className="text-left space-y-2 text-sm text-muted-foreground">
            <li>• Continue reading previously loaded chapters</li>
            <li>• View your reading progress and history</li>
            <li>• Browse cached manga covers and details</li>
            <li>• Access your Continue Reading list</li>
          </ul>
        </div>

        <div className="space-y-3">
          <Button 
            onClick={handleRefresh}
            className="w-full"
            size="lg"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
          
          <Button 
            variant="outline"
            onClick={handleGoHome}
            className="w-full"
            size="lg"
          >
            <BookOpen className="w-4 h-4 mr-2" />
            Go to Home
          </Button>
        </div>

        <div className="text-xs text-muted-foreground">
          <p>
            Tip: When you&apos;re back online, the app will automatically sync your reading progress.
          </p>
        </div>
      </div>
    </div>
  );
} 