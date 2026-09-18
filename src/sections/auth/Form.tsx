"use client";

import { Button, FieldError, Form, Input, Label, TextField } from "@heroui/react";
import { Eye, EyeOff, Check, Loader2 } from "lucide-react";
import { useState } from "react";

export type AuthField = {
  name: string;
  label: string;
  type: "text" | "email" | "password";
  placeholder?: string;
  required?: boolean;
  minLength?: number;
  validate?: (value: string) => boolean;
};

type AuthFormProps = {
  fields: AuthField[];
  submitText?: string;
  onSubmit: (formData: FormData) => Promise<void>;
};

export function AuthForm({ fields, submitText = "Submit", onSubmit }: AuthFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  return (
    <Form
      className="flex w-full flex-col gap-4"
      onSubmit={async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
          const formData = new FormData(e.currentTarget);
          await onSubmit(formData);
        } finally {
          setIsLoading(false);
        }
      }}
    >
      {fields.map((field) => (
        <TextField
          className="w-full flex flex-col gap-1.5"
          key={field.name}
          name={field.name}
          isRequired={field.required ?? true}
          minLength={field.minLength}
          type={
            field.type === "password"
              ? showPassword
                ? "text"
                : "password"
              : field.type
          }
          validate={
            field.validate
              ? (value) =>
                  field.validate!(value)
                    ? null
                    : `Invalid ${field.label.toLowerCase()}`
              : undefined
          }
        >
          <Label className="text-sm font-medium text-default-foreground">
            {field.label}
          </Label>

          <div className="relative w-full">
            <Input
              placeholder={field.placeholder}
              className={`w-full rounded-lg border border-border bg-field-background px-3 py-2 text-field-foreground placeholder:text-field-placeholder focus:outline-none focus:ring-2 focus:ring-accent ${
                field.type === "password" ? "pr-10" : ""
              }`}
            />

            {field.type === "password" && (
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground transition-colors p-1"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            )}
          </div>

          <FieldError className="text-xs text-danger mt-0.5" />
        </TextField>
      ))}

      <div className="mt-2">
        <Button
          type="submit"
          isDisabled={isLoading}
          className="w-full bg-accent text-accent-foreground font-semibold py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 hover:opacity-95 transition active:scale-[0.99] disabled:opacity-60 cursor-pointer"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              <Check className="w-4 h-4" />
              <span>{submitText}</span>
            </>
          )}
        </Button>
      </div>
    </Form>
  );
}
