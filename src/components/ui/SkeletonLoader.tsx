import { cn } from "@/lib/utils";

interface SkeletonLoaderProps {
  className?: string;
  count?: number;
}

export function SkeletonBlock({ className }: { className?: string }) {
  return <div className={cn("skeleton", className)} />;
}

export function SummaryCardSkeleton() {
  return (
    <div className="glass rounded-2xl p-5 space-y-3 animate-pulse">
      <div className="flex items-start gap-3">
        <SkeletonBlock className="w-16 h-12 rounded-lg flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <SkeletonBlock className="h-4 w-3/4" />
          <SkeletonBlock className="h-3 w-1/2" />
        </div>
      </div>
      <SkeletonBlock className="h-3 w-full" />
      <SkeletonBlock className="h-3 w-5/6" />
    </div>
  );
}

export function ResultSkeleton() {
  return (
    <div className="space-y-6">
      {/* TL;DR */}
      <div className="glass rounded-2xl p-6 space-y-3">
        <SkeletonBlock className="h-5 w-24" />
        <SkeletonBlock className="h-4 w-full" />
        <SkeletonBlock className="h-4 w-5/6" />
        <SkeletonBlock className="h-4 w-4/6" />
      </div>
      {/* Key Takeaways */}
      <div className="glass rounded-2xl p-6 space-y-3">
        <SkeletonBlock className="h-5 w-36" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex gap-3">
            <SkeletonBlock className="h-4 w-16 flex-shrink-0" />
            <SkeletonBlock className="h-4 flex-1" />
          </div>
        ))}
      </div>
      {/* Sentiment */}
      <div className="glass rounded-2xl p-6 space-y-4">
        <SkeletonBlock className="h-5 w-40" />
        <div className="flex justify-center">
          <SkeletonBlock className="h-32 w-64 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export default function SkeletonLoader({ count = 3 }: SkeletonLoaderProps) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <SummaryCardSkeleton key={i} />
      ))}
    </div>
  );
}
