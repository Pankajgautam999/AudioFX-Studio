import { classNames } from "@/lib/utils";

interface Option<T extends string> {
  value: T;
  label: string;
  icon?: string;
}

interface PillSelectProps<T extends string> {
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
  name: string;
}

export default function PillSelect<T extends string>({ options, value, onChange, name }: PillSelectProps<T>) {
  return (
    <div role="radiogroup" aria-label={name} className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(option.value)}
            className={classNames("pill-select flex items-center gap-2", active ? "pill-select-active" : "pill-select-inactive")}
          >
            <span aria-hidden="true">{option.icon}</span>
            <span>{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}
