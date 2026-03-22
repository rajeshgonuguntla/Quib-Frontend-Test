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
        className={`w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#E10600] focus:ring-4 focus:ring-[#E10600]/10 outline-none transition-all ${className}`}
        {...props}
      />
    </div>
  );
}