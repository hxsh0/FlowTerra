"use client";
import { useEffect, useState } from "react";

const STEPS = [
  "Initialising",
  "Querying source",
  "Scoring against ICP",
  "Deduplicating results",
  "Complete",
];

interface Props {
  running: boolean;
  /** Flips true once the real discovery run has actually resolved. */
  done: boolean;
  onFinished: () => void;
}

export function AgentScrapeProgress({ running, done, onFinished }: Props) {
  const [step, setStep] = useState(0);

  // While the run is in flight, cycle through the in-progress steps so the
  // panel doesn't sit static during the (variable-length) real fetch.
  useEffect(() => {
    if (!running || done) return;
    setStep(0);
    let i = 0;
    const cap = STEPS.length - 2;
    const id = setInterval(() => {
      i = i >= cap ? 1 : i + 1;
      setStep(i);
    }, 700);
    return () => clearInterval(id);
  }, [running, done]);

  // Once the real result lands, jump to Complete and notify the caller.
  useEffect(() => {
    if (!running || !done) return;
    setStep(STEPS.length - 1);
    const id = setTimeout(onFinished, 400);
    return () => clearTimeout(id);
  }, [running, done, onFinished]);

  useEffect(() => {
    if (!running) setStep(0);
  }, [running]);

  if (!running) return null;

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
