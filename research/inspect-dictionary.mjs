import { FileBlob, SpreadsheetFile } from '@oai/artifact-tool';

const input = await FileBlob.load('research/dict_revised_2015_20260625.xlsx');
const workbook = await SpreadsheetFile.importXlsx(input);

const summary = await workbook.inspect({
  kind: 'workbook,sheet,table',
  maxChars: 8000,
  tableMaxRows: 8,
  tableMaxCols: 14,
  tableMaxCellChars: 120,
});

console.log(summary.ndjson);
