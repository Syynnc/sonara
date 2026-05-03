export default function DashboardLoading() {
  return (
    <div className="min-h-[100dvh] bg-[#121212] pt-28 pb-20 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Greeting skeleton */}
        <div className="mb-12">
          <div className="h-3 w-24 bg-[#282828] rounded-full mb-3 animate-pulse" />
          <div className="h-10 w-52 bg-[#282828] rounded-xl animate-pulse" />
        </div>

        {/* Top Tracks skeleton */}
        <div className="mb-14">
          <div className="h-3 w-32 bg-[#282828] rounded-full mb-6 animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0.5">
            {Array.from({ length: 16 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-3 py-2.5">
                <div className="w-5 h-3 bg-[#282828] rounded animate-pulse shrink-0" />
                <div className="w-10 h-10 bg-[#282828] rounded-lg animate-pulse shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-[#282828] rounded-full w-3/4 animate-pulse" />
                  <div className="h-2.5 bg-[#282828] rounded-full w-1/2 animate-pulse" />
                </div>
                <div className="w-8 h-3 bg-[#282828] rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>

        {/* Top Artists skeleton */}
        <div>
          <div className="h-3 w-32 bg-[#282828] rounded-full mb-6 animate-pulse" />
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-3 p-4">
                <div className="w-16 h-16 rounded-full bg-[#282828] animate-pulse" />
                <div className="space-y-1.5 w-full flex flex-col items-center">
                  <div className="h-3 bg-[#282828] rounded-full w-16 animate-pulse" />
                  <div className="h-2.5 bg-[#282828] rounded-full w-10 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
