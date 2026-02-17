import "./globals.css";
import Navbar from "./components/Navbar";
import { Lexend } from "next/font/google";

const lexend = Lexend({
  subsets: ["latin"],
  variable: "--font-lexend",
});

export const metadata = {
  title: "AI Learn Hub",
  description: "Learn AI step by step",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={lexend.className}
        style={{
          margin: 0,
          backgroundColor: "#000",
          color: "#fff",
        }}
      >
        {/* ✅ NAVBAR IS NOW MOUNTED */}
        <Navbar />

        {children}
      </body>
    </html>
  );
}
