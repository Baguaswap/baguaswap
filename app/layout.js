import { Space_Grotesk, Inter } from "next/font/google";
import "./globals.css";
import { WalletProvider } from "@/lib/WalletProvider";
import AppShell from "@/components/AppShell";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["500", "600", "700"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500", "600", "700"],
});

export const metadata = {
  title: "Bagua Swap — Trade, Launch, Burn, Grow",
  description: "Bagua Swap is a DEX & meme coin launchpad on Giwa Chain with a burn mechanism on every trade.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${inter.variable}`}>
      <body>
        <WalletProvider>
          <AppShell>{children}</AppShell>
        </WalletProvider>
      </body>
    </html>
  );
}
