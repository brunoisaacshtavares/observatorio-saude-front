import { useMemo } from "react";
import type { MultiValue } from "react-select";
import Select from "react-select";

type YearMultiSelectProps = {
  selectedYears: number[];
  onChange: (years: number[]) => void;
  minYear?: number;
  maxYears?: number;
};

type YearOption = {
  value: number;
  label: string;
};

export default function YearMultiSelect({
  selectedYears,
  onChange,
  minYear = 2007,
  maxYears = 3,
}: YearMultiSelectProps) {
  const yearOptions: YearOption[] = useMemo(() => {
    const current = new Date().getFullYear();
    const options = [];
    for (let y = current; y >= minYear; y--) {
      options.push({ value: y, label: String(y) });
    }
    return options;
  }, [minYear]);

  const selectedValue = yearOptions.filter((option) =>
    selectedYears.includes(option.value)
  );

  const handleChange = (selectedOptions: MultiValue<YearOption>) => {
    if (selectedOptions.length <= maxYears) {
      const newYears = selectedOptions.map((option) => option.value);
      onChange(newYears.sort((a, b) => a - b));
    }
  };

  const isOptionDisabled = (option: YearOption) => {
    return (
      selectedYears.length >= maxYears && !selectedYears.includes(option.value)
    );
  };

  return (
    <div className="space-y-2">
      <label
        htmlFor="year-multi-select"
        className="text-sm font-medium text-slate-700"
      >
        Anos para Comparação (Máx. {maxYears})
      </label>

      <Select
        id="year-multi-select"
        isMulti
        options={yearOptions}
        value={selectedValue}
        onChange={handleChange}
        isOptionDisabled={isOptionDisabled}
        placeholder={`Selecione 2 ou ${maxYears} anos...`}
        noOptionsMessage={() => "Nenhum ano disponível"}
        className="text-sm text-slate-900"
        classNamePrefix="react-select"
      />
    </div>
  );
}