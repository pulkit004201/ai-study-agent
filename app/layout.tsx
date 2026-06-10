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
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme-preference')||'dark';document.documentElement.setAttribute('data-theme',t);}catch(e){document.documentElement.setAttribute('data-theme','dark');}})();`,
          }}
        />
      </head>
      <body className={lexend.className} style={{ margin: 0 }}>
        <Navbar />
        {children}
      </body>
    </html>
  );
}
