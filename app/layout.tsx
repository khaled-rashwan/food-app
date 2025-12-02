import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./app.css";
import { configureAmplifyClient } from "@/lib/amplify/client-config";

// Configure Amplify for client-side usage
configureAmplifyClient();

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  style: ["normal", "italic"],
  weight: ["400", "600", "700"],
});

export const metadata: Metadata = {
  title: "Gourmet Kuwait | Premium Catering & Delivery",
  description: "Premium catering and swift delivery across Kuwait. Taste the tradition, reimagined.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${playfair.variable} font-sans`}>{children}</body>
    </html>
  );
}
