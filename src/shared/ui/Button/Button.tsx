"use client";

import { Button as AriaButton, type ButtonProps as AriaButtonProps } from "react-aria-components";
import styles from "./Button.module.scss";

export interface ButtonProps extends AriaButtonProps {
  variant?: "primary" | "secondary" | "danger";
}

export function Button({ variant = "primary", className, ...props }: ButtonProps) {
  return (
    <AriaButton
      {...props}
      className={`${styles.button} ${styles[variant]} ${typeof className === "string" ? className : ""}`}
    />
  );
}
