import { Alignment, Borders, FillPattern } from 'exceljs';
import { Colors } from '../enums';

const timesheetSummaryHeaders = [
  'S.No',
  'Resource Name',
  'Project Name',
  'Number of Days',
  'Approver',
  'Activity',
  'Month',
];

const activitiesDeliverablesHeaders = ['Week', 'Activities'];

const alignment: Partial<Alignment> = {
  vertical: 'middle',
  horizontal: 'center',
  wrapText: true,
};

const cellStyle: FillPattern = {
  type: 'pattern',
  pattern: 'solid',
  fgColor: { argb: Colors.BLUE },
};

const headerFont = {
  name: 'Times New Roman',
  size: 8,
  bold: true,
  color: { argb: Colors.WHITE },
};

const bodyFont = {
  name: 'Times New Roman',
  size: 10,
};

const borderStyle: Partial<Borders> = {
  top: { style: 'thin' },
  left: { style: 'thin' },
  bottom: { style: 'thin' },
  right: { style: 'thin' },
};

export const excel = {
  timesheetSummaryHeaders,
  activitiesDeliverablesHeaders,
  alignment,
  cellStyle,
  headerFont,
  bodyFont,
  borderStyle,
};
