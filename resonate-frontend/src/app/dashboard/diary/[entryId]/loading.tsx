const ThoughtSkeleton = () => (
  <div className="bg-card p-6 rounded-2xl shadow-lg">
    <div className="flex items-start gap-4 animate-pulse">
      <div className="h-8 w-8 mt-1 bg-muted rounded-full flex-shrink-0"></div>
      <div className="flex-grow space-y-3 pt-1">
        <div className="h-5 bg-muted rounded w-1/3"></div>
        <div className="space-y-2">
          <div className="h-4 bg-muted rounded w-3/4"></div>
          <div className="h-4 bg-muted rounded w-1/2"></div>
        </div>
      </div>
    </div>
  </div>
);

const QuickLinkSkeleton = () => (
  <div className="p-6 bg-card border border-border rounded-2xl shadow-sm animate-pulse">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="h-8 w-8 bg-muted rounded-full"></div>
        <div className="h-5 bg-muted rounded w-24"></div>
      </div>
      <div className="h-5 w-5 bg-muted rounded-full"></div>
    </div>
    <div className="mt-3 h-4 bg-muted rounded w-3/4"></div>
  </div>
);

export default function Loading() {
  return (
    <div className="p-4 sm:p-6 md:p-8 ml-72 space-y-8">
      <div className="h-9 w-1/2 max-w-xs bg-card rounded-lg animate-pulse"></div>
      <ThoughtSkeleton />
      <div>
        <div className="h-8 w-1/3 max-w-[200px] bg-card rounded-lg mb-4 animate-pulse"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <QuickLinkSkeleton />
          <QuickLinkSkeleton />
          <QuickLinkSkeleton />
        </div>
      </div>
    </div>
  );
}
