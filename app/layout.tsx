import "./globals.css";
import Navbar from "./components/Navbar";

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
        style={{
          margin: 0,
          backgroundColor: "#000",
          color: "#fff",
          fontFamily: "Inter, sans-serif",
        }}
      >
        {/* ✅ NAVBAR IS NOW MOUNTED */}
        <Navbar />

        {children}
      </body>
    </html>
  );
}
