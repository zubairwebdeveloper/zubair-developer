"use client";

import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { ImageField } from "@/components/admin/ImageField";
import {
  SelectField,
  SwitchField,
  TextField,
  TextareaField,
} from "@/components/forms/shared/fields";
import { FormError } from "@/components/forms/shared/FormStatus";
import { Button } from "@/components/ui/button";
import { FieldGroup } from "@/components/ui/field";
import {
  createResolver,
  toFormValues,
  toPayload,
} from "@/lib/admin/form-payload";
import { sendJson } from "@/lib/utils/submit-form";

function FieldRenderer({ field, control }) {
  const { name, label, description } = field;

  switch (field.type) {
    case "textarea":
      return (
        <TextareaField
          control={control}
          name={name}
          label={label}
          description={description}
          rows={field.rows ?? 4}
        />
      );
    case "lines":
      return (
        <TextareaField
          control={control}
          name={name}
          label={label}
          description={description ?? "One item per line."}
          rows={field.rows ?? 4}
        />
      );
    case "number":
      return (
        <TextField
          control={control}
          name={name}
          label={label}
          description={description}
          type="number"
          step="any"
          inputMode="decimal"
        />
      );
    case "select":
      return (
        <SelectField
          control={control}
          name={name}
          label={label}
          description={description}
          options={field.options}
        />
      );
    case "switch":
      return (
        <SwitchField
          control={control}
          name={name}
          label={label}
          description={description}
        />
      );
    case "image":
      return (
        <ImageField
          control={control}
          name={name}
          label={label}
          description={description}
        />
      );
    default:
      return (
        <TextField
          control={control}
          name={name}
          label={label}
          description={description}
        />
      );
  }
}

/**
 * Flattens react-hook-form's nested error object into
 * [{ name: "tags.0", message: "Required" }, ...].
 */
function collectErrors(errors, prefix = "") {
  const out = [];
  if (!errors || typeof errors !== "object") return out;

  for (const [key, value] of Object.entries(errors)) {
    if (key === "ref") continue;
    const path = prefix ? `${prefix}.${key}` : key;

    if (
      value &&
      typeof value === "object" &&
      typeof value.message === "string"
    ) {
      out.push({ name: path, message: value.message });
    } else if (value && typeof value === "object") {
      out.push(...collectErrors(value, path));
    }
  }
  return out;
}

/**
 * ContentForm
 *
 * @param {object}   config      Resource config (schema, fields, resource, singular).
 * @param {object}   [item]      The record being edited. Omit to create a new one.
 * @param {Function} onSaved     Called after a successful save.
 * @param {Function} [onCancel]  Optional. Adds a Cancel button. If there are unsaved
 *                               changes, the person is asked to confirm first.
 */
export function ContentForm({ config, item, onSaved, onCancel }) {
  const [submitError, setSubmitError] = useState("");
  const [discardOpen, setDiscardOpen] = useState(false);
  const errorRef = useRef(null);

  const isEditing = Boolean(item);

  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting, isDirty },
  } = useForm({
    resolver: createResolver(config.schema, (values) =>
      toPayload(config, values),
    ),
    defaultValues: toFormValues(config, item),
  });

  // Warn before closing the tab with unsaved edits.
  useEffect(() => {
    if (!isDirty) return undefined;
    const onBeforeUnload = (event) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [isDirty]);

  // Bring a server error into view so it is not missed on long forms.
  useEffect(() => {
    if (submitError) errorRef.current?.scrollIntoView({ block: "nearest" });
  }, [submitError]);

  async function onSubmit(values) {
    setSubmitError("");
    const payload = toPayload(config, values);

    try {
      if (item) {
        await sendJson(
          "PATCH",
          `/api/admin/content/${config.resource}/${item.id}`,
          payload,
        );
      } else {
        await sendJson(
          "POST",
          `/api/admin/content/${config.resource}`,
          payload,
        );
      }
      toast.success(item ? "Changes saved" : `${config.singular} created`);
      reset(values); // the saved values become the new baseline
      onSaved();
    } catch (error) {
      setSubmitError(error.message);
    }
  }

  function onInvalid(errors) {
    const list = collectErrors(errors);
    console.warn("[ContentForm] validation failed:", errors);

    const labels = new Map(config.fields.map((f) => [f.name, f.label]));
    const rendered = new Set(config.fields.map((f) => f.name));

    const labelFor = (path) => labels.get(path.split(".")[0]) ?? path;

    // Errors on fields that are not on the form have nothing to highlight,
    // so surface them in the form-level error area.
    const hidden = list.filter((e) => !rendered.has(e.name.split(".")[0]));
    if (hidden.length > 0) {
      setSubmitError(
        `These fields failed validation but are not shown on the form: ${hidden
          .map((e) => `${e.name} (${e.message})`)
          .join(", ")}`,
      );
    }

    toast.error(
      "Some fields need attention. Check the highlighted fields and try again.",
      {
        description: list
          .slice(0, 3)
          .map((e) => `${labelFor(e.name)}: ${e.message}`)
          .join(" · "),
      },
    );
  }

  const submit = handleSubmit(onSubmit, onInvalid);

  // Ctrl or Cmd + S saves without leaving the keyboard.
  function onKeyDown(event) {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "s") {
      event.preventDefault();
      if (!isSubmitting) submit();
    }
  }

  function handleCancel() {
    if (isDirty) setDiscardOpen(true);
    else onCancel?.();
  }

  const saveDisabled = isSubmitting || (isEditing && !isDirty);

  return (
    <>
      <form
        onSubmit={submit}
        onKeyDown={onKeyDown}
        noValidate
        className="px-4 pb-6"
      >
        <FieldGroup>
          {config.fields.map((field) => (
            <FieldRenderer key={field.name} field={field} control={control} />
          ))}

          <div ref={errorRef}>
            <FormError message={submitError} />
          </div>

          {/* Action bar */}
          <div className="sticky bottom-0 -mx-4 flex flex-wrap items-center justify-between gap-3 border-t border-border bg-card/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-card/85">
            <p
              role="status"
              aria-live="polite"
              className="text-sm text-muted-foreground"
            >
              {isDirty ? (
                <span className="font-medium text-foreground">
                  You have unsaved changes
                </span>
              ) : isEditing ? (
                "No changes yet"
              ) : (
                <span className="hidden sm:inline">
                  Press Ctrl or ⌘ + S to save
                </span>
              )}
            </p>

            <div className="flex flex-wrap items-center gap-2">
              {onCancel ? (
                <Button
                  type="button"
                  variant="ghost"
                  disabled={isSubmitting}
                  onClick={handleCancel}
                >
                  Cancel
                </Button>
              ) : null}
              <Button type="submit" size="lg" disabled={saveDisabled}>
                {isSubmitting
                  ? "Saving…"
                  : item
                    ? "Save changes"
                    : `Create ${config.singular}`}
              </Button>
            </div>
          </div>
        </FieldGroup>
      </form>

      <ConfirmDialog
        open={discardOpen}
        onOpenChange={setDiscardOpen}
        title="Discard your changes?"
        description="You have unsaved changes. If you leave now, they will be lost."
        confirmLabel="Discard changes"
        cancelLabel="Keep editing"
        destructive
        onConfirm={() => {
          setDiscardOpen(false);
          onCancel?.();
        }}
      />
    </>
  );
}
