"use client";

import { Checkbox as AriaCheckbox, type CheckboxProps as AriaCheckboxProps } from "react-aria-components";
import styles from "./Checkbox.module.scss";

export interface CheckboxProps extends AriaCheckboxProps {
  children: React.ReactNode;
}

export function Checkbox({ children, className, ...props }: CheckboxProps) {
  return (
    <AriaCheckbox
      {...props}
      className={`${styles.checkbox} ${typeof className === "string" ? className : ""}`}
    >
      {({ isSelected }) => (
        <>
          <span className={styles.box} data-selected={isSelected || undefined} aria-hidden="true">
            {isSelected && (
              <svg viewBox="0 0 12 10" width="12" height="10">
                <path
                  d="M1 5l3.2 3.2L11 1"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </span>
          <span className={styles.label}>{children}</span>
        </>
      )}
    </AriaCheckbox>
  );
}
