"use client";

import {
  Button,
  Disclosure as AriaDisclosure,
  DisclosureGroup,
  DisclosurePanel,
  Heading,
} from "react-aria-components";
import styles from "./Disclosure.module.scss";

export interface DisclosureItem {
  id: string;
  question: string;
  answer: string;
}

export interface DisclosureProps {
  items: DisclosureItem[];
  className?: string;
}

export function Disclosure({ items, className }: DisclosureProps) {
  return (
    <DisclosureGroup className={`${styles.group} ${className ?? ""}`}>
      {items.map((item) => (
        <AriaDisclosure key={item.id} id={item.id} className={styles.item}>
          <Heading className={styles.heading}>
            <Button slot="trigger" className={styles.trigger}>
              <span className={styles.question}>{item.question}</span>
              <svg
                className={styles.chevron}
                viewBox="0 0 12 8"
                width="12"
                height="8"
                aria-hidden="true"
              >
                <path
                  d="M1 1.5l5 5 5-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Button>
          </Heading>
          <DisclosurePanel className={styles.panel}>
            <p className={styles.answer}>{item.answer}</p>
          </DisclosurePanel>
        </AriaDisclosure>
      ))}
    </DisclosureGroup>
  );
}
