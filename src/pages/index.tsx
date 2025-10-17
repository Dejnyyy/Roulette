import RouletteWheel from "./components/Roulette";
import Head from "next/head";

export default function Page() {
  return (
    <>
      <Head>
        <title>Roulette — Spin. Win. Repeat.</title>
        <meta
          name="description"
          content="Rouletta is a fast, stylish, and fun roulette experience. Spin, test your luck, and enjoy the thrill with a modern interface by Dejny."
        />
        <meta
          name="keywords"
          content="Roulette, Game, Casino, Spin, Wheel, Luck, Dejny, Online Roulette"
        />
        <meta name="author" content="Dejny" />
        <meta name="robots" content="index, follow" />

        {/* Viewport for responsiveness */}
        <meta name="viewport" content="width=device-width, initial-scale=1" />

        {/* Theme color for mobile browsers */}
        <meta name="theme-color" content="#000000" />

        {/* Open Graph (Facebook, Messenger, etc.) */}
        <meta property="og:title" content="Roulette — Spin. Win. Repeat." />
        <meta
          property="og:description"
          content="Fast, stylish, and fun roulette experience created by Dejny. Try your luck and feel the thrill."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://roulette.dejny.eu" />
        <meta
          property="og:image"
          content="https://roulette.dejny.eu/roulette.png"
        />
        <meta property="og:site_name" content="Rouletta" />

        {/* Twitter (X) Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Rouletta — Spin. Win. Repeat." />
        <meta
          name="twitter:description"
          content="Fast, stylish, and fun roulette experience created by Dejny."
        />
        <meta
          name="twitter:image"
          content="https://roulette.dejny.eu/roulette.png"
        />

        {/* Favicon & App Icons */}
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/roulette.png" />

        {/* Manifest (optional for PWA) */}
        <link rel="manifest" href="/manifest.json" />
      </Head>
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
    </>
  );
}
