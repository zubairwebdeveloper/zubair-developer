import { cn } from "@/lib/utils/cn";

import { Container } from "./Container";

export function Section({ className, containerClassName, children, ...props }) {
  return (
    <section className={cn("py-16 md:py-24", className)} {...props}>
      <Container className={containerClassName}>{children}</Container>
    </section>
  );
}
