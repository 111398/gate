import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Providers } from "@/app/providers";
import { DEFAULT_LOCALE } from "@/shared/config/i18n";
import "@/app/styles/globals.scss";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Metadata");
  return {
    title: t("title"),
    description: t("description"),
  };
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang={DEFAULT_LOCALE}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
