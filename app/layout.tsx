import type { Metadata, Viewport } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { Providers } from "@/app/providers";
import styles from "./layout.module.scss";
import "@/app/styles/globals.scss";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Metadata");
  return {
    title: t("title"),
    description: t("description"),
  };
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#2f80ed" },
    { media: "(prefers-color-scheme: dark)", color: "#5b9bf7" },
  ],
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const locale = await getLocale();
  const t = await getTranslations("Layout");

  return (
    <html lang={locale}>
      <body>
        <Providers>{children}</Providers>
        <div className={styles.rotateOverlay}>
          <p>{t("rotatePrompt")}</p>
        </div>
      </body>
    </html>
  );
}
