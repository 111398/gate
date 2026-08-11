import type { Metadata } from "next";
import { Providers } from "@/app/providers";
import "@/app/styles/globals.scss";

export const metadata: Metadata = {
  title: "Gate",
  description: "Приложение-компаньон для переживающих утрату близкого человека",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ru">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
