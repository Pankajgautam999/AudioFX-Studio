import { motion } from "framer-motion";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
};

export default function Hero() {
  return (
    <section id="top" className="relative overflow-hidden px-4 pb-20 pt-16 sm:px-6 sm:pt-24 lg:pt-28">
      <motion.div variants={container} initial="hidden" animate="show" className="mx-auto max-w-4xl text-center">
        <motion.div
          variants={item}
          className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium text-white/70 backdrop-blur-md"
        >
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
          No sign-up. No credit card. Just music.
        </motion.div>

        <motion.h1
          variants={item}
          className="text-balance font-display text-4xl font-bold leading-[1.08] tracking-tight text-white sm:text-6xl"
        >
          Turn a sentence into a
          <span className="bg-gradient-to-r from-accent-400 via-pulse-400 to-glow-400 bg-clip-text text-transparent">
            {" "}
            fully-produced track
          </span>
        </motion.h1>

        <motion.p variants={item} className="mx-auto mt-6 max-w-2xl text-balance text-lg text-white/60">
          Describe a mood, a scene, a genre — Sonora composes an original melody, bassline, pads and percussion
          around it in seconds, right in your browser.
        </motion.p>

        <motion.div variants={item} className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <a href="#generator" className="gradient-button">
            <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
              <path d="M8 5v14l11-7L8 5Z" fill="currentColor" />
            </svg>
            Generate your first track
          </a>
          <a href="#how-it-works" className="ghost-button">
            See how it works
          </a>
        </motion.div>

        <motion.div variants={item} className="mx-auto mt-14 grid max-w-2xl grid-cols-3 gap-4 text-left sm:gap-6">
          {[
            { label: "Genres", value: "10" },
            { label: "Moods", value: "10" },
            { label: "Avg. render", value: "< 2s" },
          ].map((stat) => (
            <div key={stat.label} className="glass-panel px-4 py-4 text-center">
              <div className="font-display text-2xl font-bold text-white">{stat.value}</div>
              <div className="mt-1 text-xs uppercase tracking-wide text-white/50">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}
