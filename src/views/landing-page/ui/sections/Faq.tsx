import { getTranslations } from "next-intl/server";
import { Disclosure, type DisclosureItem } from "@/shared/ui/Disclosure";
import styles from "./Faq.module.scss";

interface FaqEntry {
  question: string;
  answer: string;
}

export async function Faq() {
  const t = await getTranslations("Landing.faq");
  const rawItems = t.raw("items") as FaqEntry[];
  const items: DisclosureItem[] = rawItems.map((item, index) => ({
    id: `faq-${index}`,
    question: item.question,
    answer: item.answer,
  }));

  return (
    <section id="faq" className={styles.section}>
      <h2 className={styles.title}>{t("title")}</h2>
      <div className={styles.card}>
        <Disclosure items={items} />
      </div>
    </section>
  );
}
