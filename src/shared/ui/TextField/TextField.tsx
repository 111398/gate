"use client";

import {
  TextField as AriaTextField,
  Label,
  Input,
  Text,
  type TextFieldProps as AriaTextFieldProps,
} from "react-aria-components";
import styles from "./TextField.module.scss";

export interface TextFieldProps extends Omit<AriaTextFieldProps, "children"> {
  label: string;
  description?: string;
  errorMessage?: string;
  inputType?: React.HTMLInputTypeAttribute;
}

export function TextField({
  label,
  description,
  errorMessage,
  inputType = "text",
  className,
  ...props
}: TextFieldProps) {
  return (
    <AriaTextField
      {...props}
      isInvalid={!!errorMessage}
      className={`${styles.field} ${typeof className === "string" ? className : ""}`}
    >
      <Label className={styles.label}>{label}</Label>
      <Input type={inputType} className={styles.input} />
      {description && !errorMessage && (
        <Text slot="description" className={styles.description}>
          {description}
        </Text>
      )}
      {errorMessage && (
        <Text slot="errorMessage" className={styles.errorMessage}>
          {errorMessage}
        </Text>
      )}
    </AriaTextField>
  );
}
