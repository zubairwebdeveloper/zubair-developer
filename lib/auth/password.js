const COMMON = new Set([
  "password",
  "password1",
  "password123",
  "12345678",
  "123456789",
  "qwerty123",
  "qwertyuiop",
  "iloveyou",
  "admin123",
  "welcome1",
  "letmein123",
  "abc12345",
]);

export const isCommonPassword = (value) =>
  COMMON.has(String(value).toLowerCase());

export const PASSWORD_RULES = [
  { id: "length", label: "At least 8 characters", test: (p) => p.length >= 8 },
  { id: "lower", label: "A lowercase letter", test: (p) => /[a-z]/.test(p) },
  { id: "upper", label: "An uppercase letter", test: (p) => /[A-Z]/.test(p) },
  { id: "number", label: "A number", test: (p) => /\d/.test(p) },
  {
    id: "symbol",
    label: "A symbol (bonus)",
    test: (p) => /[^A-Za-z0-9]/.test(p),
  },
];

const LABELS = ["", "Weak", "Fair", "Good", "Strong"];

/** level: 0 (khali) se 4 (strong). Symbol ya 12+ characters score barhate hain, lazmi nahi. */
export function passwordStrength(password = "") {
  const checks = PASSWORD_RULES.map(({ id, label, test }) => ({
    id,
    label,
    passed: test(password),
  }));
  if (!password) return { level: 0, label: "", percent: 0, checks };
  if (isCommonPassword(password))
    return { level: 1, label: "Too common", percent: 15, checks };

  const points =
    checks.filter((check) => check.passed).length +
    (password.length >= 12 ? 1 : 0);
  const level = points <= 2 ? 1 : points === 3 ? 2 : points === 4 ? 3 : 4;

  return {
    level,
    label: LABELS[level],
    percent: Math.round((points / 6) * 100),
    checks,
  };
}
