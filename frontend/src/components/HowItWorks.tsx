import { motion } from "framer-motion";

const STEPS = [
  {
    title: "Describe it",
    body: "Write a prompt, pick a genre and mood, set a duration. Add a negative prompt to steer away from what you don't want.",
    icon: (
      <path d="M4 6h16M4 12h10M4 18h7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    ),
  },
  {
    title: "We compose it",
    body: "A generative engine builds an original melody, bassline, pads and percussion tailored to your prompt in real time.",
    icon: (
      <path
        d="M9 18V5l12-2v13M9 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm12-2a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
  },
  {
    title: "Play & take it",
    body: "Preview instantly with the built-in player, then download the WAV or copy your prompt to remix it later.",
    icon: (
      <path d="M8 5v14l11-7L8 5Z" fill="currentColor" />
    ),
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.5 }}
        className="mx-auto mb-12 max-w-xl text-center"
      >
        <h2 className="font-display text-3xl font-bold text-white">How it works</h2>
        <p className="mt-3 text-white/50">Three steps between a sentence and a finished track.</p>
      </motion.div>

      <div className="grid gap-5 sm:grid-cols-3">
        {STEPS.map((step, i) => (
          <motion.div
            key={step.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5, delay: i * 0.12 }}
            className="glass-panel p-6"
          >
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-accent-500/25 to-pulse-500/25 text-accent-300">
              <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
                {step.icon}
              </svg>
            </div>
            <h3 className="font-display text-lg font-semibold text-white">
              {i + 1}. {step.title}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-white/55">{step.body}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
