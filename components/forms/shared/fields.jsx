"use client";

import { useId } from "react";
import { Controller } from "react-hook-form";

import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils/cn";

const labelClass = "text-sm font-medium";
const controlClass =
  "rounded-xl bg-background transition-colors duration-200 motion-reduce:transition-none";
const boxedFieldClass =
  "items-start gap-3 rounded-xl border border-border/60 bg-muted/30 p-3.5 transition-colors duration-200 data-[invalid=true]:border-destructive/60 motion-reduce:transition-none";

// Builds the aria-describedby value from the description and error ids.
function describedBy({ id, hasDescription, invalid }) {
  const ids = [
    hasDescription ? `${id}-description` : null,
    invalid ? `${id}-error` : null,
  ].filter(Boolean);
  return ids.length ? ids.join(" ") : undefined;
}

function FieldMessages({ id, description, fieldState }) {
  return (
    <>
      {description ? (
        <FieldDescription id={`${id}-description`}>
          {description}
        </FieldDescription>
      ) : null}
      {fieldState.invalid ? (
        <FieldError id={`${id}-error`} errors={[fieldState.error]} />
      ) : null}
    </>
  );
}

/** Extra props such as disabled, step, inputMode or placeholder pass through to the input. */
export function TextField({
  control,
  name,
  label,
  description,
  type = "text",
  id: idProp,
  className,
  ...props
}) {
  const generatedId = useId();
  const id = idProp ?? generatedId;

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid}>
          <FieldLabel htmlFor={id} className={labelClass}>
            {label}
          </FieldLabel>
          <Input
            {...field}
            id={id}
            type={type}
            aria-invalid={fieldState.invalid}
            aria-describedby={describedBy({
              id,
              hasDescription: Boolean(description),
              invalid: fieldState.invalid,
            })}
            className={cn("h-11", controlClass, className)}
            {...props}
          />
          <FieldMessages
            id={id}
            description={description}
            fieldState={fieldState}
          />
        </Field>
      )}
    />
  );
}

export function TextareaField({
  control,
  name,
  label,
  description,
  rows = 5,
  id: idProp,
  className,
  ...props
}) {
  const generatedId = useId();
  const id = idProp ?? generatedId;

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid}>
          <FieldLabel htmlFor={id} className={labelClass}>
            {label}
          </FieldLabel>
          <Textarea
            {...field}
            id={id}
            rows={rows}
            aria-invalid={fieldState.invalid}
            aria-describedby={describedBy({
              id,
              hasDescription: Boolean(description),
              invalid: fieldState.invalid,
            })}
            className={cn(
              "min-h-24 resize-y leading-relaxed",
              controlClass,
              className,
            )}
            {...props}
          />
          <FieldMessages
            id={id}
            description={description}
            fieldState={fieldState}
          />
        </Field>
      )}
    />
  );
}

/** `disabled` is optional. `options` can be empty without breaking the field. */
export function SelectField({
  control,
  name,
  label,
  description,
  options = [],
  placeholder = "Select…",
  disabled = false,
}) {
  const id = useId();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid}>
          <FieldLabel htmlFor={id} className={labelClass}>
            {label}
          </FieldLabel>
          <Select
            name={name}
            value={field.value}
            onValueChange={field.onChange}
            disabled={disabled}
          >
            <SelectTrigger
              id={id}
              onBlur={field.onBlur}
              aria-invalid={fieldState.invalid}
              aria-describedby={describedBy({
                id,
                hasDescription: Boolean(description),
                invalid: fieldState.invalid,
              })}
              className={cn("h-11 w-full", controlClass)}
            >
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              {options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FieldMessages
            id={id}
            description={description}
            fieldState={fieldState}
          />
        </Field>
      )}
    />
  );
}

/** `description` and `disabled` are optional. `label` can be text or JSX (for example, with links). */
export function CheckboxField({
  control,
  name,
  label,
  description,
  disabled = false,
}) {
  const id = useId();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <Field
          orientation="horizontal"
          data-invalid={fieldState.invalid}
          className={boxedFieldClass}
        >
          <Checkbox
            id={id}
            checked={Boolean(field.value)}
            onCheckedChange={(checked) => field.onChange(checked === true)}
            onBlur={field.onBlur}
            disabled={disabled}
            aria-invalid={fieldState.invalid}
            aria-describedby={describedBy({
              id,
              hasDescription: Boolean(description),
              invalid: fieldState.invalid,
            })}
            className="mt-0.5"
          />
          <div className="flex flex-1 flex-col gap-1.5">
            <FieldLabel
              htmlFor={id}
              className="text-sm leading-snug font-normal"
            >
              {label}
            </FieldLabel>
            {description ? (
              <FieldDescription id={`${id}-description`}>
                {description}
              </FieldDescription>
            ) : null}
            {fieldState.invalid ? (
              <FieldError id={`${id}-error`} errors={[fieldState.error]} />
            ) : null}
          </div>
        </Field>
      )}
    />
  );
}

/** A hidden field that real visitors never see, so bots that fill it can be rejected. */
export function HoneypotField({ register }) {
  const id = useId();

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute -left-[9999px] h-0 w-0 overflow-hidden"
    >
      <label htmlFor={id}>Leave this field empty</label>
      <input
        id={id}
        type="text"
        tabIndex={-1}
        autoComplete="off"
        // Stops password managers and browsers from filling the field by mistake.
        data-lpignore="true"
        data-1p-ignore="true"
        {...register("companyUrl")}
      />
    </div>
  );
}

/** `disabled` is optional. A validation error, if the schema has one, is shown below the label. */
export function SwitchField({
  control,
  name,
  label,
  description,
  disabled = false,
}) {
  const id = useId();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <Field
          orientation="horizontal"
          data-invalid={fieldState.invalid}
          className={boxedFieldClass}
        >
          <Switch
            id={id}
            checked={Boolean(field.value)}
            onCheckedChange={field.onChange}
            onBlur={field.onBlur}
            disabled={disabled}
            aria-invalid={fieldState.invalid}
            aria-describedby={describedBy({
              id,
              hasDescription: Boolean(description),
              invalid: fieldState.invalid,
            })}
          />
          <div className="flex flex-1 flex-col gap-1">
            <FieldLabel
              htmlFor={id}
              className="text-sm leading-snug font-normal"
            >
              {label}
            </FieldLabel>
            {description ? (
              <FieldDescription id={`${id}-description`}>
                {description}
              </FieldDescription>
            ) : null}
            {fieldState.invalid ? (
              <FieldError id={`${id}-error`} errors={[fieldState.error]} />
            ) : null}
          </div>
        </Field>
      )}
    />
  );
}
