import type { ReactNode, ReactElement } from "react";
import { isValidElement, cloneElement } from "react";

type Props = {
  label: string;
  value: string | number;
  sublabel?: string;
  icon?: ReactNode | ReactElement<{ size?: number; className?: string }>;
  iconColor?: "blue" | "green" | "yellow" | "red";
  isLoading?: boolean;
};

const iconColorMap = {
  blue: "bg-[#004F6D]",
  green: "bg-[#00A67D]",
  yellow: "bg-[#FFD166]",
  red: "bg-[#EF4444]",
};

const textColorMap = {
  blue: "text-[#004F6D]",
  green: "text-[#00A67D]",
  yellow: "text-[#F59E0B]",
  red: "text-[#EF4444]",
};

export default function BedsStatCard({ label, value, sublabel, icon, iconColor = "blue", isLoading = false }: Props) {
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-slate-600">{label}</p>
          <p className={`text-2xl font-bold mt-2 ${textColorMap[iconColor]}`}>{isLoading ? "..." : value}</p>
          {sublabel && <p className="text-xs text-slate-500 mt-1">{sublabel}</p>}
        </div>

        {icon && (
          <span className={`inline-flex h-12 w-12 items-center justify-center rounded-lg ${iconColorMap[iconColor]}`}>
            {isValidElement<{ size?: number; className?: string }>(icon)
              ? cloneElement(icon, {
                  size: 24,
                  className: "text-white",
                })
              : icon}
          </span>
        )}
      </div>
    </div>
  );
}
