import { DateType } from '../enums';

export const getDateRange = (date: Date) => {
  return date
    ? [date, new Date(date.getFullYear(), date.getMonth() + 1, 0)]
    : [];
};

export const getWeeksInAMonth = (
  month: number,
  year: number,
  startWith = DateType.SAT
) => {
  const firstDayOfMonth = new Date(year, month - 1, 1).getDay();
  const daysInMonth = new Date(year, month, 0).getDate();
  const daysInFirstWeek = 7 - firstDayOfMonth;
  const daysLeftAfterFirstWeek = daysInMonth - daysInFirstWeek;
  const numWeeks = Math.ceil(daysLeftAfterFirstWeek / 7) + 1;

  let weeks = [];
  let currentDay = 1;
  for (let i = 0; i < numWeeks; i++) {
    const week = [];
    if (i === 0) {
      for (let j = 0; j < daysInFirstWeek; j++) {
        week.push(new Date(year, month - 1, currentDay++));
      }
    } else if (i === numWeeks - 1) {
      for (let j = 0; j < daysLeftAfterFirstWeek % 7; j++) {
        week.push(new Date(year, month - 1, currentDay++));
      }
    } else {
      for (let j = 0; j < 7; j++) {
        week.push(new Date(year, month - 1, currentDay++));
      }
    }
    weeks.push(week);
  }

  if (startWith === DateType.SUN) {
    return weeks;
  }

  const flatWeeks = weeks.flat();
  let newWeeks = [];
  let newWeek = [];
  for (let i = 0; i < flatWeeks.length; i++) {
    const currentDay = flatWeeks[i].getDay();
    if (i > 0 && currentDay === 6) {
      if (!newWeeks.length) {
        newWeeks.push(newWeek);
      }
      newWeek = [];
    }
    newWeek.push(flatWeeks[i]);

    if (currentDay === 6) {
      newWeeks.push(newWeek);
    }
  }
  return newWeeks;
};

export const getOrdinalMonth = (date: Date) => {
  const day = date.getDate();
  const suffixes = ['th', 'st', 'nd', 'rd'];
  const ones = day % 10;
  const tens = Math.floor(day / 10) % 10;
  const suffixIndex =
    ones === 1 && tens !== 1
      ? 1
      : ones === 2 && tens !== 1
      ? 2
      : ones === 3 && tens !== 1
      ? 3
      : 0;
  return `${day}${suffixes[suffixIndex]}`;
};

export const numberToColumn = (number: number) => {
  let column = '';
  while (number > 0) {
    let modulo = (number - 1) % 26;
    column = String.fromCharCode(65 + modulo) + column;
    number = Math.floor((number - modulo) / 26);
  }
  return column;
};
