import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "IronVision",
  description: "Home Gym Tracker — seguimiento de entrenamiento con visión IA",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
