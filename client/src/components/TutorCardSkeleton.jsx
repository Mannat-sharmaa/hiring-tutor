// Mirrors the exact layout of TutorCard so the grid doesn't jump when real
// data replaces the skeletons (no layout shift on load).
export default function TutorCardSkeleton() {
  return (
    <div className="glass-panel rounded-2xl p-5">
      <div className="flex items-center gap-3">
        <div className="shimmer h-14 w-14 animate-shimmer rounded-xl" />
        <div className="flex-1 space-y-2">
          <div className="shimmer h-3.5 w-28 animate-shimmer rounded" />
          <div className="shimmer h-3 w-20 animate-shimmer rounded" />
        </div>
      </div>
      <div className="mt-4 flex gap-1.5">
        <div className="shimmer h-6 w-14 animate-shimmer rounded-full" />
        <div className="shimmer h-6 w-16 animate-shimmer rounded-full" />
      </div>
      <div className="mt-4 h-4 w-24 shimmer animate-shimmer rounded" />
      <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-4">
        <div className="shimmer h-5 w-12 animate-shimmer rounded" />
        <div className="shimmer h-8 w-24 animate-shimmer rounded-lg" />
      </div>
    </div>
  );
}
