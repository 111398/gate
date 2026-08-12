import type { MetadataRoute } from "next";

// Обязателен для PWA/TWA-упаковки (Bubblewrap/PWABuilder) — см. ТЗ п.10.
// name/short_name — «Gate», как задано в ТЗ.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Gate",
    short_name: "Gate",
    description: "Приложение-компаньон для переживающих утрату близкого человека",
    start_url: "/",
    display: "standalone",
    orientation: "portrait-primary",
    background_color: "#ffffff",
    theme_color: "#2f80ed",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
    ],
  };
}
