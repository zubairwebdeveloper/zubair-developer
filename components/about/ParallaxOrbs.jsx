"use client";

import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";

/** Background ke halke orbs jo scroll par alag speed se hilte hain. Sirf decoration. */
export function ParallaxOrbs() {
  const reduce = useReducedMotion();
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 900], [0, -140]);
  const y2 = useTransform(scrollY, [0, 900], [0, 90]);
  const rotate = useTransform(scrollY, [0, 900], [12, 60]);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
    >
      <motion.div
        style={reduce ? undefined : { y: y1 }}
        className="absolute -top-24 -right-24 size-80 rounded-full bg-primary/15 blur-3xl"
      />
      <motion.div
        style={reduce ? undefined : { y: y2 }}
        className="absolute top-1/2 -left-24 size-72 rounded-full bg-primary/10 blur-3xl"
      />
      <motion.div
        style={reduce ? undefined : { y: y2, rotate }}
        className="absolute right-[12%] bottom-10 hidden size-24 rounded-3xl border border-primary/20 lg:block"
      />
    </div>
  );
}
