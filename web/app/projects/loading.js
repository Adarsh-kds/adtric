export default function Loading() {
  return (
    <section className="mx-auto w-full max-w-[1400px] px-5 pb-20 pt-16 sm:px-8 lg:px-10 lg:pt-24">
      <div className="h-4 w-24 animate-pulse bg-white/10" />
      <div className="mt-6 h-16 w-80 max-w-full animate-pulse bg-white/10" />
      <div className="mt-12 h-40 animate-pulse bg-white/5" />
      <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((item) => (
          <div key={item} className="aspect-[4/5] animate-pulse bg-white/5" />
        ))}
      </div>
    </section>
  );
}
