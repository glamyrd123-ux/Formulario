import React from 'react';
import {AlertCircle, Check} from 'lucide-react';

interface QuestionHeaderProps {
  number: string;
  label: string;
  htmlFor?: string;
  hint?: string;
  required?: boolean;
  optional?: boolean;
}

export const QuestionHeader: React.FC<QuestionHeaderProps> = ({
  number,
  label,
  htmlFor,
  hint,
}) => {
  const Tag = htmlFor ? 'label' : 'div';
  return (
    <div className="mb-3">
      <Tag
        htmlFor={htmlFor}
        className="flex items-baseline gap-2.5 text-[15px] sm:text-base font-semibold text-slate-900 leading-snug cursor-pointer"
      >
        <span className="font-display text-sm font-semibold tabular-nums text-sky-600 shrink-0 select-none">
          {number}.
        </span>
        <span>{label}</span>
      </Tag>
      {hint && (
        <div className="mt-1 pl-7 flex flex-wrap items-center gap-2 text-xs text-slate-500">
          <span>{hint}</span>
        </div>
      )}
    </div>
  );
};

interface FieldErrorProps {
  message?: string;
  id?: string;
}

export const FieldError: React.FC<FieldErrorProps> = ({message, id}) => {
  if (!message) return null;
  return (
    <p
      id={id}
      role="alert"
      className="mt-2 flex items-center gap-1.5 text-xs font-medium text-rose-700"
    >
      <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
      <span>{message}</span>
    </p>
  );
};

interface TextFieldProps {
  id: string;
  number: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: 'text' | 'email' | 'tel' | 'url';
  required?: boolean;
  optional?: boolean;
  hint?: string;
  error?: string;
  icon?: React.ReactNode;
  autoComplete?: string;
}

export const TextField: React.FC<TextFieldProps> = ({
  id,
  number,
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  required = false,
  optional = false,
  hint,
  error,
  icon,
  autoComplete,
}) => {
  const errorId = `${id}-error`;
  return (
    <div id={`field-${id}`} className="scroll-mt-24">
      <QuestionHeader
        number={number}
        label={label}
        htmlFor={id}
        hint={hint}
        required={required}
        optional={optional}
      />
      <div className="relative">
        {icon && (
          <div
            className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-sky-600/75"
            aria-hidden="true"
          >
            {icon}
          </div>
        )}
        <input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
          className={`w-full min-h-[44px] rounded-xl border bg-white py-2.5 pr-4 text-sm sm:text-[15px] text-slate-900 placeholder:text-slate-400 transition-colors duration-150 focus:outline-none focus:ring-4 ${
            icon ? 'pl-10' : 'pl-4'
          } ${
            error
              ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/15'
              : 'border-sky-200 hover:border-sky-300 focus:border-sky-500 focus:ring-sky-500/15'
          }`}
        />
      </div>
      <FieldError message={error} id={errorId} />
    </div>
  );
};

interface TextAreaFieldProps {
  id: string;
  number: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  required?: boolean;
  optional?: boolean;
  hint?: string;
  error?: string;
}

export const TextAreaField: React.FC<TextAreaFieldProps> = ({
  id,
  number,
  label,
  value,
  onChange,
  placeholder,
  rows = 3,
  required = false,
  optional = false,
  hint,
  error,
}) => {
  const errorId = `${id}-error`;
  return (
    <div id={`field-${id}`} className="scroll-mt-24">
      <QuestionHeader
        number={number}
        label={label}
        htmlFor={id}
        hint={hint}
        required={required}
        optional={optional}
      />
      <textarea
        id={id}
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        className={`w-full rounded-xl border bg-white px-4 py-3 text-sm sm:text-[15px] text-slate-900 placeholder:text-slate-400 leading-relaxed transition-colors duration-150 focus:outline-none focus:ring-4 resize-y ${
          error
            ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/15'
            : 'border-sky-200 hover:border-sky-300 focus:border-sky-500 focus:ring-sky-500/15'
        }`}
      />
      <FieldError message={error} id={errorId} />
    </div>
  );
};

interface RadioGroupFieldProps {
  id: string;
  number: string;
  label: string;
  options: readonly string[];
  value: string;
  onChange: (value: string) => void;
  otherOptionLabel?: string;
  otherValue?: string;
  onOtherChange?: (value: string) => void;
  otherPlaceholder?: string;
  required?: boolean;
  columns?: 1 | 2;
  error?: string;
  otherError?: string;
}

export const RadioGroupField: React.FC<RadioGroupFieldProps> = ({
  id,
  number,
  label,
  options,
  value,
  onChange,
  otherOptionLabel,
  otherValue = '',
  onOtherChange,
  otherPlaceholder = 'Especifica tu respuesta...',
  required = false,
  columns = 2,
  error,
  otherError,
}) => {
  const isOtherSelected = Boolean(otherOptionLabel && value === otherOptionLabel);
  const errorId = `${id}-error`;

  return (
    <fieldset id={`field-${id}`} className="scroll-mt-24">
      <legend className="w-full">
        <QuestionHeader
          number={number}
          label={label}
          hint="Selecciona una opción"
          required={required}
        />
      </legend>

      <div
        className={`grid gap-2.5 ${
          columns === 2 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'
        }`}
      >
        {options.map((option) => {
          const checked = value === option;
          return (
            <label
              key={option}
              className={`group flex items-center gap-3 min-h-[44px] px-4 py-2.5 rounded-xl border text-sm sm:text-[15px] cursor-pointer transition-all duration-150 select-none ${
                checked
                  ? 'border-sky-500 bg-sky-50/90 text-slate-900 font-medium shadow-[0_1px_8px_rgba(14,165,233,0.12)]'
                  : 'border-sky-200/80 bg-white text-slate-700 hover:border-sky-300 hover:bg-sky-50/40'
              }`}
            >
              <input
                type="radio"
                name={id}
                value={option}
                checked={checked}
                onChange={() => onChange(option)}
                className="sr-only"
              />
              <span
                className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition-colors ${
                  checked
                    ? 'border-sky-600 bg-sky-600'
                    : 'border-sky-300 bg-white group-hover:border-sky-400'
                }`}
                aria-hidden="true"
              >
                {checked && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
              </span>
              <span className="leading-snug">{option}</span>
            </label>
          );
        })}
      </div>

      {isOtherSelected && onOtherChange && (
        <div className="mt-3">
          <label htmlFor={`${id}-other`} className="sr-only">
            Especificar otra opción
          </label>
          <input
            id={`${id}-other`}
            type="text"
            value={otherValue}
            onChange={(e) => onOtherChange(e.target.value)}
            placeholder={otherPlaceholder}
            className={`w-full min-h-[44px] rounded-xl border bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:outline-none focus:ring-4 ${
              otherError
                ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/15'
                : 'border-sky-300 focus:border-sky-500 focus:ring-sky-500/15'
            }`}
          />
          <FieldError message={otherError} />
        </div>
      )}

      <FieldError message={error} id={errorId} />
    </fieldset>
  );
};

interface CheckboxGroupFieldProps {
  id: string;
  number: string;
  label: string;
  options: readonly string[];
  values: string[];
  onToggle: (option: string) => void;
  otherOptionLabel?: string;
  otherValue?: string;
  onOtherChange?: (value: string) => void;
  otherPlaceholder?: string;
  required?: boolean;
  error?: string;
  otherError?: string;
}

export const CheckboxGroupField: React.FC<CheckboxGroupFieldProps> = ({
  id,
  number,
  label,
  options,
  values,
  onToggle,
  otherOptionLabel,
  otherValue = '',
  onOtherChange,
  otherPlaceholder = 'Especifica cuál...',
  required = false,
  error,
  otherError,
}) => {
  const isOtherChecked = Boolean(
    otherOptionLabel && values.includes(otherOptionLabel),
  );
  const errorId = `${id}-error`;

  return (
    <fieldset id={`field-${id}`} className="scroll-mt-24">
      <legend className="w-full">
        <QuestionHeader
          number={number}
          label={label}
          hint="Puedes marcar varias opciones"
          required={required}
        />
      </legend>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {options.map((option) => {
          const checked = values.includes(option);
          return (
            <label
              key={option}
              className={`group flex items-center gap-3 min-h-[44px] px-4 py-2.5 rounded-xl border text-sm sm:text-[15px] cursor-pointer transition-all duration-150 select-none ${
                checked
                  ? 'border-sky-500 bg-sky-50/90 text-slate-900 font-medium shadow-[0_1px_8px_rgba(14,165,233,0.12)]'
                  : 'border-sky-200/80 bg-white text-slate-700 hover:border-sky-300 hover:bg-sky-50/40'
              }`}
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={() => onToggle(option)}
                className="sr-only"
              />
              <span
                className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors ${
                  checked
                    ? 'border-sky-600 bg-sky-600 text-white'
                    : 'border-sky-300 bg-white group-hover:border-sky-400'
                }`}
                aria-hidden="true"
              >
                {checked && <Check className="h-3 w-3 stroke-[3]" />}
              </span>
              <span className="leading-snug">{option}</span>
            </label>
          );
        })}
      </div>

      {isOtherChecked && onOtherChange && (
        <div className="mt-3">
          <label htmlFor={`${id}-other`} className="sr-only">
            Especificar otra opción
          </label>
          <input
            id={`${id}-other`}
            type="text"
            value={otherValue}
            onChange={(e) => onOtherChange(e.target.value)}
            placeholder={otherPlaceholder}
            className={`w-full min-h-[44px] rounded-xl border bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:outline-none focus:ring-4 ${
              otherError
                ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/15'
                : 'border-sky-300 focus:border-sky-500 focus:ring-sky-500/15'
            }`}
          />
          <FieldError message={otherError} />
        </div>
      )}

      <FieldError message={error} id={errorId} />
    </fieldset>
  );
};

interface DateFieldProps {
  id: string;
  number: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  optional?: boolean;
  hint?: string;
}

export const DateField: React.FC<DateFieldProps> = ({
  id,
  number,
  label,
  value,
  onChange,
  optional = false,
  hint,
}) => {
  return (
    <div id={`field-${id}`} className="scroll-mt-24">
      <QuestionHeader
        number={number}
        label={label}
        htmlFor={id}
        hint={hint}
        optional={optional}
      />
      <input
        id={id}
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full sm:w-72 min-h-[44px] rounded-xl border border-sky-200 bg-white px-4 py-2.5 text-sm sm:text-[15px] text-slate-900 transition-colors duration-150 hover:border-sky-300 focus:border-sky-500 focus:outline-none focus:ring-4 focus:ring-sky-500/15"
      />
    </div>
  );
};
