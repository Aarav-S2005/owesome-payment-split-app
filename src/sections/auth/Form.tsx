"use client"

import {Button, FieldError, Form, Input, Label, TextField} from "@heroui/react";
import { Eye, EyeOff, Check } from "lucide-react";
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
  onSubmit: (formData: FormData) => Promise<void>;
};

export function AuthForm({ fields, onSubmit }: AuthFormProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <Form
      className="flex w-96 flex-col gap-4"
      onSubmit={async (e ) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        await onSubmit(formData);
      }}
    >
      {fields.map((field) => (
        <TextField
          className={""}
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
          <Label>{field.label}</Label>

          <div className="relative">
            <Input
              placeholder={field.placeholder}
              className={`w-full ${field.type === "password" ? "pr-10" : ""}`}
            />

            {field.type === "password" && (
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                {showPassword ? (
                  <EyeOff size={18} />
                ) : (
                  <Eye size={18} />
                )}
              </button>
            )}
          </div>

          <FieldError />
        </TextField>
      ))}

      <div className="flex gap-2">
        <Button type="submit">
          <Check />
          Submit
        </Button>
      </div>
    </Form>
  );
}
