export default function Footer() {
  return (
    <footer className="border-t border-white/5 px-4 py-10 sm:px-6">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 text-sm text-white/40 sm:flex-row">
        <p>&copy; {new Date().getFullYear()} Sonora. Original generative audio, no sign-up required.</p>
        <div className="flex items-center gap-6">
          <a href="#top" className="hover:text-white/70">
            Back to top
          </a>
          <a href="#generator" className="hover:text-white/70">
            Generate
          </a>
        </div>
      </div>
    </footer>
  );
}
