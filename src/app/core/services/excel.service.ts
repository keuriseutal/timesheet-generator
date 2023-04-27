import { Injectable } from '@angular/core';
import { getOrdinalMonth, getWeeksInAMonth, numberToColumn } from '../utils';
import { Workbook, Worksheet } from 'exceljs';
import { saveAs } from 'file-saver';
import { excel } from '../constants';
import { Colors, DateType } from '../enums';

@Injectable({
  providedIn: 'root',
})
export class ExcelService {
  constructor() {}

  private generateSubHeaders(weeks: Array<Date[]>) {
    const headers = [...excel.timesheetSummaryHeaders];
    const subHeaders: string[] = new Array(headers.length).fill('');
    weeks.forEach((week: Date[], index: number) => {
      week.forEach((day: Date) => {
        headers.push(day.getDate().toString());
        subHeaders.push('');
      });
      headers.push(`Week #${index + 1}`);
      subHeaders.push('Total');
      if (index === weeks.length - 1) {
        headers.push('Total');
        subHeaders.push('');
      }
    });
    return [headers, subHeaders];
  }

  private formatHeaders(
    headers: string[],
    subHeaders: string[],
    timesheetSummary: Worksheet
  ) {
    subHeaders.forEach((subHeader: string, index: number) => {
      const topCell = `${numberToColumn(index + 1)}${1}`;
      const bottomCell = `${numberToColumn(index + 1)}${2}`;
      timesheetSummary.getCell(topCell).alignment = excel.alignment;
      timesheetSummary.getCell(topCell).fill = excel.cellStyle;
      timesheetSummary.getCell(topCell).font = excel.headerFont;
      timesheetSummary.getCell(topCell).border = excel.borderStyle;
      if (!subHeader.length) {
        timesheetSummary.mergeCells(`${topCell}:${bottomCell}`);
        if (headers[index] === 'Total') {
          timesheetSummary.getCell(topCell).fill = {
            ...excel.cellStyle,
            fgColor: { argb: Colors.YELLOW },
          };
        }
      } else {
        timesheetSummary.getCell(bottomCell).alignment = excel.alignment;
        timesheetSummary.getCell(bottomCell).fill = excel.cellStyle;
        timesheetSummary.getCell(bottomCell).font = excel.headerFont;
        timesheetSummary.getCell(bottomCell).border = excel.borderStyle;
      }
    });
  }

  private generateCalendarDetails(formJSON: any) {
    const {
      name,
      project,
      approver,
      activity,
      fullDays,
      fullLeaves,
      halfLeaves,
      holidays,
      longMonth,
      weeks,
      dateRange,
    } = formJSON;
    const noOfDaysStr = `${dateRange[1].getDate()} Days`;

    let calendarDetails: string[] = [
      '1',
      name,
      project,
      noOfDaysStr,
      approver,
      activity,
      longMonth,
    ];

    let totalHoursPerWeek: number = 0;
    let totalHours: number = 0;
    weeks.forEach((week: Date[], index: number) => {
      totalHoursPerWeek = 0;
      week.forEach((date: Date) => {
        if (date.getDay() === 0) {
          calendarDetails.push(DateType.SUN);
        } else if (date.getDay() === 6) {
          calendarDetails.push(DateType.SAT);
        } else {
          if (fullDays.includes(date.getDate())) {
            totalHoursPerWeek = totalHoursPerWeek + 8;
            calendarDetails.push('8');
          } else if (fullLeaves.includes(date.getDate())) {
            calendarDetails.push(DateType.LEAVE);
          } else if (halfLeaves.includes(date.getDate())) {
            totalHoursPerWeek = totalHoursPerWeek + 4;
            calendarDetails.push('4');
          } else if (holidays.includes(date.getDate())) {
            calendarDetails.push(DateType.HOLIDAY);
          }
        }
        if (date.getDay() === 5) {
          calendarDetails.push(totalHoursPerWeek.toString());
          totalHours = totalHours + totalHoursPerWeek;
        }
      });
      if (index === weeks.length - 1) {
        calendarDetails.push(totalHoursPerWeek.toString());
        totalHours = totalHours + totalHoursPerWeek;
      }
    });

    calendarDetails.push(`${totalHours.toString()} hours`);

    return calendarDetails;
  }

  private formatCalendarDetails(
    calendarDetails: string[],
    timesheetSummary: Worksheet
  ) {
    calendarDetails.forEach((details: string, index: number) => {
      const topCell = `${numberToColumn(index + 1)}${3}`;
      const bottomCell = `${numberToColumn(index + 1)}${4}`;
      timesheetSummary.getCell(topCell).alignment = excel.alignment;
      timesheetSummary.getCell(topCell).font = excel.bodyFont;
      timesheetSummary.getCell(topCell).border = excel.borderStyle;
      if (index !== 3) {
        timesheetSummary.mergeCells(`${topCell}:${bottomCell}`);
        if (
          [DateType.SAT.toString(), DateType.SUN.toString()].includes(details)
        ) {
          timesheetSummary.getCell(topCell).fill = {
            ...excel.cellStyle,
            fgColor: { argb: Colors.CORAL },
          };
          timesheetSummary.getCell(topCell).font = {
            ...excel.bodyFont,
            color: { argb: Colors.WHITE },
          };
        } else if (
          [DateType.LEAVE.toString(), DateType.HOLIDAY.toString()].includes(
            details
          ) ||
          index === calendarDetails.length - 1
        ) {
          timesheetSummary.getCell(topCell).fill = {
            ...excel.cellStyle,
            fgColor: { argb: Colors.YELLOW },
          };
        }

        if (index === calendarDetails.length - 1) {
          timesheetSummary.getCell(topCell).font = {
            ...excel.bodyFont,
            color: { argb: Colors.WHITE },
          };
        }
      } else {
        timesheetSummary.getCell(bottomCell).alignment = {
          ...excel.alignment,
          horizontal: 'left',
        };
        timesheetSummary.getCell(bottomCell).font = excel.headerFont;
        timesheetSummary.getCell(bottomCell).border = excel.borderStyle;
      }
    });

    timesheetSummary.getCell('D4').font = excel.bodyFont;
    timesheetSummary.getCell('D4').border = excel.borderStyle;
  }

  private createTimesheetSummary(workbook: Workbook, formJSON: any) {
    const { date, dateRange, shortMonth, weeks } = formJSON;

    const longMonth: string = date.toLocaleString('default', {
      month: 'long',
    });
    const year: number = date.getFullYear();

    const dateRangeStr = `[${getOrdinalMonth(
      date
    )} ${longMonth}, ${year} - ${getOrdinalMonth(
      dateRange[1]
    )} ${longMonth}, ${year}]`;
    const [headers, subHeaders]: Array<string[]> =
      this.generateSubHeaders(weeks);

    const timesheetSummary = workbook.addWorksheet(
      `Timesheet-Summary-${shortMonth}${year}`
    );

    timesheetSummary.addRow(headers);
    timesheetSummary.addRow(subHeaders);

    this.formatHeaders(headers, subHeaders, timesheetSummary);

    const calendarDetails: string[] = this.generateCalendarDetails({
      ...formJSON,
      longMonth,
      weeks,
    });

    const dateRangeDetails = new Array(calendarDetails.length).fill('');
    dateRangeDetails[3] = dateRangeStr;

    timesheetSummary.addRow(calendarDetails);
    timesheetSummary.addRow(dateRangeDetails);

    this.formatCalendarDetails(calendarDetails, timesheetSummary);

    timesheetSummary.getColumn(3).width = 10;
    timesheetSummary.getColumn(6).width = 12;
    timesheetSummary.getRow(4).height = 120;
  }

  private createActivitiesDeliverables(workbook: Workbook, formJSON: any) {
    const { shortMonth, year, activities } = formJSON;

    const activitiesDeliverables = workbook.addWorksheet(
      `Activities-Deliverables-${shortMonth}${year}`
    );

    activitiesDeliverables.addRow(['', ...excel.activitiesDeliverablesHeaders]);

    excel.activitiesDeliverablesHeaders.forEach(
      (header: string, index: number) => {
        const cell = `${numberToColumn(index + 2)}${1}`;
        activitiesDeliverables.getCell(cell).fill = excel.cellStyle;
        activitiesDeliverables.getCell(cell).font = {
          color: { argb: Colors.WHITE },
        };
      }
    );

    activities.forEach((activity: string, index: number) => {
      activitiesDeliverables.addRow(['', `Week${index + 1}`, activity]);
      const leftCell = `B${index + 2}`;
      const rightCell = `C${index + 2}`;
      activitiesDeliverables.getCell(leftCell).font = {
        color: { argb: Colors.BLUE },
      };
      activitiesDeliverables.getCell(leftCell).alignment = {
        wrapText: true,
      };
      activitiesDeliverables.getCell(rightCell).font = {
        color: { argb: Colors.BLUE },
      };
      activitiesDeliverables.getCell(rightCell).alignment = {
        wrapText: true,
      };
    });

    activitiesDeliverables.getColumn(2).width = 15;
    activitiesDeliverables.getColumn(3).width = 90;
  }

  generateExcel(formJSON: any) {
    const { name, date, dateRange } = formJSON;
    const shortMonth: string = date.toLocaleString('default', {
      month: 'short',
    });
    const year: number = date.getFullYear();

    const weeks = getWeeksInAMonth(
      dateRange[0].getMonth() + 1,
      dateRange[0].getFullYear()
    );

    const workbook = new Workbook();

    this.createTimesheetSummary(workbook, { ...formJSON, shortMonth, weeks });
    this.createActivitiesDeliverables(workbook, {
      ...formJSON,
      shortMonth,
      year,
    });

    const fileName: string = `${name}_Monthly_Timesheet_${shortMonth}_${year}.xlsx`;
    workbook.xlsx.writeBuffer().then((data) => {
      const blob = new Blob([data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      saveAs(blob, fileName);
    });
  }
}
