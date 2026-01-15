import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "HackIIIT | 2026",
  description: "Build anything that makes IIIT better.",
};

export default function HackathonLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // We wrap it in a div to ensure no global site styles bleed in
    // and to provide a high z-index if needed
    <section className="hackathon-root-wrapper">{children}</section>
  );
}
