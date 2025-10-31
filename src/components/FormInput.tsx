"use client";

import { InputHTMLAttributes } from "react";
import { FieldErrors, UseFormRegister } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  name: string;
  register: UseFormRegister<any>;
  errors: FieldErrors;
}

/**
 * Reusable form input component that handles labels, errors, and styling.
 * Works seamlessly with React Hook Form + Zod.
 */
const FormInput = ({
  label,
  name,
  register,
  errors,
  ...rest
}: FormInputProps) => {
  const errorMessage = errors[name]?.message as string | undefined;

  return (
    <div className="mb-4 w-full">
      <Label
        htmlFor={name}
        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
      >
        {label}
      </Label>
      <Input
        id={name}
        {...register(name)}
        {...rest}
        className={`w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 
          ${
            errorMessage
              ? "border-red-500 focus:ring-red-500"
              : "border-gray-300 focus:ring-blue-500"
          }
          dark:bg-neutral-900 dark:text-white dark:border-gray-600`}
      />
      {errorMessage && (
        <p className="mt-1 text-sm text-red-500">{errorMessage}</p>
      )}
    </div>
  );
};

export default FormInput;
