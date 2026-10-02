import { Newsreader, Outfit } from "next/font/google";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ChromeGate from "@/components/ChromeGate";
import FloatingActions from "@/components/FloatingActions";
import { SITE } from "@/lib/site";
import "./globals.css";

const newsreader = Newsreader({
  subsets: ["latin"],
  weight: ["300", "400"],
  variable: "--font-newsreader",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-outfit",
  display: "swap",
});

export const metadata = {
  title: {
    default: `${SITE.title} | Premium homes across India`,
    template: `%s | ${SITE.title}`,
  },
  description: SITE.description,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${newsreader.variable} ${outfit.variable}`}>
      <body className="flex min-h-screen flex-col">
        <ChromeGate>
          <Header />
        </ChromeGate>
        <main className="flex-1">{children}</main>
        <ChromeGate>
          <Footer />
          <FloatingActions />
        </ChromeGate>
      </body>
    </html>
  );
}
