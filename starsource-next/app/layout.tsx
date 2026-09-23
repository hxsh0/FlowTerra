import "./globals.css";
import type { Metadata } from "next";
import { VisualProvider } from "@/lib/visual";

export const metadata: Metadata = {
  title: "StarSource — The Autonomous Revenue OS",
  description:
    "StarSource runs your entire outbound motion with a fleet of autonomous agents — sourcing, researching, engaging, and closing in one continuous loop. Mission control for high-performing sales teams.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      data-style="signal"
      data-density="regular"
      data-motion="on"
      suppressHydrationWarning
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,400;0,500;0,600;0,700;1,500;1,600&family=Public+Sans:wght@400;500;600;700&family=Geist+Mono:wght@400;500;600&display=swap"
        />
      </head>
      <body>
        <VisualProvider>{children}</VisualProvider>
      </body>
    </html>
  );
}
