'use client';

/**
 * Renders a time-based greeting using the **browser's** local clock,
 * avoiding the mismatch that occurs when the server runs in UTC.
 */
export function Greeting({ firstName }: { firstName: string }) {
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <>
      <p className="text-xs font-semibold tracking-[0.25em] text-[#FF5500]/50 uppercase mb-2">
        {greeting}
      </p>
      <h1 className="text-4xl md:text-5xl font-bold tracking-tighter text-[#FFFFFF]">
        Hey, {firstName}.
      </h1>
    </>
  );
}
