import { InputHTMLAttributes, ReactNode } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  success?: string;
  icon?: ReactNode;
  helperText?: string;
}

export function Input({ label, className = '', ...props }: InputProps) {
  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <input
        className={`w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#e8650a] focus:ring-4 focus:ring-[#e8650a]/10 outline-none transition-all dark:focus:border-[#ff7a1a] dark:focus:ring-[#ff7a1a]/15 ${className}`}
        {...props}
      />
    </div>
  );
}