import RouletteWheel from "./components/Roulette";

export default function Page() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-black">
      {/* Ambient background */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-40 -left-40 h-[44rem] w-[44rem] rounded-full bg-gradient-to-br from-emerald-600/20 to-cyan-500/10 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 h-[44rem] w-[44rem] rounded-full bg-gradient-to-tr from-yellow-500/10 to-rose-500/20 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.06),transparent_55%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(transparent,rgba(0,0,0,0.5))]" />
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8">
        <RouletteWheel />
      </div>
    </div>
  );
}
