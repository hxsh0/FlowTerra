"use client";
import { useState } from "react";

const FAQS = [
  {
    q: "How is this different from other done-for-you outreach?",
    a: "Most services reach out to anyone matching a category and location. We only reach out when a real signal indicates a business's needs are shifting right now — fewer contacts, and each one lands with a reason attached.",
  },
  {
    q: "What signals do you actually watch?",
    a: "Public evidence that a business's needs are changing — the kind of thing a sharp researcher would notice before reaching out, matched against the specific problem you solve.",
  },
  {
    q: "Is the outreach compliant?",
    a: "Every message is checked against the consent rules of the market it's sent into before anything goes out, and every email includes a real, working opt-out.",
  },
  {
    q: "What do I have to do?",
    a: "Tell us who you serve and what you offer. We handle sourcing, outreach, and qualification — meetings land on your calendar.",
  },
  {
    q: "What's the free market scan?",
    a: "A one-time look at the signals currently active in your target market, before you commit to anything — so you can see whether there's real demand before spending a dollar.",
  },
];

export function FaqSection() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="section" id="faq">
      <div className="wrap-narrow">
        <h2 className="h2">
          Questions, <em className="accent-em">answered</em>.
        </h2>
        <div className="faq-list">
          {FAQS.map((f, i) => (
            <div className={`faq-item ${open === i ? "open" : ""}`} key={f.q}>
              <button
                type="button"
                className="faq-q"
                onClick={() => setOpen(open === i ? null : i)}
                aria-expanded={open === i}
              >
                {f.q}
                <span className="faq-icon">{open === i ? "−" : "+"}</span>
              </button>
              <div className="faq-a">
                <div className="faq-a-inner">
                  <p>{f.a}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
