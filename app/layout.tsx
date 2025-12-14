import "./globals.css";
import Navbar from "./components/Navbar";

export const metadata = {
  title: "AI Learn Hub",
  description: "Learn AI concepts and real-world case studies",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        <main>{children}</main>
      </body>
    </html>
  );
}
