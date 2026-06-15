import { Providers } from "@/components/Providers";
import Navbar from "@/components/Navbar";
import { AliasProvider } from "@/components/AliasProvider";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";

export const metadata = {
  title: "IT Batch Farewell Board",
  description: "Anonymous IT Batch confession and farewell board.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* Noto Nastaliq Urdu — closest Google Font to Jameel Noori Nastaleeq */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Nastaliq+Urdu:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased selection:bg-[#c0ff00]/30 selection:text-white">
        <Providers>
          <AliasProvider>
            <div className="pb-32 min-h-screen">
              {children}
            </div>
            <Navbar />
            <Analytics />
          </AliasProvider>
        </Providers>
      </body>
    </html>
  );
}
