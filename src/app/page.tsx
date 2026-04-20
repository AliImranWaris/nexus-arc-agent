import Link from "next/link";

/* ─── Reusable icon components ─────────────────────────────────────────── */
function IconBrain() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-7 w-7">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
      <path d="M8 12c0-2.21 1.79-4 4-4s4 1.79 4 4-1.79 4-4 4" />
      <path d="M12 8v1M12 15v1M8.46 9.46l.7.7M14.84 14.84l.7.7M7 12H8M16 12h1M8.46 14.54l.7-.7M14.84 9.16l.7-.7" />
    </svg>
  );
}
function IconShield() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-7 w-7">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  );
}
function IconZap() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-7 w-7">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  );
}
function IconHexagon({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex items-center justify-center w-16 h-16 mb-5">
      <svg viewBox="0 0 64 64" className="absolute inset-0 w-full h-full" fill="none">
        <polygon
          points="32,4 58,18 58,46 32,60 6,46 6,18"
          stroke="rgba(6,182,212,0.4)"
          strokeWidth="1"
          fill="rgba(6,182,212,0.06)"
        />
      </svg>
      <span className="relative text-cyan-400">{children}</span>
    </div>
  );
}

/* ─── Decorative background elements ────────────────────────────────────── */
function GridBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden">
      {/* Grid */}
      <div className="absolute inset-0 bg-grid" />
      {/* Radial glows */}
      <div className="absolute inset-0 bg-radial-glow" />
      {/* Scan line */}
      <div
        className="animate-scan absolute left-0 right-0 h-px opacity-20"
        style={{ background: "linear-gradient(90deg, transparent, rgba(6,182,212,0.8), transparent)" }}
      />
      {/* Corner accents */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl" />
    </div>
  );
}

/* ─── Nav ────────────────────────────────────────────────────────────────── */
function Nav() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <div className="mx-auto max-w-6xl px-6 py-4">
        <nav className="glass glow-border rounded-2xl px-5 py-3 flex items-center justify-between transition-all duration-300">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="relative h-8 w-8">
              <div className="animate-pulse-ring absolute inset-0 rounded-lg bg-cyan-500/20" />
              <div className="relative h-8 w-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="h-4 w-4 text-white" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polygon points="12 2 2 7 12 12 22 7 12 2" />
                  <polyline points="2 17 12 22 22 17" />
                  <polyline points="2 12 12 17 22 12" />
                </svg>
              </div>
            </div>
            <span className="text-sm font-bold tracking-tight text-white">
              Nexus<span className="text-cyan-400">Arc</span>
            </span>
          </div>

          {/* Links */}
          <div className="hidden md:flex items-center gap-6 text-xs text-slate-400">
            <a href="#features" className="hover:text-cyan-400 transition-colors">Features</a>
            <a href="#tech" className="hover:text-cyan-400 transition-colors">Tech Stack</a>
            <a href="#how-it-works" className="hover:text-cyan-400 transition-colors">How it works</a>
          </div>

          {/* CTA */}
          <Link
            href="/dashboard"
            className="rounded-xl bg-cyan-500 px-4 py-2 text-xs font-semibold text-slate-950 hover:bg-cyan-400 transition-all duration-200 shadow-lg shadow-cyan-500/20"
          >
            Launch Dashboard →
          </Link>
        </nav>
      </div>
    </header>
  );
}

/* ─── Hero ───────────────────────────────────────────────────────────────── */
function Hero() {
  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center px-6 pt-24 pb-16 text-center">
      {/* Status badge */}
      <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/5 px-4 py-1.5 text-xs text-cyan-400">
        <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
        Live on Arc Testnet · Circle SDK Integrated
      </div>

      {/* Title */}
      <h1 className="mb-6 max-w-4xl text-6xl font-black tracking-tight sm:text-7xl lg:text-8xl">
        <span className="block text-white leading-none">Nexus</span>
        <span className="block gradient-text text-glow leading-none">Arc</span>
      </h1>

      {/* Tagline */}
      <p className="mb-4 max-w-2xl text-lg text-slate-400 sm:text-xl leading-relaxed">
        The <span className="text-cyan-300 font-medium">Agentic Layer</span> for the Arc Blockchain.
        <br />
        AI-powered micro-opportunities. User-controlled. Always secure.
      </p>
      <p className="mb-12 text-sm text-slate-600 max-w-lg">
        Built on Circle Programmable Wallets — every transaction requires your explicit signature.
        No autonomous execution. Full self-custody.
      </p>

      {/* CTAs */}
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <Link
          href="/dashboard"
          className="group relative inline-flex items-center gap-2 overflow-hidden rounded-2xl bg-cyan-500 px-8 py-4 text-sm font-bold text-slate-950 shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all duration-300 hover:bg-cyan-400 hover:scale-105"
        >
          <span>Launch Dashboard</span>
          <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
          {/* Shimmer overlay */}
          <span className="absolute inset-0 -translate-x-full skew-x-12 bg-white/20 transition-transform duration-500 group-hover:translate-x-full" />
        </Link>

        <a
          href="#features"
          className="inline-flex items-center gap-2 rounded-2xl border border-slate-700 bg-slate-900/60 px-8 py-4 text-sm font-semibold text-slate-300 hover:border-cyan-500/50 hover:text-cyan-300 transition-all duration-200"
        >
          Explore Features
        </a>
      </div>

      {/* Floating stat chips */}
      <div className="mt-20 flex flex-wrap justify-center gap-4 text-xs">
        {[
          { label: "Gas Fee", value: "Zero" },
          { label: "Settlement", value: "Instant" },
          { label: "Custody", value: "Self" },
          { label: "Network", value: "Arc Testnet" },
        ].map(({ label, value }) => (
          <div
            key={label}
            className="glass glow-border rounded-xl px-4 py-2.5 flex items-center gap-2"
          >
            <span className="text-slate-500">{label}</span>
            <span className="text-cyan-300 font-semibold">{value}</span>
          </div>
        ))}
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-slate-600 text-xs">
        <span>scroll</span>
        <div className="h-8 w-px shimmer-border" />
      </div>
    </section>
  );
}

/* ─── Features ───────────────────────────────────────────────────────────── */
const FEATURES = [
  {
    icon: <IconBrain />,
    title: "AI-Native Trading",
    badge: "Intelligent",
    description:
      "Autonomous agents continuously scan Arc Testnet for micro-opportunities — liquidity gaps, rebalance windows, and yield positions — surfacing ranked proposals with confidence scores.",
    bullets: ["Confidence-scored proposals", "Simulated market feed", "Real-time opportunity detection"],
    accent: "cyan",
  },
  {
    icon: <IconShield />,
    title: "Secure Self-Custody",
    badge: "Non-custodial",
    description:
      "Built on Circle Programmable Wallets. Every transaction is a proposal — your private key never leaves your device. You sign, you control, you own.",
    bullets: ["Circle SDK challenge flow", "User-authorised every time", "No auto-execution ever"],
    accent: "blue",
  },
  {
    icon: <IconZap />,
    title: "Zero Friction",
    badge: "Gas-free",
    description:
      "Arc Testnet's gas-free architecture means micro-transactions are economically viable. Send $0.001 USDC with the same UX as sending $1,000.",
    bullets: ["Gas-free on Arc Testnet", "Instant settlement layer", "USDC micro-transactions"],
    accent: "violet",
  },
];

function Features() {
  return (
    <section id="features" className="relative px-6 py-32">
      <div className="mx-auto max-w-6xl">
        {/* Section header */}
        <div className="mb-16 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-cyan-500 mb-3">
            Core Capabilities
          </p>
          <h2 className="text-4xl font-black text-white sm:text-5xl">
            Built for the{" "}
            <span className="gradient-text">next era of DeFi</span>
          </h2>
          <p className="mt-4 text-slate-400 max-w-xl mx-auto">
            Combining agentic AI with Circle&apos;s programmable wallet infrastructure for a secure, user-first trading experience.
          </p>
        </div>

        {/* Cards */}
        <div className="grid gap-6 lg:grid-cols-3">
          {FEATURES.map((f, i) => (
            <div
              key={i}
              className="group glass glow-border rounded-2xl p-8 flex flex-col hover:border-cyan-500/40 transition-all duration-300 hover:-translate-y-1"
            >
              {/* Icon */}
              <IconHexagon>{f.icon}</IconHexagon>

              {/* Badge */}
              <span className="mb-3 self-start rounded-full border border-cyan-500/20 bg-cyan-500/5 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-cyan-500">
                {f.badge}
              </span>

              <h3 className="mb-3 text-xl font-bold text-white">{f.title}</h3>
              <p className="mb-5 text-sm text-slate-400 leading-relaxed flex-1">{f.description}</p>

              {/* Bullets */}
              <ul className="space-y-2">
                {f.bullets.map((b) => (
                  <li key={b} className="flex items-center gap-2 text-xs text-slate-500">
                    <span className="h-1 w-1 rounded-full bg-cyan-500 shrink-0" />
                    {b}
                  </li>
                ))}
              </ul>

              {/* Bottom shimmer line */}
              <div className="mt-6 h-px shimmer-border opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── How it works ───────────────────────────────────────────────────────── */
const STEPS = [
  {
    n: "01",
    title: "Connect Your Wallet",
    body: "Authenticate via Circle's User-Controlled Wallets SDK. Your keys stay on your device.",
  },
  {
    n: "02",
    title: "Review AI Proposals",
    body: "The agent scans Arc Testnet and surfaces ranked opportunities with confidence scores and rationale.",
  },
  {
    n: "03",
    title: "Approve & Sign",
    body: "Select a proposal. The form pre-fills — you review the destination and amount, then sign via Circle's secure challenge flow.",
  },
  {
    n: "04",
    title: "Settle on Arc",
    body: "Your signed transaction settles instantly on Arc Testnet. Zero gas. Full transparency. Full control.",
  },
];

function HowItWorks() {
  return (
    <section id="how-it-works" className="relative px-6 py-32">
      {/* Horizontal rule with glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-16 shimmer-border" />

      <div className="mx-auto max-w-6xl">
        <div className="mb-16 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-cyan-500 mb-3">Process</p>
          <h2 className="text-4xl font-black text-white sm:text-5xl">
            How it <span className="gradient-text">works</span>
          </h2>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, i) => (
            <div key={i} className="group relative glass glow-border rounded-2xl p-6 hover:-translate-y-1 transition-all duration-300">
              {/* Connector line (desktop) */}
              {i < STEPS.length - 1 && (
                <div className="hidden lg:block absolute top-10 -right-3 w-6 h-px shimmer-border z-10" />
              )}

              {/* Step number */}
              <div className="mb-5 text-5xl font-black text-cyan-500/10 group-hover:text-cyan-500/20 transition-colors leading-none select-none">
                {step.n}
              </div>
              <h3 className="mb-2 font-bold text-white text-sm">{step.title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{step.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Tech Stack ─────────────────────────────────────────────────────────── */
function TechStack() {
  return (
    <section id="tech" className="relative px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <div className="glass glow-border rounded-3xl p-10 sm:p-14 overflow-hidden relative">
          {/* Background decoration */}
          <div className="pointer-events-none absolute -top-20 -right-20 h-64 w-64 rounded-full bg-cyan-500/5 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-blue-500/5 blur-3xl" />

          <div className="relative text-center mb-12">
            <p className="text-xs font-semibold uppercase tracking-widest text-cyan-500 mb-3">Powered by</p>
            <h2 className="text-3xl font-black text-white sm:text-4xl">
              Enterprise-grade <span className="gradient-text">infrastructure</span>
            </h2>
          </div>

          <div className="relative grid gap-6 sm:grid-cols-2 max-w-2xl mx-auto">
            {/* Arc Blockchain */}
            <div className="glass rounded-2xl p-6 border border-cyan-500/20 hover:border-cyan-500/50 transition-all group">
              <div className="flex items-center gap-4 mb-4">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 flex items-center justify-center">
                  <svg viewBox="0 0 24 24" className="h-6 w-6 text-cyan-400" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <polygon points="12 2 2 7 12 12 22 7 12 2" />
                    <polyline points="2 17 12 22 22 17" />
                    <polyline points="2 12 12 17 22 12" />
                  </svg>
                </div>
                <div>
                  <p className="font-bold text-white text-sm">Arc Blockchain</p>
                  <p className="text-xs text-slate-500">Gas-free testnet</p>
                </div>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Zero-cost micro-transactions with instant finality. Purpose-built for agentic finance at scale.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {["Gas-free", "EVM-compatible", "High throughput"].map((t) => (
                  <span key={t} className="rounded-full border border-cyan-500/20 bg-cyan-500/5 px-2 py-0.5 text-[10px] text-cyan-500">{t}</span>
                ))}
              </div>
            </div>

            {/* Circle USDC */}
            <div className="glass rounded-2xl p-6 border border-blue-500/20 hover:border-blue-500/50 transition-all group">
              <div className="flex items-center gap-4 mb-4">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-violet-600/20 border border-blue-500/30 flex items-center justify-center">
                  <svg viewBox="0 0 24 24" className="h-6 w-6 text-blue-400" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="16" />
                    <line x1="8" y1="12" x2="16" y2="12" />
                  </svg>
                </div>
                <div>
                  <p className="font-bold text-white text-sm">Circle · USDC</p>
                  <p className="text-xs text-slate-500">Programmable Wallets SDK</p>
                </div>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Industry-standard stablecoin with Circle&apos;s User-Controlled Wallets for true self-custody and secure challenge signing.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {["Self-custody", "Challenge flow", "USDC native"].map((t) => (
                  <span key={t} className="rounded-full border border-blue-500/20 bg-blue-500/5 px-2 py-0.5 text-[10px] text-blue-400">{t}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Next.js badge */}
          <div className="relative mt-8 flex justify-center">
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <span>Also built with</span>
              <span className="font-mono text-slate-500">Next.js 16</span>
              <span>·</span>
              <span className="font-mono text-slate-500">TypeScript</span>
              <span>·</span>
              <span className="font-mono text-slate-500">Tailwind CSS</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── CTA Banner ─────────────────────────────────────────────────────────── */
function CTABanner() {
  return (
    <section className="relative px-6 py-24">
      <div className="mx-auto max-w-4xl text-center">
        <div className="glass glow-border rounded-3xl px-8 py-16 relative overflow-hidden">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-blue-600/5" />
          <p className="relative text-xs font-semibold uppercase tracking-widest text-cyan-500 mb-4">
            Ready to explore?
          </p>
          <h2 className="relative mb-4 text-4xl font-black text-white sm:text-5xl">
            Take control of your
            <br />
            <span className="gradient-text">on-chain future</span>
          </h2>
          <p className="relative mb-10 text-slate-400 max-w-md mx-auto text-sm leading-relaxed">
            Connect your Circle wallet, review AI-generated proposals, and authorise transfers — all from a single secure interface.
          </p>
          <Link
            href="/dashboard"
            className="group relative inline-flex items-center gap-3 overflow-hidden rounded-2xl bg-cyan-500 px-10 py-4 text-sm font-bold text-slate-950 shadow-xl shadow-cyan-500/30 hover:shadow-cyan-500/50 transition-all duration-300 hover:scale-105 hover:bg-cyan-400"
          >
            <span>Launch Dashboard</span>
            <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
            <span className="absolute inset-0 -translate-x-full skew-x-12 bg-white/20 transition-transform duration-500 group-hover:translate-x-full" />
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ─── Footer ─────────────────────────────────────────────────────────────── */
function Footer() {
  return (
    <footer className="relative border-t border-slate-800/60 px-6 py-10">
      <div className="mx-auto max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-600">
        <div className="flex items-center gap-2">
          <div className="h-5 w-5 rounded bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="h-3 w-3 text-white" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="12 2 2 7 12 12 22 7 12 2" />
              <polyline points="2 17 12 22 22 17" />
            </svg>
          </div>
          <span className="font-semibold text-slate-500">NexusArc</span>
          <span>· Hackathon Demo · {new Date().getFullYear()}</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="hover:text-cyan-500 transition-colors">Dashboard</Link>
          <span className="text-slate-700">·</span>
          <span>Built on Arc &amp; Circle</span>
        </div>
      </div>
    </footer>
  );
}

/* ─── Page ───────────────────────────────────────────────────────────────── */
export default function LandingPage() {
  return (
    <div className="relative overflow-x-hidden" style={{ background: "#020817" }}>
      <GridBackground />
      <Nav />
      <Hero />
      <Features />
      <HowItWorks />
      <TechStack />
      <CTABanner />
      <Footer />
    </div>
  );
}
