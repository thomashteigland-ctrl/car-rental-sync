import type { ReactNode } from "react";

export const metadata = {
  title: "Car rental sync",
  description: "Fixie-backed B2B sync worker",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
