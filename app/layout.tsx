import type { Metadata } from "next";
import "./globals.css";
import HelpPanel from "@/modules/HelpPanel";
import MusicProvider from "@/modules/MusicProvider";

export const metadata: Metadata = {
  title: "H.E.L.P.",
  description: "H.E.L.P.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className="h-full antialiased">
      <body className="relative flex h-full flex-col overflow-hidden bg-[#2a2440]">
        <MusicProvider>
          <HelpPanel>{children}</HelpPanel>
        </MusicProvider>
      </body>
    </html>
  );
}
