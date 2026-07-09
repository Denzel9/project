export const escapeCsvCell = (value: string) => `"${value.replace(/"/g, '""')}"`;

export const downloadCsv = (
  filename: string,
  headers: string[],
  rows: string[][],
) => {
  const content = [headers, ...rows]
    .map(row => row.map(cell => escapeCsvCell(cell)).join(';'))
    .join('\n');

  const blob = new Blob([`\uFEFF${content}`], {
    type: 'text/csv;charset=utf-8',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};
