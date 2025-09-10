import type { ReactElement } from "react";
import { cloneElement, isValidElement } from "react";

type Props = {
  icon: ReactElement<{ size?: number; className?: string }>;
  bgClass?: string;
  size?: number;
  rounded?: string;
  iconClassName?: string;
  iconSize?: number;
};

export default function IconBadge({ icon, bgClass = "bg-slate-300", size = 40, rounded = "rounded-lg", iconClassName, iconSize }: Props) {
  const innerSize = iconSize ?? Math.round(size * 0.45);

  return (
    <span className={`inline-flex items-center justify-center ${rounded} ${bgClass}`} style={{ width: size, height: size }}>
      {isValidElement<{ size?: number; className?: string }>(icon)
        ? cloneElement(icon, {
            size: innerSize,
            className: iconClassName ?? "text-white",
          })
        : icon}
    </span>
  );
}
