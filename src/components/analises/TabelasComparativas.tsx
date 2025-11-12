import { Download } from "lucide-react";
import { downloadCSV } from "../../utils/exporters";

type TableData = {
  headers: string[];
  rows: (string | number)[][];
};

type Props = {
  data: {
    indicatorsTable: TableData;
    regionTable: TableData;
  };
  selectedYears: number[];
};

function Tabela({ title, table }: { title: string; table: TableData }) {
  return (
    <div>
      <h4 className="text-base font-semibold text-slate-800 mb-2">{title}</h4>
      <div className="overflow-x-auto border border-slate-200 rounded-lg">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              {table.headers.map((header) => (
                <th
                  key={header}
                  className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {table.rows.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {row.map((cell, cellIndex) => (
                  <td
                    key={cellIndex}
                    className="px-4 py-3 whitespace-nowrap text-sm"
                  >
                    {cellIndex === 0 ? (
                      <span className="font-medium text-slate-800">
                        {cell}
                      </span>
                    ) : (
                      <span>{Number(cell).toLocaleString("pt-BR")}</span>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function TabelasComparativas({ data, selectedYears }: Props) {
  
  const handleExportCSV = () => {
    const { indicatorsTable, regionTable } = data;
    console.log(selectedYears)
    console.log(selectedYears.join("-"))
    const filename = `comparativo_tabelas_${selectedYears.join("-")}.csv`;

    const allRows = [
      ["Relatório de Indicadores"],
      indicatorsTable.headers,
      ...indicatorsTable.rows,
      [],
      ["Relatório por Região (Leitos Totais)"],
      regionTable.headers,
      ...regionTable.rows,
    ];

    downloadCSV(indicatorsTable.headers, allRows, filename);
  };

  return (
    <div className="card p-4 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-800">
          Dados Tabulados para Exportação
        </h3>
        <button
          type="button"
          onClick={handleExportCSV}
          className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700"
        >
          <Download size={16} />
          Exportar Tabelas (CSV)
        </button>
      </div>

      <Tabela
        title="Dados de Indicadores Gerais"
        table={data.indicatorsTable}
      />
      <Tabela
        title="Dados Regionais (Leitos Totais)"
        table={data.regionTable}
      />
    </div>
  );
}