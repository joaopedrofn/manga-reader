"use client";

import React from "react";
import { Loader2, CheckCircle2, AlertCircle, Download } from "lucide-react";

interface PreloadIndicatorProps {
  stats: {
    total: number;
    loaded: number;
    loading: number;
    errors: number;
    queueLength: number;
    activeLoads: number;
  };
  className?: string;
  variant?: "minimal" | "detailed";
}

export function PreloadIndicator({ stats, className = "", variant = "minimal" }: PreloadIndicatorProps) {
  if (stats.total === 0) return null;

  const progress = stats.total > 0 ? (stats.loaded / stats.total) * 100 : 0;
  const isLoading = stats.loading > 0 || stats.activeLoads > 0;

  if (variant === "minimal") {
    return (
      <div className={`flex items-center gap-1 ${className}`}>
        {isLoading ? (
          <Loader2 className="w-3 h-3 animate-spin text-blue-400" />
        ) : stats.errors > 0 ? (
          <AlertCircle className="w-3 h-3 text-red-400" />
        ) : (
          <CheckCircle2 className="w-3 h-3 text-green-400" />
        )}
        <span className="text-xs text-muted-foreground">
          {stats.loaded}/{stats.total}
        </span>
      </div>
    );
  }

  return (
    <div className={`bg-card border rounded-lg p-3 space-y-2 ${className}`}>
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium">Page Cache</span>
        <span className="text-muted-foreground">
          {Math.round(progress)}%
        </span>
      </div>
      
      {/* Progress bar */}
      <div className="w-full bg-gray-200 rounded-full h-1.5">
        <div 
          className="bg-primary h-1.5 rounded-full transition-all duration-300" 
          style={{ width: `${progress}%` }}
        />
      </div>
      
      {/* Status breakdown */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-3">
          {stats.loaded > 0 && (
            <div className="flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-green-500" />
              <span>{stats.loaded} ready</span>
            </div>
          )}
          
          {stats.loading > 0 && (
            <div className="flex items-center gap-1">
              <Loader2 className="w-3 h-3 animate-spin text-blue-500" />
              <span>{stats.loading} loading</span>
            </div>
          )}
          
          {stats.errors > 0 && (
            <div className="flex items-center gap-1">
              <AlertCircle className="w-3 h-3 text-red-500" />
              <span>{stats.errors} failed</span>
            </div>
          )}
        </div>
        
        {stats.queueLength > 0 && (
          <div className="flex items-center gap-1">
            <Download className="w-3 h-3" />
            <span>{stats.queueLength} queued</span>
          </div>
        )}
      </div>
    </div>
  );
} 