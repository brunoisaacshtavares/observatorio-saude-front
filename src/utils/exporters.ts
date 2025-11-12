import * as ExcelJS from 'exceljs'; 
import Papa from 'papaparse';

export async function convertCsvToXlsxBuffer(csvText: string): Promise<ArrayBuffer> {
  const parsedResult = Papa.parse(csvText, { skipEmptyLines: true });

  if (parsedResult.errors.length) {
    console.error("Erros de parsing no CSV:", parsedResult.errors);
    throw new Error("O arquivo CSV recebido parece estar corrompido ou em um formato inválido.");
  }
  
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Dados');
  const data = parsedResult.data as string[][];

  const CHUNK_SIZE = 1000;
  for (let i = 0; i < data.length; i += CHUNK_SIZE) {
    const chunk = data.slice(i, i + CHUNK_SIZE);
    worksheet.addRows(chunk);
    await new Promise(resolve => setTimeout(resolve, 0));
  }

  const buffer = await workbook.xlsx.writeBuffer();
  return buffer;
}


export function downloadCSV(headers: string[], data: (string | number)[][], filename: string) {
  const escapeCell = (cell: string | number) => {
    const strCell = String(cell);
    if (strCell.includes(",") || strCell.includes("\"") || strCell.includes("\n")) {
      return `"${strCell.replace(/"/g, '""')}"`;
    }
    return strCell;
  };

  const headerRow = headers.map(escapeCell).join(",");

  const dataRows = data.map(row => 
    row.map(escapeCell).join(",")
  );

  const csvContent = [headerRow, ...dataRows].join("\n");

  const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });

  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}