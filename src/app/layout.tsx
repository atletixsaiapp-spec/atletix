import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ATLETIX",
  description:
    "Panel responsive para cuentas y administracion del gimnasio ATLETIX.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="h-full antialiased">
      <body className="flex min-h-full flex-col bg-[#07070a] text-white">
        {children}
      </body>
    </html>
  );
}
