import { getTranslations } from "next-intl/server";
import styles from "./Values.module.scss";

interface ValueItem {
  title: string;
  body: string;
}

function PrivacyIcon() {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
      <path
        d="M12 3l7 3v5.5c0 4.6-3 8.4-7 9.5-4-1.1-7-4.9-7-9.5V6l7-3z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M9 12l2 2 4-4.2"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CareIcon() {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
      <path
        d="M12 20.2s-7.5-4.4-9.3-9.2C1.7 7.9 3.5 5 6.6 5c1.8 0 3.3 1 4 2.4C11.4 6 12.9 5 14.7 5c3.1 0 4.9 2.9 3.9 6-1.8 4.8-9.3 9.2-9.3 9.2h.7z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ControlIcon() {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
      <path d="M4 6h10M17 6h3M4 18h3M10 18h10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M4 12h6M13 12h7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="14" cy="6" r="2.2" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="7" cy="18" r="2.2" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="10" cy="12" r="2.2" fill="none" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

const ICONS = [PrivacyIcon, CareIcon, ControlIcon];

export async function Values() {
  const t = await getTranslations("Landing.values");
  const items = t.raw("items") as ValueItem[];

  return (
    <section className={styles.section}>
      <h2 className={styles.title}>{t("title")}</h2>
      <ul className={styles.grid}>
        {items.map((item, index) => {
          const Icon = ICONS[index];
          return (
            <li key={item.title} className={styles.card}>
              <span className={styles.icon}>{Icon ? <Icon /> : null}</span>
              <h3 className={styles.cardTitle}>{item.title}</h3>
              <p className={styles.cardBody}>{item.body}</p>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
