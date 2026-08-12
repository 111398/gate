import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { getLocale, getTranslations } from "next-intl/server";
import { Providers } from "@/app/providers";
import { THEME_STORAGE_KEY } from "@/shared/config/theme";
import styles from "./layout.module.scss";
import "@/app/styles/globals.scss";

// Синхронно, до гидрации — иначе при выборе тёмной темы будет видна вспышка
// светлой палитры до того, как React успеет применить data-theme.
const THEME_INIT_SCRIPT = `try{var t=localStorage.getItem(${JSON.stringify(THEME_STORAGE_KEY)});if(t==="dark"){document.documentElement.setAttribute("data-theme","dark");}}catch(e){}`;

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
    <html lang={locale} suppressHydrationWarning>
      <body>
        <Script id="theme-init" strategy="beforeInteractive">
          {THEME_INIT_SCRIPT}
        </Script>
        <Providers>{children}</Providers>
        <div className={styles.rotateOverlay}>
          <p>{t("rotatePrompt")}</p>
        </div>
      </body>
    </html>
  );
}
