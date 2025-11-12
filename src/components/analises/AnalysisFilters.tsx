import BedTypeFilter from "../leitos/BedTypeFilter";
import YearMultiSelect from "./YearMultiSelectFilter";

const bedTypeOptions = [
  { value: "UTI_ADULTO", label: "UTI Adulto" },
  { value: "UTI_NEONATAL", label: "UTI Neonatal" },
  { value: "UTI_PEDIATRICO", label: "UTI Pediátrico" },
  { value: "UTI_QUEIMADO", label: "UTI Queimado" },
  { value: "UTI_CORONARIANA", label: "UTI Coronariana" },
];

type Props = {
  selectedYears: number[];
  selectedMonth: number | null;
  selectedBedType: string;
  onYearsChange: (years: number[]) => void;
  onMonthChange: (month: number | null) => void;
  onBedTypeChange: (type: string) => void;
};

export default function AnalysisFilters(props: Props) {
  return (
    <div className="card p-4">
      <h3 className="text-lg font-semibold text-slate-800 mb-4">Filtros da Análise</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-3">
          <BedTypeFilter 
            value={props.selectedBedType} 
            onChange={props.onBedTypeChange} 
            options={bedTypeOptions} 
          />
        </div>
        <div className="md:col-span-3">
          <YearMultiSelect 
            selectedYears={props.selectedYears} 
            onChange={props.onYearsChange} 
          />
        </div>
      </div>
    </div>
  );
}