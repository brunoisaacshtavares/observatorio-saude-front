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