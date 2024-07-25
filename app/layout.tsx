import type { Metadata } from "next";
import { IBM_Plex_Sans} from "next/font/google";
import "./globals.css";
import { 
  ClerkProvider, 
  ClerkLoaded, 
  ClerkLoading } 
  from '@clerk/nextjs';
import { dark } from "@clerk/themes";
import Navbar from "@/components/Navbar";
import { cn } from "@/lib/utils";


const IBMPlex = IBM_Plex_Sans({ 
  subsets: ["latin"],
   weight: ['400', '500', '600', '700'], 
   variable: '--font-ibm-plex', 
  });
  
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
    // <ClerkProvider appearance={{baseTheme: dark}}>
    <ClerkProvider>
      <html lang="en">
        <body className={cn("font-IBMPlex antialiased", IBMPlex.variable)}>
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
