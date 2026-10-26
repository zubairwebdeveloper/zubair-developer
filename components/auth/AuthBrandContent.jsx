"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  KeyRound,
  LockKeyhole,
  MailCheck,
  MonitorOff,
  Send,
  ShieldCheck,
  UserPlus,
  UserRoundCheck,
} from "lucide-react";

import {
  AUTH_ROUTES,
  FORWARD_SLIDES_LEFT_TO_RIGHT,
  getRouteIndex,
} from "./authRoutes";

/** Har route ka apna message. Keys `authRoutes.js` ke href se match hoti hain. */
const CONTENT = {
  "/login": {
    badge: "Secure account access",
    badgeIcon: ShieldCheck,
    title: "Welcome back. Your account, kept simple and secure.",
    description:
      "Sign in to manage your details and stay connected. Everything is designed to be quick to use and easy to control.",
    points: [
      { icon: KeyRound, text: "Sign in with Google or your email" },
      { icon: MailCheck, text: "Verified email and easy password reset" },
      { icon: MonitorOff, text: "Sign out of every device with one click" },
    ],
  },
  "/register": {
    badge: "New account",
    badgeIcon: UserPlus,
    title: "Create your account in under a minute.",
    description:
      "Start with Google or your email. You can update your details and manage your account whenever you need.",
    points: [
      { icon: KeyRound, text: "Sign up with Google or your email" },
      {
        icon: UserRoundCheck,
        text: "Verify your email to protect your account",
      },
      { icon: MonitorOff, text: "Stay in control of every signed-in device" },
    ],
  },
  "/forgot-password": {
    badge: "Account recovery",
    badgeIcon: LockKeyhole,
    title: "Locked out? Let's get you back in.",
    description:
      "Enter the email linked to your account and we will send you a link to choose a new password.",
    points: [
      { icon: Send, text: "A reset link is sent to your email" },
      { icon: LockKeyhole, text: "Choose a new password you can remember" },
      { icon: MonitorOff, text: "Review your signed-in devices afterwards" },
    ],
  },
};

const EASE = [0.22, 1, 0.36, 1];
const OFFSET = 40; // px

/**
 * Form jis taraf se aata hai, panel us se ULTI taraf se aata hai.
 * dir: +1 forward, -1 back.
 */
const variants = {
  enter: ({ dir, reduce }) => ({
    opacity: 0,
    x: reduce ? 0 : dir * (FORWARD_SLIDES_LEFT_TO_RIGHT ? 1 : -1) * OFFSET,
  }),
  center: { opacity: 1, x: 0 },
  exit: ({ dir, reduce }) => ({
    opacity: 0,
    x: reduce ? 0 : dir * (FORWARD_SLIDES_LEFT_TO_RIGHT ? -1 : 1) * OFFSET,
  }),
};

export function AuthBrandContent() {
  const pathname = usePathname();
  const reduce = useReducedMotion();

  const index = getRouteIndex(pathname);
  const href = AUTH_ROUTES[index].href;
  const content = CONTENT[href] ?? CONTENT["/login"];
  const BadgeIcon = content.badgeIcon;

  const previousIndex = useRef(index);
  const dir = index >= previousIndex.current ? 1 : -1;

  useEffect(() => {
    previousIndex.current = index;
  }, [index]);

  const custom = { dir, reduce: Boolean(reduce) };

  return (
    // min-h: content badalte waqt layout jump na ho
    <div className="relative min-h-[23rem] overflow-x-clip">
      <AnimatePresence mode="wait" initial={false} custom={custom}>
        <motion.div
          key={href}
          custom={custom}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: reduce ? 0.01 : 0.35, ease: EASE }}
          className="flex flex-col gap-8"
        >
          <div className="flex flex-col gap-5">
            <p className="inline-flex w-fit items-center gap-2 rounded-full border border-background/20 bg-background/5 px-3 py-1 text-xs font-medium text-background/80">
              <BadgeIcon className="size-3.5 text-primary" aria-hidden="true" />
              {content.badge}
            </p>

            <h2 className="text-balance font-heading text-[clamp(2rem,3vw,2.75rem)] font-semibold leading-[1.1] tracking-tight">
              {content.title}
            </h2>

            <p className="max-w-sm text-pretty text-[15px] leading-6 text-background/75">
              {content.description}
            </p>
          </div>

          <ul className="flex flex-col gap-4">
            {content.points.map(({ icon: Icon, text }, i) => (
              <motion.li
                key={text}
                initial={{ opacity: 0, y: reduce ? 0 : 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: reduce ? 0.01 : 0.4,
                  ease: EASE,
                  delay: reduce ? 0 : 0.12 + i * 0.08,
                }}
                className="flex items-center gap-3.5"
              >
                <span
                  aria-hidden="true"
                  className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-background/15 bg-background/5 text-primary"
                >
                  <Icon className="size-[18px]" />
                </span>
                <span className="text-[15px] leading-6 text-background/85">
                  {text}
                </span>
              </motion.li>
            ))}
          </ul>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
