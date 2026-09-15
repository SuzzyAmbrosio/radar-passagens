import type { Metadata } from "next"; import "./globals.css"; import { Navigation } from "@/components/navigation";
export const metadata: Metadata = { title: "Radar de Passagens", description: "Alertas de passagens aéreas" };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="pt-BR"><body className="min-h-screen font-sans"><Navigation />{children}</body></html>; }
