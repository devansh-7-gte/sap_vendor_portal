import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ShellProvider } from "@/lib/shell-context";
import { PortalProvider } from "@/lib/portal-context";
import PortalLayout from "@/components/portal/PortalLayout";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "SAP Vendor Portal | Integrated Digital Supply Chain",
  description: "End-to-end supplier onboarding, RFQ management, purchase orders, ASN, GRN, MIRO posting, and payment tracking integrated with SAP ERP.",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-base text-text-primary">
        <a href="#main-content" className="skip-link">Skip to main content</a>
        <ShellProvider>
          <PortalProvider>
            <PortalLayout>
              {children}
            </PortalLayout>
          </PortalProvider>
        </ShellProvider>
      </body>
    </html>
  );
}
