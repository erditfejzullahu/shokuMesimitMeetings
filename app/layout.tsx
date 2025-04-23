import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import { ConnectionProvider } from "@/context/ConnectionContext";
import GlobalProvider from "@/context/GlobalProvider";

const montserrat = Montserrat({
  variable: "--font-montserrat-sans",
  subsets: ["latin"]
})


export const metadata: Metadata = {
  title: "ShokuMesimit - Mbledhja Online",
  description: "Mbledhje ne mes te studenteve dhe instruktorit.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${montserrat.className} antialiased`}
      >
        <GlobalProvider>
        <ConnectionProvider>
          {children}
        </ConnectionProvider>
        </GlobalProvider>
      </body>
    </html>
  );
}
