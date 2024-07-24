import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { 
  ClerkProvider, 
  ClerkLoaded, 
  ClerkLoading } 
  from '@clerk/nextjs';
import { dark } from "@clerk/themes";
import Navbar from "@/components/Navbar";


const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ImagiGenie",
  description: "Create your own AI generated images",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider appearance={{baseTheme: dark}}>
      <html lang="en">
        <body className={inter.className}>
          <ClerkLoading>
            <div className="flex items-center justify-center h-screen text-2xl">LOADING...</div>
          </ClerkLoading>
          <ClerkLoaded>
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col h-screen">
                <Navbar />
              {children}
            </div>
          </div>
          </ClerkLoaded>
        </body>
      </html>
    </ClerkProvider>
  );
}
