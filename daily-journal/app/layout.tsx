import type { Metadata } from "next";
import { PropsWithChildren } from "react";
import "./globals.css";
import NavBar from "./components/NavBar";
import { Providers } from "./lib/providers";

// This imports the Geist and Geist Mono fonts from Google Fonts
// You can important any fonts from https://fonts.google.com in this same manner
import { Geist, Geist_Mono } from "next/font/google";

// Create variables for Geist (--font-geist-sans) and Geist Mono (--font-geist-mono)
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Create metadata for all pages
// You can create a metadata variable on an individual page to override this metadata
// You can use Metadata to create social media cards/tags, keywords, and site icons for search engine optimization (SEO)
export const metadata: Metadata = {
  title: "Daily Journal App",
  description: "Keep your daily thoughts organized while working on the software project.",
};

/* 
  RootLayout is a React component that wraps all pages in the app folder
  Readonly ensures the children object can't be accidentally modified
  <html lang="en"> sets the language of the page to English
  <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}> adds our font variables so they can be used
  <Providers> wraps everything in a <SessionProvider> so we can use the useSession function everywhere
  <NavBar> is our NavBar component that is wrapped around the specific page content ({children})
*/
export default function RootLayout({children}: Readonly<PropsWithChildren>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Providers>
          <NavBar/>
          {children}
        </Providers>
      </body>
    </html>
  );
}
