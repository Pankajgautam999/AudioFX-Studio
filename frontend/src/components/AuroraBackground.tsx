import { motion } from "framer-motion";

export default function AuroraBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-surface-950">
      <div className="absolute inset-0 bg-aurora-gradient" />
      <motion.div
        className="absolute -left-32 top-[-10%] h-[32rem] w-[32rem] rounded-full bg-accent-500/20 blur-[120px]"
        animate={{ x: [0, 40, 0], y: [0, 30, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute right-[-10%] top-[10%] h-[28rem] w-[28rem] rounded-full bg-pulse-500/20 blur-[120px]"
        animate={{ x: [0, -30, 0], y: [0, 40, 0] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-[-15%] left-[20%] h-[26rem] w-[26rem] rounded-full bg-glow-500/15 blur-[120px]"
        animate={{ x: [0, 25, 0], y: [0, -20, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />
      <div
        className="absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60' viewBox='0 0 60 60'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M0 0h1v1H0V0zm10 10h1v1h-1v-1z'/%3E%3C/g%3E%3C/svg%3E\")",
        }}
      />
    </div>
  );
}
