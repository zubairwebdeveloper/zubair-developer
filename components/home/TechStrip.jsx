// components/home/TechStrip.jsx
import { Container } from "@/components/shared/Container";
import { getTechStack } from "@/services/content.service";

export async function TechStrip() {
  const stack = await getTechStack();

  if (!Array.isArray(stack) || stack.length === 0) return null;

  return (
    <section
      aria-labelledby="tech-strip-heading"
      className="border-y border-border/60 bg-muted/40 py-8 sm:py-10"
    >
      <Container>
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:gap-10">
          <p
            id="tech-strip-heading"
            className="text-eyebrow flex shrink-0 items-center gap-2 text-muted-foreground"
          >
            <span
              aria-hidden="true"
              className="size-1.5 rounded-full bg-primary shadow-[0_0_0_3px_hsl(var(--primary)/0.15)]"
            />
            Technologies I work with
          </p>

          <span
            aria-hidden="true"
            className="hidden h-6 w-px shrink-0 bg-border lg:block"
          />

          <ul className="flex flex-wrap gap-2 sm:gap-2.5">
            {stack.map((tech) => {
              const name = typeof tech === "string" ? tech : tech?.name;
              if (!name) return null;

              return (
                <li
                  key={name}
                  className="rounded-full border border-border bg-card px-3.5 py-1.5 font-heading text-sm font-medium text-foreground/90 transition-colors duration-200 hover:border-primary/40 hover:bg-primary/5 hover:text-foreground sm:text-base"
                >
                  {name}
                </li>
              );
            })}
          </ul>
        </div>
      </Container>
    </section>
  );
}
