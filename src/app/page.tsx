import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-5 max-w-6xl mx-auto">
        <span className="text-xl font-bold tracking-tight">Listora</span>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm text-zinc-400 hover:text-white transition">
            Log in
          </Link>
          <Link href="/signup" className="bg-white text-black text-sm font-medium px-4 py-2 rounded-full hover:bg-zinc-200 transition">
            Get started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-24 pb-32 text-center">
        <div className="inline-block bg-zinc-900 border border-zinc-800 text-zinc-400 text-xs px-3 py-1 rounded-full mb-8">
          AI-powered real estate marketing
        </div>
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 leading-tight">
          Your listings.<br />
          <span className="text-zinc-400">Marketed like a pro.</span>
        </h1>
        <p className="text-zinc-400 text-lg md:text-xl max-w-2xl mx-auto mb-10">
          Listora turns your property info into stunning posts, cinematic reels, and a beautiful portfolio page — in minutes, in any language.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link href="/signup" className="bg-white text-black font-semibold px-6 py-3 rounded-full hover:bg-zinc-200 transition">
            Start for free
          </Link>
          <Link href="#features" className="text-zinc-400 hover:text-white text-sm transition">
            See how it works →
          </Link>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="max-w-6xl mx-auto px-6 pb-32">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              title: "AI Caption Engine",
              desc: "Paste your listing details and get scroll-stopping captions in English, Spanish, or any language — written in your brand voice."
            },
            {
              title: "Cinematic Reels",
              desc: "Upload your photos and videos. Listora edits them into pro-quality reels with music, motion, and your branding."
            },
            {
              title: "Agent Portfolio",
              desc: "Every listing lives on your personal Listora page. Share one link in your bio and let buyers browse your full portfolio."
            },
            {
              title: "Shoot Guide",
              desc: "Before you film, Listora tells you exactly how to shoot each room for the best results. Better input, better output."
            },
            {
              title: "Voice Clone",
              desc: "Record yourself once. Listora clones your voice and narrates every video in your own voice — automatically."
            },
            {
              title: "Auto Publishing",
              desc: "Connect Instagram, Facebook, and WhatsApp. Schedule your content calendar and let Listora post for you."
            }
          ].map((f, i) => (
            <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
              <h3 className="font-semibold text-white mb-2">{f.title}</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-6 pb-32 text-center">
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-16">
          <h2 className="text-4xl font-bold mb-4">Ready to market smarter?</h2>
          <p className="text-zinc-400 mb-8">Join agents already using Listora to win more listings.</p>
          <Link href="/signup" className="bg-white text-black font-semibold px-6 py-3 rounded-full hover:bg-zinc-200 transition">
            Get started free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800 px-6 py-8 max-w-6xl mx-auto flex items-center justify-between text-zinc-500 text-sm">
          <span>&copy; 2026 Listora</span>
        <span>Built for real estate agents worldwide</span>
      </footer>
    </main>
  )
}