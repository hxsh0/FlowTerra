import { Starfield } from "@/components/Starfield";

export function Backdrop() {
  return (
    <>
      <div className="bg-glow" aria-hidden="true" />
      <Starfield />
    </>
  );
}
