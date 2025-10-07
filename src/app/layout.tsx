import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import Providers from "./Providers";
import AppToastContainer from "./components/ToastContainer";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});


export const metadata: Metadata = {
  title: "Unity",
  description: "Unity - Your decentralized marketplace platform",
  icons: {
    icon: [
      { url: "/logo.png?v=1", type: "image/png" },
    ],
    shortcut: "/logo.png?v=1",
    apple: "/logo.png?v=1",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/logo.png?v=1" type="image/png" />
        <link rel="shortcut icon" href="/logo.png?v=1" type="image/png" />
        <link rel="apple-touch-icon" href="/logo.png?v=1" />
      </head>
      <body className={geistSans.variable}>
        <Providers>
          <AppToastContainer />
          <div className="flex flex-col h-screen bg-gray-50">
            <Header />
            <div className="flex flex-1 min-h-0">
              <Sidebar />
              <main className="flex-1 overflow-y-auto bg-gray-50">{children}</main>
            </div>
          </div>
        </Providers>
      </body>
    </html>
  );
}
