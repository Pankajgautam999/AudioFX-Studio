import { motion } from "framer-motion";

export default function Navbar() {
  return (
    <motion.header
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="sticky top-0 z-40 border-b border-white/5 bg-surface-950/60 backdrop-blur-xl"
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        <a href="#top" className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-accent-500 via-pulse-500 to-glow-500 shadow-glow">
            <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 text-white">
              <path
                d="M9 18V5l12-2v13M9 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm12-2a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <span className="font-display text-lg font-semibold tracking-tight text-white">Sonora</span>
        </a>

        <nav className="hidden items-center gap-8 text-sm font-medium text-white/60 sm:flex">
          <a href="#generator" className="transition-colors hover:text-white">
            Generate
          </a>
          <a href="#how-it-works" className="transition-colors hover:text-white">
            How it works
          </a>
          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            className="transition-colors hover:text-white"
          >
            GitHub
          </a>
        </nav>

        <a href="#generator" className="ghost-button text-sm">
          Start creating
          <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
            <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </a>
      </div>
    </motion.header>
  );
}
