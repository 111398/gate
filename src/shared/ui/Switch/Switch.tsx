"use client";

import { Switch as AriaSwitch, type SwitchProps as AriaSwitchProps } from "react-aria-components";
import styles from "./Switch.module.scss";

export type SwitchProps = AriaSwitchProps;

export function Switch({ className, ...props }: SwitchProps) {
  return (
    <AriaSwitch
      {...props}
      className={`${styles.switch} ${typeof className === "string" ? className : ""}`}
    >
      <span className={styles.track}>
        <span className={styles.thumb} />
      </span>
    </AriaSwitch>
  );
}
