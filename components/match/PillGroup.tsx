interface PillOption<T extends string> {
  value: T;
  label: string;
  hint?: string;
}

interface PillGroupProps<T extends string> {
  label: string;
  options: PillOption<T>[];
  value: T;
  onChange: (value: T) => void;
  disabled?: boolean;
}

export function PillGroup<T extends string>({
  label,
  options,
  value,
  onChange,
  disabled,
}: PillGroupProps<T>) {
  return (
    <fieldset className="space-y-3" disabled={disabled}>
      <legend className="text-sm font-medium text-zinc-300">{label}</legend>
      <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={label}>
        {options.map((option) => {
          const active = value === option.value;
          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onChange(option.value)}
              className={`rounded-full border px-4 py-2 text-sm transition-all ${
                active
                  ? "border-cyan-400 bg-cyan-400/15 text-cyan-300 ring-1 ring-cyan-400/50"
                  : "border-zinc-700 bg-zinc-800/50 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200"
              }`}
            >
              <span>{option.label}</span>
              {option.hint && (
                <span className="mt-0.5 block text-xs opacity-70">{option.hint}</span>
              )}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
