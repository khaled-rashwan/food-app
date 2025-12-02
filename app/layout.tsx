import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./app.css";
import { configureAmplifyClient } from "@/lib/amplify/client-config";

// Configure Amplify for client-side usage
configureAmplifyClient();

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Kuwait Food Delivery & Catering",
  description: "Fresh meals and catering packages delivered to your door",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
