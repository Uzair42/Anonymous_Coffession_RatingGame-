import { Providers } from "@/components/Providers";
import Navbar from "@/components/Navbar";
import { AliasProvider } from "@/components/AliasProvider";
import "./globals.css";

export const metadata = {
  title: "Campus Farewell Board",
  description: "Anonymous campus confession and farewell board.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased selection:bg-[#c0ff00]/30 selection:text-white">
        <Providers>
          <AliasProvider>
            <div className="pb-32 min-h-screen">
              {children}
            </div>
            <Navbar />
          </AliasProvider>
        </Providers>
      </body>
    </html>
  );
}
