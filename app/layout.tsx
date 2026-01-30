import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import {SessionProvider} from "next-auth/react";
import {auth} from "@/auth";
import {Analytics} from "@vercel/analytics/next";

export const metadata: Metadata = {
  title: {
    default: "Rizzlytics",
    template: "%s | Rizzlytics",
  },
  description: "Rizzlytics is an AI-powered dating analysis platform that helps you optimize dating profiles, photos, and conversations with clear, actionable feedback to increase matches and attraction.",
  keywords: [
    "dating ai",
    "dating profile analysis",
    "dating profile optimizer",
    "tinder profile review",
    "hinge profile analysis",
    "dating conversation analysis",
    "online dating ai",
    "dating photo analysis",
    "attraction optimization",
    "dating feedback tool",
  ],
  authors: [
    {
      name: "Sherard Dalaguit",
      url: "https://sherarddalaguit.com",
    },
  ],
  creator: "Sherard Dalaguit",
  publisher: "Rizzlytics",
  icons: {
    icon: "/logo.png",
  },
};

const poppins = Poppins({
  variable: "--font-poppins",
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  subsets: ["latin"],
});

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const session = await auth();
  return (
    <html lang="en" suppressHydrationWarning>
      <SessionProvider session={session}>
        <body className={`${poppins.className} antialiased`}>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <Analytics />
          </ThemeProvider>
        </body>
      </SessionProvider>
    </html>
  );
}
