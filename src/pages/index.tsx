import RouletteWheel from "./components/Roulette";
import Head from "next/head";
import Link from "next/link";

const URL = "https://roulette.dejny.eu";

const JSON_LD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://dejny.eu/#organization",
      name: "Dejny",
      url: "https://dejny.eu",
      logo: { "@type": "ImageObject", url: "https://dejny.eu/icon.png", width: 512, height: 512 },
      email: "dejny@dejny.eu",
      address: { "@type": "PostalAddress", addressLocality: "Praha", addressCountry: "CZ" },
      contactPoint: { "@type": "ContactPoint", contactType: "customer support", email: "dejny@dejny.eu", availableLanguage: ["cs", "en"] },
      sameAs: [
        "https://github.com/Dejnyyy",
        "https://linkedin.com/in/dejny",
        "https://www.instagram.com/_dejny",
        "https://www.tiktok.com/@dejnyyy",
      ],
    },
    {
      "@type": "WebSite",
      "@id": `${URL}/#website`,
      name: "Rouletta",
      url: URL,
      inLanguage: "en",
      publisher: { "@id": "https://dejny.eu/#organization" },
    },
    {
      "@type": "WebApplication",
      "@id": `${URL}/#app`,
      name: "Rouletta",
      url: URL,
      description:
        "Rouletta is a fast, stylish, and fun roulette experience. Spin, test your luck, and enjoy the thrill with a modern interface by Dejny.",
      image: `${URL}/roulette.png`,
      applicationCategory: "GameApplication",
      operatingSystem: "Any",
      inLanguage: "en",
      isAccessibleForFree: true,
      offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
      author: { "@id": "https://dejny.eu/#organization" },
      publisher: { "@id": "https://dejny.eu/#organization" },
    },
  ],
};

export default function Page() {
  return (
    <>
      <Head>
        <title>Roulette — Spin. Win. Repeat. Free Online Roulette</title>
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
        <meta property="og:title" content="Roulette — Spin. Win. Repeat. Free Online Roulette" />
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

        {/* Canonical */}
        <link rel="canonical" href="https://roulette.dejny.eu/" />

        {/* Favicon & App Icons */}
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/roulette.png" />

        {/* Sitemap reference */}
        <link rel="sitemap" type="application/xml" href="/sitemap.xml" />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }}
        />
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

        <section className="mx-auto max-w-3xl px-4 py-12 text-sm leading-relaxed text-white/70 space-y-4">
          <h2 className="text-xl font-semibold text-white/90">About Rouletta</h2>
          <p>
            Rouletta is a free online roulette game made for fun. You play with a virtual balance, not real money, so
            you can try different betting strategies without any risk. Choose your stake, bet on a single number, on
            red or black, or on odd or even, then spin the wheel and watch where the ball lands.
          </p>
          <p>
            The wheel follows the classic European layout with numbers 0 to 36. A winning bet on a single number pays 35
            to 1, while a winning bet on a colour or on odd or even pays even money. Sign in and your virtual
            balance and bets are saved to your account, so you can come back later and keep playing.
          </p>
          <p>
            Rouletta runs in any modern browser on desktop and mobile. It is a hobby project by Dejny, built with
            Next.js, and it is meant purely as entertainment. Nothing here is gambling with real money and there is
            nothing to buy.
          </p>
        </section>

        <footer className="mx-auto max-w-7xl px-4 py-6 mt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-4 text-xs text-white/40">
          <span>
            Built by{" "}
            <a
              href="https://dejny.eu"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/60 hover:text-amber-300 transition-colors"
            >
              Dejny
            </a>
          </span>
          <nav className="flex gap-4">
            <Link href="/" className="hover:text-white/70 transition-colors">
              Home
            </Link>
            <a
              href="https://github.com/Dejnyyy/Roulette"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white/70 transition-colors"
            >
              GitHub
            </a>
          </nav>
        </footer>
      </div>
    </>
  );
}
