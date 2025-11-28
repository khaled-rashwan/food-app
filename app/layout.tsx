import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Gourmet Express - Premium Food Delivery",
  description: "Experience food in high definition. Premium restaurant delivery to your doorstep.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="font-sans antialiased bg-black text-white min-h-screen">
        {children}
      </body>
    </html>
  );
}
