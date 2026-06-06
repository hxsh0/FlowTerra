"use client";
import { useEffect, useState } from "react";

const STEPS = [
  "Initialising",
  "Querying Google Places",
  "Scraping fallback sources",
  "Scoring against ICP",
  "Deduplicating results",
  "Complete",
];

interface Props {
  running: boolean;
  onComplete: () => void;
}

export function AgentScrapeProgress({ running, onComplete }: Props) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!running) {
      setStep(0);
      return;
    }
    let i = 0;
    setStep(0);
    const id = setInterval(() => {
      i += 1;
      if (i >= STEPS.length - 1) {
        setStep(STEPS.length - 1);
        clearInterval(id);
        setTimeout(onComplete, 400);
        return;
      }
      setStep(i);
    }, 700);
    return () => clearInterval(id);
  }, [running, onComplete]);

  if (!running && step === 0) return null;

  return (
    <div className="scrape-progress">
      <div className="scrape-progress-label">Discovery run</div>
      <ol className="scrape-steps">
        {STEPS.map((label, idx) => (
          <li
            key={label}
            className={
              idx < step ? "done" : idx === step ? "active" : ""
            }
          >
            {label}
          </li>
        ))}
      </ol>
    </div>
  );
}
