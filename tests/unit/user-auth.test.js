import { describe, expect, it } from "vitest";

import { passwordStrength } from "@/lib/auth/password";
import { safeRedirect } from "@/lib/auth/redirect";
import {
  changePasswordSchema,
  registerSchema,
  resetSchema,
} from "@/lib/validations/user-auth.schema";

describe("passwordStrength", () => {
  it("is empty for an empty password", () => {
    expect(passwordStrength("")).toMatchObject({ level: 0, percent: 0 });
  });

  it("rates short and simple passwords as weak", () => {
    expect(passwordStrength("abc").level).toBe(1);
  });

  it("flags common passwords no matter how they pass the rules", () => {
    expect(passwordStrength("password").label).toBe("Too common");
  });

  it("rewards length and symbols", () => {
    expect(passwordStrength("Str0ng!Passw0rd")).toMatchObject({
      level: 4,
      percent: 100,
    });
    expect(passwordStrength("Abcdefg1").level).toBeLessThan(4);
  });

  it("reports each rule", () => {
    const checks = passwordStrength("Abcdefg1").checks;
    expect(checks.find((c) => c.id === "symbol").passed).toBe(false);
    expect(checks.find((c) => c.id === "number").passed).toBe(true);
  });
});

describe("safeRedirect", () => {
  it("allows normal internal paths", () => {
    expect(safeRedirect("/pricing")).toBe("/pricing");
    expect(safeRedirect("/account?tab=1")).toBe("/account?tab=1");
  });

  it("blocks open redirects and loops", () => {
    [
      "//evil.example",
      "https://evil.example",
      "/\\evil",
      "javascript:alert(1)",
      "/login",
      "/register?x=1",
      "/auth/action",
      5,
      null,
    ].forEach((value) => expect(safeRedirect(value)).toBe("/account"));
  });
});

const valid = {
  name: "Ayesha Khan",
  email: "Ayesha@Example.com",
  password: "Str0ngPass1",
  confirmPassword: "Str0ngPass1",
  terms: true,
};

describe("auth schemas", () => {
  it("accepts a valid registration and lower-cases the email", () => {
    const result = registerSchema.safeParse(valid);
    expect(result.success).toBe(true);
    expect(result.data.email).toBe("ayesha@example.com");
  });

  it("rejects weak, mismatched and common passwords and missing terms", () => {
    expect(
      registerSchema.safeParse({
        ...valid,
        password: "short1A",
        confirmPassword: "short1A",
      }).success,
    ).toBe(false);
    expect(
      registerSchema.safeParse({
        ...valid,
        password: "alllowercase1",
        confirmPassword: "alllowercase1",
      }).success,
    ).toBe(false);
    expect(
      registerSchema.safeParse({ ...valid, confirmPassword: "Different1Pass" })
        .success,
    ).toBe(false);
    expect(
      registerSchema.safeParse({
        ...valid,
        password: "Password123",
        confirmPassword: "Password123",
      }).success,
    ).toBe(false);
    expect(registerSchema.safeParse({ ...valid, terms: false }).success).toBe(
      false,
    );
  });

  it("validates reset and change-password flows", () => {
    expect(
      resetSchema.safeParse({
        password: "Str0ngPass1",
        confirmPassword: "Str0ngPass1",
      }).success,
    ).toBe(true);
    expect(
      resetSchema.safeParse({
        password: "Str0ngPass1",
        confirmPassword: "nope",
      }).success,
    ).toBe(false);
    expect(
      changePasswordSchema.safeParse({
        currentPassword: "Str0ngPass1",
        password: "Str0ngPass1",
        confirmPassword: "Str0ngPass1",
      }).success,
    ).toBe(false);
  });
});
