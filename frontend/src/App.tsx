import { useState } from "react";
import AuroraBackground from "@/components/AuroraBackground";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import HowItWorks from "@/components/HowItWorks";
import Footer from "@/components/Footer";
import GeneratorForm from "@/components/GeneratorForm";
import ResultPlayer from "@/components/ResultPlayer";
import LoadingSkeleton from "@/components/LoadingSkeleton";
import ErrorBanner from "@/components/ErrorBanner";
import { useMusicGeneration } from "@/hooks/useMusicGeneration";
import { DEFAULT_FORM_STATE } from "@/lib/constants";
import type { GenerateFormState } from "@/types";

export default function App() {
  const [form, setForm] = useState<GenerateFormState>(DEFAULT_FORM_STATE);
  const { phase, result, errorMessage, progress, generate, cancel, reset } = useMusicGeneration();

  const handleSubmit = () => {
    void generate(form);
  };

  const handleRegenerate = () => {
    reset();
    void generate(form);
  };

  const showSkeleton = phase === "generating" && !result;
  const showResult = phase === "completed" && result;

  return (
    <div className="min-h-screen">
      <AuroraBackground />
      <Navbar />
      <main>
        <Hero />

        <section id="generator" className="mx-auto max-w-3xl px-4 pb-24 sm:px-6">
          <ErrorBanner message={phase === "error" ? errorMessage : null} onDismiss={reset} />

          <GeneratorForm
            form={form}
            onChange={setForm}
            onSubmit={handleSubmit}
            onCancel={cancel}
            phase={phase}
            progress={progress}
          />

          <div className="mt-6">
            {showSkeleton && <LoadingSkeleton />}
            {showResult && <ResultPlayer result={result} onRegenerate={handleRegenerate} />}
          </div>
        </section>

        <HowItWorks />
      </main>
      <Footer />
    </div>
  );
}
