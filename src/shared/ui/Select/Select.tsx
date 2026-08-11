"use client";

import {
  Select as AriaSelect,
  SelectValue,
  Label,
  Popover,
  ListBox,
  ListBoxItem,
  Button as AriaButton,
  type Key,
} from "react-aria-components";
import styles from "./Select.module.scss";

export interface SelectOption {
  id: string;
  label: string;
}

export interface SelectProps {
  label: string;
  options: SelectOption[];
  selectedKey: string;
  onSelectionChange: (key: string) => void;
}

export function Select({ label, options, selectedKey, onSelectionChange }: SelectProps) {
  return (
    <AriaSelect
      selectedKey={selectedKey}
      onSelectionChange={(key: Key | null) => key !== null && onSelectionChange(String(key))}
      className={styles.select}
    >
      <Label className={styles.label}>{label}</Label>
      <AriaButton className={styles.trigger}>
        <SelectValue />
        <span aria-hidden="true">▾</span>
      </AriaButton>
      <Popover className={styles.popover}>
        <ListBox className={styles.listbox}>
          {options.map((option) => (
            <ListBoxItem key={option.id} id={option.id} className={styles.item}>
              {option.label}
            </ListBoxItem>
          ))}
        </ListBox>
      </Popover>
    </AriaSelect>
  );
}
