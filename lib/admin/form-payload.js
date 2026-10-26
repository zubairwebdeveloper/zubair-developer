export function toFormValues(config, item) {
  const values = {};

  for (const field of config.fields) {
    const fallback =
      field.defaultValue ??
      (field.type === "switch" ? false : field.type === "lines" ? [] : "");
    const raw = item?.[field.name] ?? fallback;

    if (field.type === "lines") values[field.name] = raw.join("\n");
    else if (field.type === "number")
      values[field.name] = raw === null || raw === "" ? "" : String(raw);
    else values[field.name] = raw;
  }

  return values;
}

export function toPayload(config, values) {
  const payload = {};

  for (const field of config.fields) {
    const value = values[field.name];

    if (field.type === "lines") {
      payload[field.name] = String(value ?? "")
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean);
    } else if (field.type === "number") {
      payload[field.name] =
        value === "" || value == null ? null : Number(value);
    } else {
      payload[field.name] = value;
    }
  }

  return payload;
}

/** React Hook Form ke liye resolver: pehle payload banata hai, phir Zod se validate. */
export function createResolver(schema, buildPayload) {
  return async (values) => {
    const result = schema.safeParse(buildPayload(values));
    if (result.success) return { values, errors: {} };

    const errors = {};
    for (const issue of result.error.issues) {
      const key = issue.path[0];
      if (typeof key === "string" && !errors[key]) {
        errors[key] = { type: issue.code, message: issue.message };
      }
    }
    return { values: {}, errors };
  };
}
