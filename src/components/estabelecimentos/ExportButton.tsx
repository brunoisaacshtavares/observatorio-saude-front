import { useState } from "react";
import { Download, Loader2 } from "lucide-react";

type ExportOptions = {
  isLoading?: boolean;
  onExportCSV: () => void;
  onExportExcel: () => void;
  onExportRankingPNG: () => void;
  onExportScatterPNG: () => void;
};

export default function ExportButton({ isLoading = false, onExportCSV, onExportExcel, onExportRankingPNG, onExportScatterPNG }: ExportOptions) {
  const [isOpen, setIsOpen] = useState(false);

  const handleOptionClick = (exportFn: () => void) => {
    exportFn();
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block text-left">
      <button
        type="button"
        disabled={isLoading}
        className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 transition text-sm disabled:opacity-60 disabled:cursor-not-allowed"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isLoading ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" /> 
            Gerando...
          </>
        ) : (
          <>
            <Download className="h-5 w-5 text-slate-400" aria-hidden="true" />
            Exportar
          </>
        )}
      </button>

      {isOpen && !isLoading && (
        <div
          className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
          role="menu"
          aria-orientation="vertical"
        >
          <div className="py-1" role="none">
            <p className="px-4 py-2 text-xs font-semibold text-slate-500">Dados da Tabela</p>
            <a href="#" onClick={(e) => { e.preventDefault(); handleOptionClick(onExportCSV); }} className="text-slate-700 block px-4 py-2 text-sm hover:bg-slate-100" role="menuitem">
              Exportar para CSV
            </a>
            <a href="#" onClick={(e) => { e.preventDefault(); handleOptionClick(onExportExcel); }} className="text-slate-700 block px-4 py-2 text-sm hover:bg-slate-100" role="menuitem">
              Exportar para Excel (XLSX)
            </a>
            <div className="my-1 border-t border-slate-100" />
            <p className="px-4 py-2 text-xs font-semibold text-slate-500">Gráficos</p>
            <a href="#" onClick={(e) => { e.preventDefault(); handleOptionClick(onExportRankingPNG); }} className="text-slate-700 block px-4 py-2 text-sm hover:bg-slate-100" role="menuitem">
              Salvar Ranking como PNG
            </a>
            <a href="#" onClick={(e) => { e.preventDefault(); handleOptionClick(onExportScatterPNG); }} className="text-slate-700 block px-4 py-2 text-sm hover:bg-slate-100" role="menuitem">
              Salvar Dispersão como PNG
            </a>
          </div>
        </div>
      )}
    </div>
  );
}