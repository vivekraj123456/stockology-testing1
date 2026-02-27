import type { ChangeEventHandler } from "react";

type FormFieldProps = {
  label: string;
  name: string;
  value: string;
  onChange: ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>;
  placeholder?: string;
  required?: boolean;
  as?: "input" | "textarea";
  type?: string;
  rows?: number;
};

export default function FormField({
  label,
  name,
  value,
  onChange,
  placeholder,
  required = false,
  as = "input",
  type = "text",
  rows = 5,
}: FormFieldProps) {
  return (
    <label className="group flex flex-col gap-2.5">
      <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
        {label}
        {required ? " *" : ""}
      </span>

      {as === "textarea" ? (
        <textarea
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          rows={rows}
          required={required}
          placeholder={placeholder}
          className="min-h-[150px] rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3 text-sm leading-6 text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 group-hover:border-slate-300 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100"
        />
      ) : (
        <input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          required={required}
          placeholder={placeholder}
          className="rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 group-hover:border-slate-300 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100"
        />
      )}
    </label>
  );
}
