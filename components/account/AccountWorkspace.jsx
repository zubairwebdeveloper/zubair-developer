"use client";

import { useEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  LayoutGroup,
  motion,
  useReducedMotion,
} from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  CheckCircle2,
  Circle,
  Copy,
  KeyRound,
  LayoutDashboard,
  LifeBuoy,
  LogOut,
  Mail,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import { FaqAccordion } from "@/components/about/FaqAccordion";
import { ProgressBar } from "@/components/auth/ProgressBar";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const EASE = [0.22, 1, 0.36, 1];
const OFFSET = 48; // px

const TABS = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "profile", label: "Profile", icon: UserRound },
  { id: "security", label: "Security", icon: ShieldCheck },
  { id: "help", label: "Help", icon: LifeBuoy },
];
const TAB_IDS = TABS.map((tab) => tab.id);

/** dir: +1 = aage (right se aata hai), -1 = peeche (left se aata hai) */
const slide = {
  enter: ({ dir, reduce }) => ({ opacity: 0, x: reduce ? 0 : dir * OFFSET }),
  center: { opacity: 1, x: 0 },
  exit: ({ dir, reduce }) => ({ opacity: 0, x: reduce ? 0 : -dir * OFFSET }),
};

const FAQS = [
  {
    question: "How do I change my display name?",
    answer:
      "Open the Profile tab, edit your name and save. The new name is shown on your account right away.",
  },
  {
    question: "Why should I verify my email?",
    answer:
      "Verifying confirms the address belongs to you. It is also the address used to recover access, for example when you reset a password. If you did not receive the email, use the resend option in the verification banner.",
  },
  {
    question: "What happens when I change my password?",
    answer:
      "Your other devices are signed out automatically, so anyone using an old session has to sign in again with the new password.",
  },
  {
    question: "I signed in with Google. Can I set a password here?",
    answer:
      "The password section is shown only for accounts that use email and password. If you sign in with Google, your sign-in is managed by your Google account.",
  },
  {
    question: "How do I sign out of my devices?",
    answer:
      "Go to the Security tab and use the controls in the Sessions section.",
  },
];

const SECURITY_TIPS = [
  "Use a unique password that you do not use on other websites.",
  "Sign out when you use a shared or public device.",
  "Keep your email account secure, because it is used for account recovery.",
  "If something looks unfamiliar, change your password and sign out of other devices.",
];

function Rise({ i = 0, className, children }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: reduce ? 0 : 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: reduce ? 0.01 : 0.4,
        ease: EASE,
        delay: reduce ? 0 : i * 0.06,
      }}
    >
      {children}
    </motion.div>
  );
}

function SectionTitle({ icon: Icon, children }) {
  return (
    <span className="flex items-center gap-3">
      <span
        aria-hidden="true"
        className="bg-primary/10 text-primary flex size-9 shrink-0 items-center justify-center rounded-lg"
      >
        <Icon className="size-[18px]" />
      </span>
      <span className="text-card-title">{children}</span>
    </span>
  );
}

function buttonPrimary() {
  return "group bg-primary text-primary-foreground focus-visible:ring-ring inline-flex min-h-11 w-fit items-center gap-2 rounded-lg px-4 text-sm font-medium outline-none transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-offset-2 motion-safe:active:scale-[0.98]";
}

/* ---------------------------- Overview ---------------------------- */

function CopyEmailButton({ email }) {
  const [status, setStatus] = useState("idle"); // idle | copied | error
  const timer = useRef(null);

  useEffect(() => () => clearTimeout(timer.current), []);

  async function copy() {
    try {
      await navigator.clipboard.writeText(email);
      setStatus("copied");
    } catch {
      setStatus("error");
    }
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setStatus("idle"), 2000);
  }

  return (
    <>
      <button
        type="button"
        onClick={copy}
        className="border-border bg-background hover:bg-muted focus-visible:ring-ring inline-flex min-h-10 items-center gap-2 rounded-lg border px-3 text-sm font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 motion-reduce:transition-none"
      >
        {status === "copied" ? (
          <Check aria-hidden="true" className="text-primary size-4" />
        ) : (
          <Copy aria-hidden="true" className="size-4" />
        )}
        {status === "copied"
          ? "Copied"
          : status === "error"
            ? "Copy failed"
            : "Copy email"}
      </button>
      <span className="sr-only" role="status" aria-live="polite">
        {status === "copied" ? "Email copied to clipboard" : ""}
        {status === "error" ? "Could not copy the email" : ""}
      </span>
    </>
  );
}

function Overview({ summary, steps, go }) {
  const doneCount = steps.filter((s) => s.done).length;
  const percent = Math.round((doneCount / steps.length) * 100);
  const nextStep = steps.find((s) => !s.done);

  const stats = [
    summary.memberDays != null && {
      icon: CalendarDays,
      label: "Days as a member",
      value: summary.memberDays,
      detail: `Since ${summary.memberSince}`,
    },
    {
      icon: KeyRound,
      label: "Sign-in methods",
      value: summary.providers.length,
      detail: summary.providers.join(", ") || "None",
    },
    {
      icon: Mail,
      label: "Email status",
      value: summary.emailVerified ? "Verified" : "Not verified",
      detail: summary.email,
    },
  ].filter(Boolean);

  const quickActions = [
    {
      tab: "profile",
      icon: UserRound,
      title: "Edit profile",
      text: "Update the name shown on your account.",
    },
    {
      tab: "security",
      icon: ShieldCheck,
      title: "Security and sessions",
      text: "Review your sign-in and manage devices.",
    },
    {
      tab: "help",
      icon: LifeBuoy,
      title: "Get help",
      text: "Answers to common account questions.",
    },
  ];

  function onNext() {
    if (!nextStep) return;
    if (nextStep.target === "verify") {
      document
        .getElementById("verify")
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
    } else if (nextStep.target) {
      go(nextStep.target);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Identity */}
      <Rise i={0}>
        <div className="border-border bg-card flex flex-col gap-5 rounded-2xl border p-5 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <span
              aria-hidden="true"
              className="bg-primary text-primary-foreground font-heading flex size-14 shrink-0 items-center justify-center rounded-2xl text-lg font-semibold"
            >
              {summary.initials}
            </span>
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <p className="font-heading truncate text-lg font-semibold tracking-tight">
                {summary.name || "Add your name"}
              </p>
              <p className="text-muted-foreground truncate text-sm">
                {summary.email}
              </p>
            </div>
            <CopyEmailButton email={summary.email} />
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant={summary.emailVerified ? "secondary" : "outline"}>
              {summary.emailVerified ? "Email verified" : "Email not verified"}
            </Badge>
            {summary.providers.map((name) => (
              <Badge key={name} variant="outline">
                {name}
              </Badge>
            ))}
          </div>
        </div>
      </Rise>

      {/* Stats (sab real account data se) */}
      <Rise i={1}>
        <dl className="grid gap-4 sm:grid-cols-3">
          {stats.map(({ icon: Icon, label, value, detail }) => (
            <div
              key={label}
              className="border-border bg-card flex min-w-0 flex-col gap-2 rounded-2xl border p-5"
            >
              <dt className="text-muted-foreground flex items-center gap-2 text-xs">
                <Icon aria-hidden="true" className="size-3.5" />
                {label}
              </dt>
              <dd className="font-heading text-2xl font-semibold tracking-tight tabular-nums">
                {value}
              </dd>
              <dd className="text-muted-foreground truncate text-xs">
                {detail}
              </dd>
            </div>
          ))}
        </dl>
      </Rise>

      {/* Setup */}
      <Rise i={2}>
        <Card>
          <CardHeader>
            <CardTitle>
              <SectionTitle icon={ShieldCheck}>Account setup</SectionTitle>
            </CardTitle>
            <CardDescription>
              {percent === 100
                ? "All set. Your account is fully set up."
                : `${percent}% complete · ${doneCount} of ${steps.length} steps done`}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            <ProgressBar value={percent} label="Account setup progress" />
            <ul className="flex flex-col gap-1">
              {steps.map((step) => (
                <li
                  key={step.id}
                  className="flex min-h-11 items-center justify-between gap-3 text-sm"
                >
                  <span className="flex items-center gap-3">
                    {step.done ? (
                      <CheckCircle2
                        aria-hidden="true"
                        className="text-primary size-5 shrink-0"
                      />
                    ) : (
                      <Circle
                        aria-hidden="true"
                        className="text-muted-foreground size-5 shrink-0"
                      />
                    )}
                    {step.label}
                  </span>
                  <Badge variant={step.done ? "secondary" : "outline"}>
                    {step.done ? "Done" : "To do"}
                  </Badge>
                </li>
              ))}
            </ul>
            {nextStep?.target ? (
              <button
                type="button"
                onClick={onNext}
                className={buttonPrimary()}
              >
                Next: {nextStep.label.toLowerCase()}
                <ArrowRight
                  aria-hidden="true"
                  className="size-4 transition-transform duration-200 group-hover:translate-x-0.5 motion-reduce:transition-none"
                />
              </button>
            ) : null}
          </CardContent>
        </Card>
      </Rise>

      {/* Quick actions */}
      <Rise i={3}>
        <ul className="grid gap-4 sm:grid-cols-3">
          {quickActions.map(({ tab, icon: Icon, title, text }) => (
            <li key={tab}>
              <button
                type="button"
                onClick={() => go(tab)}
                className="group border-border bg-card hover:border-primary/40 focus-visible:ring-ring flex h-full w-full flex-col items-start gap-3 rounded-2xl border p-5 text-left outline-none transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 motion-reduce:transition-none"
              >
                <span
                  aria-hidden="true"
                  className="bg-primary/10 text-primary flex size-10 items-center justify-center rounded-lg"
                >
                  <Icon className="size-5" />
                </span>
                <span className="flex flex-col gap-1">
                  <span className="font-medium">{title}</span>
                  <span className="text-muted-foreground text-sm leading-6">
                    {text}
                  </span>
                </span>
                <ArrowRight
                  aria-hidden="true"
                  className="text-muted-foreground mt-auto size-4 transition-transform duration-200 group-hover:translate-x-1 motion-reduce:transition-none"
                />
              </button>
            </li>
          ))}
        </ul>
      </Rise>
    </div>
  );
}

/* ----------------------------- Profile ----------------------------- */

function ProfilePanel({ summary, profileForm }) {
  return (
    <div className="flex flex-col gap-6">
      <Rise i={0}>
        <Card>
          <CardHeader>
            <CardTitle>
              <SectionTitle icon={UserRound}>Profile</SectionTitle>
            </CardTitle>
            <CardDescription>
              This name is shown on your account.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-6">
            <dl className="border-border bg-muted/40 grid gap-4 rounded-xl border p-4 text-sm sm:grid-cols-3">
              <div className="flex min-w-0 flex-col gap-1">
                <dt className="text-muted-foreground text-xs">Email</dt>
                <dd className="truncate font-medium">{summary.email}</dd>
              </div>
              <div className="flex flex-col gap-1">
                <dt className="text-muted-foreground text-xs">
                  Signed in with
                </dt>
                <dd className="font-medium">
                  {summary.providers.join(", ") || "—"}
                </dd>
              </div>
              <div className="flex flex-col gap-1">
                <dt className="text-muted-foreground text-xs">Member since</dt>
                <dd className="font-medium">{summary.memberSince}</dd>
              </div>
            </dl>
            {profileForm}
          </CardContent>
        </Card>
      </Rise>
    </div>
  );
}

/* ----------------------------- Security ----------------------------- */

function SecurityPanel({ summary, passwordForm, sessions }) {
  const checks = [
    {
      label: "Email address verified",
      done: summary.emailVerified,
      hint: summary.emailVerified
        ? "Your email can be used for account recovery."
        : "Verify your email so you can recover access.",
    },
    summary.hasPassword && {
      label: "Password sign-in is set up",
      done: true,
      hint: "Change it regularly and never reuse it elsewhere.",
    },
    !summary.hasPassword && {
      label: "Sign-in is managed by your provider",
      done: true,
      hint: `You sign in with ${summary.providers.join(", ") || "a provider"}.`,
    },
  ].filter(Boolean);
  const passed = checks.filter((c) => c.done).length;

  return (
    <div className="flex flex-col gap-6">
      <Rise i={0}>
        <Card>
          <CardHeader>
            <CardTitle>
              <SectionTitle icon={ShieldCheck}>Security checklist</SectionTitle>
            </CardTitle>
            <CardDescription>
              {passed} of {checks.length} checks passed
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="flex flex-col gap-4">
              {checks.map((check) => (
                <li key={check.label} className="flex items-start gap-3">
                  {check.done ? (
                    <CheckCircle2
                      aria-hidden="true"
                      className="text-primary mt-0.5 size-5 shrink-0"
                    />
                  ) : (
                    <Circle
                      aria-hidden="true"
                      className="text-muted-foreground mt-0.5 size-5 shrink-0"
                    />
                  )}
                  <div className="flex flex-col gap-0.5 text-sm">
                    <span className="font-medium">
                      {check.label}
                      <span className="sr-only">
                        {check.done ? " (passed)" : " (action needed)"}
                      </span>
                    </span>
                    <span className="text-muted-foreground">{check.hint}</span>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </Rise>

      {passwordForm ? (
        <Rise i={1}>
          <Card>
            <CardHeader>
              <CardTitle>
                <SectionTitle icon={KeyRound}>Change password</SectionTitle>
              </CardTitle>
              <CardDescription>
                Your other devices will be signed out automatically.
              </CardDescription>
            </CardHeader>
            <CardContent>{passwordForm}</CardContent>
          </Card>
        </Rise>
      ) : null}

      <Rise i={2}>
        <Card>
          <CardHeader>
            <CardTitle>
              <SectionTitle icon={LogOut}>Sessions</SectionTitle>
            </CardTitle>
            <CardDescription>Manage where you are signed in.</CardDescription>
          </CardHeader>
          <CardContent>{sessions}</CardContent>
        </Card>
      </Rise>

      <Rise i={3}>
        <div className="border-border bg-muted/40 rounded-2xl border p-5 sm:p-6">
          <h3 className="font-heading text-base font-semibold">
            Stay safe online
          </h3>
          <ul className="mt-3 flex flex-col gap-2.5">
            {SECURITY_TIPS.map((tip) => (
              <li key={tip} className="flex items-start gap-2.5 text-sm">
                <span
                  aria-hidden="true"
                  className="bg-primary mt-2 size-1.5 shrink-0 rounded-full"
                />
                <span className="text-foreground/85 leading-6">{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      </Rise>
    </div>
  );
}

/* ------------------------------- Help ------------------------------- */

function HelpPanel({ contactHref }) {
  return (
    <div className="flex flex-col gap-6">
      <Rise i={0}>
        <div className="flex flex-col gap-2">
          <h2 className="font-heading text-xl font-semibold tracking-tight">
            Account questions
          </h2>
          <p className="text-muted-foreground leading-7">
            Quick answers about your profile, email and security.
          </p>
        </div>
      </Rise>
      <Rise i={1}>
        <FaqAccordion items={FAQS} />
      </Rise>
      <Rise i={2}>
        <div className="border-border bg-card flex flex-col gap-4 rounded-2xl border p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div className="flex flex-col gap-1">
            <p className="font-medium">Still need help?</p>
            <p className="text-muted-foreground text-sm leading-6">
              Send a message and describe what happened.
            </p>
          </div>
          <a href={contactHref} className={buttonPrimary()}>
            Contact me
            <ArrowRight
              aria-hidden="true"
              className="size-4 transition-transform duration-200 group-hover:translate-x-0.5 motion-reduce:transition-none"
            />
          </a>
        </div>
      </Rise>
    </div>
  );
}

/* ----------------------------- Workspace ----------------------------- */

/**
 * summary: serializable account data (server page se)
 * steps: [{ id, label, done, target: "profile" | "verify" | null }]
 * verifyBanner / profileForm / passwordForm / sessions: server se aaye React nodes
 */
export function AccountWorkspace({
  summary,
  steps,
  verifyBanner = null,
  profileForm,
  passwordForm = null,
  sessions,
  contactHref = "/contact",
}) {
  const reduce = useReducedMotion();
  const [view, setView] = useState({ tab: "overview", dir: 1 });
  const tabRefs = useRef({});
  const tablistRef = useRef(null);

  const index = TAB_IDS.indexOf(view.tab);

  function go(id, { focus = false } = {}) {
    if (!TAB_IDS.includes(id) || id === view.tab) return;
    const dir = TAB_IDS.indexOf(id) > index ? 1 : -1;
    setView({ tab: id, dir });
    window.history.replaceState(null, "", `#${id}`);

    if (focus) tabRefs.current[id]?.focus();

    // Agar tabs screen se upar nikal gaye hon to wapas dikhao
    const top = tablistRef.current?.getBoundingClientRect().top ?? 0;
    if (top < 0) {
      tablistRef.current?.scrollIntoView({
        behavior: reduce ? "auto" : "smooth",
        block: "start",
      });
    }
  }

  // /account#security jaise links se seedha tab kholo
  useEffect(() => {
    const id = window.location.hash.replace("#", "");
    if (TAB_IDS.includes(id) && id !== "overview") {
      setView({ tab: id, dir: 1 });
    }
  }, []);

  function onKeyDown(event) {
    const keys = ["ArrowRight", "ArrowLeft", "Home", "End"];
    if (!keys.includes(event.key)) return;
    event.preventDefault();
    let next = index;
    if (event.key === "ArrowRight") next = (index + 1) % TABS.length;
    if (event.key === "ArrowLeft")
      next = (index - 1 + TABS.length) % TABS.length;
    if (event.key === "Home") next = 0;
    if (event.key === "End") next = TABS.length - 1;
    go(TABS[next].id, { focus: true });
  }

  // Mobile par swipe (sirf touch, taake text select karna disturb na ho)
  function onPanEnd(event, info) {
    if (event.pointerType !== "touch") return;
    const { x, y } = info.offset;
    if (Math.abs(x) < 80 || Math.abs(x) < Math.abs(y) * 1.5) return;
    const target = TABS[index + (x < 0 ? 1 : -1)];
    if (target) go(target.id);
  }

  const custom = { dir: view.dir, reduce: Boolean(reduce) };
  const prev = TABS[index - 1];
  const next = TABS[index + 1];

  return (
    <div className="flex min-w-0 flex-col gap-6">
      {verifyBanner ? (
        <div id="verify" className="scroll-mt-24">
          {verifyBanner}
        </div>
      ) : null}

      <LayoutGroup id="account-tabs">
        <div
          ref={tablistRef}
          role="tablist"
          aria-label="Account sections"
          onKeyDown={onKeyDown}
          className="bg-muted -mx-4 flex scroll-mt-24 gap-1 overflow-x-auto rounded-none p-1 sm:mx-0 sm:rounded-xl"
        >
          {TABS.map(({ id, label, icon: Icon }) => {
            const selected = view.tab === id;
            return (
              <button
                key={id}
                ref={(node) => {
                  tabRefs.current[id] = node;
                }}
                type="button"
                role="tab"
                id={`account-tab-${id}`}
                aria-selected={selected}
                aria-controls={`account-panel-${id}`}
                tabIndex={selected ? 0 : -1}
                onClick={() => go(id)}
                className={`focus-visible:ring-ring relative flex min-h-11 flex-1 shrink-0 items-center justify-center gap-2 rounded-lg px-4 text-sm font-medium outline-none transition-colors focus-visible:ring-2 motion-reduce:transition-none ${
                  selected
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {selected ? (
                  <motion.span
                    layoutId="account-tab-indicator"
                    aria-hidden="true"
                    className="bg-background absolute inset-0 rounded-lg shadow-sm ring-1 ring-black/5 dark:ring-white/10"
                    transition={
                      reduce
                        ? { duration: 0 }
                        : { type: "spring", stiffness: 420, damping: 36 }
                    }
                  />
                ) : null}
                <Icon aria-hidden="true" className="relative z-10 size-4" />
                <span className="relative z-10">{label}</span>
              </button>
            );
          })}
        </div>
      </LayoutGroup>

      <motion.div
        onPanEnd={onPanEnd}
        style={{ touchAction: "pan-y" }}
        className="-mx-1 overflow-x-clip px-1"
      >
        <AnimatePresence mode="wait" initial={false} custom={custom}>
          <motion.div
            key={view.tab}
            custom={custom}
            variants={slide}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: reduce ? 0.01 : 0.32, ease: EASE }}
            role="tabpanel"
            id={`account-panel-${view.tab}`}
            aria-labelledby={`account-tab-${view.tab}`}
            tabIndex={0}
            className="focus-visible:ring-ring rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
          >
            {view.tab === "overview" ? (
              <Overview summary={summary} steps={steps} go={go} />
            ) : null}
            {view.tab === "profile" ? (
              <ProfilePanel summary={summary} profileForm={profileForm} />
            ) : null}
            {view.tab === "security" ? (
              <SecurityPanel
                summary={summary}
                passwordForm={passwordForm}
                sessions={sessions}
              />
            ) : null}
            {view.tab === "help" ? (
              <HelpPanel contactHref={contactHref} />
            ) : null}
          </motion.div>
        </AnimatePresence>
      </motion.div>

      {/* Previous / Next section */}
      <nav
        aria-label="Section navigation"
        className="border-border flex items-center justify-between gap-3 border-t pt-5"
      >
        {prev ? (
          <button
            type="button"
            onClick={() => go(prev.id)}
            className="group text-muted-foreground hover:text-foreground focus-visible:ring-ring inline-flex min-h-11 items-center gap-2 rounded-lg px-2 text-sm font-medium outline-none transition-colors focus-visible:ring-2 motion-reduce:transition-none"
          >
            <ArrowLeft
              aria-hidden="true"
              className="size-4 transition-transform duration-200 group-hover:-translate-x-0.5 motion-reduce:transition-none"
            />
            {prev.label}
          </button>
        ) : (
          <span />
        )}
        {next ? (
          <button
            type="button"
            onClick={() => go(next.id)}
            className="group text-muted-foreground hover:text-foreground focus-visible:ring-ring inline-flex min-h-11 items-center gap-2 rounded-lg px-2 text-sm font-medium outline-none transition-colors focus-visible:ring-2 motion-reduce:transition-none"
          >
            {next.label}
            <ArrowRight
              aria-hidden="true"
              className="size-4 transition-transform duration-200 group-hover:translate-x-0.5 motion-reduce:transition-none"
            />
          </button>
        ) : (
          <span />
        )}
      </nav>
    </div>
  );
}
