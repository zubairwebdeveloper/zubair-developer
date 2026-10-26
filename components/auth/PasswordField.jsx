"use client";

import { useId, useState } from "react";
import { Controller } from "react-hook-form";
import { Eye, EyeOff, TriangleAlert } from "lucide-react";

import { PasswordStrength } from "@/components/auth/PasswordStrength";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export function PasswordField({
  control,
  name,
  label,
  description,
  autoComplete,
  showStrength = false,
}) {
  const [visible, setVisible] = useState(false);
  const [capsLockOn, setCapsLockOn] = useState(false);
  // Unique id so two forms (or fields) with the same `name` never share a label target.
  const id = `${useId()}-${name}`;
  const descriptionId = `${id}-description`;
  const capsId = `${id}-caps`;

  // Keep the Caps Lock state current while someone types.
  const updateCapsLock = (event) => {
    if (typeof event.getModifierState === "function") {
      setCapsLockOn(event.getModifierState("CapsLock"));
    }
  };

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => {
        const describedBy =
          [description ? descriptionId : null, capsLockOn ? capsId : null]
            .filter(Boolean)
            .join(" ") || undefined;

        return (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={id}>{label}</FieldLabel>

            <div className="relative">
              <Input
                {...field}
                id={id}
                type={visible ? "text" : "password"}
                autoComplete={autoComplete}
                // Stops phones from "correcting" the password when it is shown as text.
                autoCapitalize="off"
                autoCorrect="off"
                spellCheck={false}
                aria-invalid={fieldState.invalid}
                aria-describedby={describedBy}
                onKeyDown={updateCapsLock}
                onKeyUp={updateCapsLock}
                onBlur={() => {
                  field.onBlur();
                  setCapsLockOn(false);
                }}
                className="h-11 pr-12"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 size-9 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                // The label stays the same and aria-pressed carries the state,
                // so screen readers do not hear it twice.
                aria-label="Show password"
                aria-pressed={visible}
                onClick={() => setVisible((value) => !value)}
              >
                {visible ? (
                  <EyeOff aria-hidden="true" className="size-4" />
                ) : (
                  <Eye aria-hidden="true" className="size-4" />
                )}
              </Button>
            </div>

            {capsLockOn ? (
              <p
                id={capsId}
                role="status"
                className="flex items-center gap-1.5 text-sm text-muted-foreground"
              >
                <TriangleAlert
                  aria-hidden="true"
                  className="size-4 shrink-0 text-primary"
                />
                Caps Lock is on
              </p>
            ) : null}

            {showStrength ? <PasswordStrength value={field.value} /> : null}

            {description ? (
              <FieldDescription id={descriptionId}>
                {description}
              </FieldDescription>
            ) : null}

            {fieldState.invalid ? (
              <FieldError errors={[fieldState.error]} />
            ) : null}
          </Field>
        );
      }}
    />
  );
}
