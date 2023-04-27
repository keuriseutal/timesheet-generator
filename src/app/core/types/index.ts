import { Theme } from '../enums';

export type ThemeOptions = {
  label: string;
  icon: string;
  value: Theme;
};

export type DisabledDates = {
  holidays: Date[];
  fullLeaves: Date[];
  halfLeaves: Date[];
};
