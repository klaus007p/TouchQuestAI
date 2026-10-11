interface Option<T> {
    label: string;
    value: T;
}

interface ChoiceGroupProps<T> {
    label: string;
    options: Option<T>[];
    value: T;
    onChange: (value: T) => void;
    disabled?: boolean;
}

export function ChoiceGroup<T extends string | number | undefined>({
    label,
    options,
    value,
    onChange,
    disabled,
}: ChoiceGroupProps<T>) {
    return (
        <div role="group" aria-label={label}>
            <div className="mb-2 text-sm text-white/60">{label}</div>
            <div className="flex flex-wrap gap-2">
                {options.map((o) => {
                    const selected = o.value === value;
                    return (
                        <button
                            key={String(o.value ?? "any")}
                            type="button"
                            disabled={disabled}
                            aria-pressed={selected}
                            onClick={() => onChange(o.value)}
                            className={`rounded-full border px-4 py-1.5 text-sm transition disabled:opacity-50 ${selected
                                    ? "border-emerald-400 bg-emerald-400/15 text-emerald-300"
                                    : "border-white/15 text-white/70 hover:border-white/30"
                                }`}
                        >
                            {o.label}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}