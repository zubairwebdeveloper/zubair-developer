import { Button } from "@/components/ui/button";

export function SuggestedPrompts({ prompts, onPick, disabled }) {
  if (!prompts?.length) return null;

  return (
    <div className="flex flex-col gap-2 pl-9">
      <p className="text-xs font-medium text-muted-foreground">Try asking</p>
      <div
        role="group"
        aria-label="Suggested questions"
        className="flex flex-wrap gap-2"
      >
        {prompts.map((prompt, index) => (
          <Button
            key={prompt}
            type="button"
            size="sm"
            variant="outline"
            disabled={disabled}
            onClick={() => onPick(prompt)}
            style={{ animationDelay: `${index * 60}ms` }}
            className="h-auto max-w-full rounded-full border-primary/25 bg-background px-3.5 py-1.5 text-left text-sm font-normal leading-snug whitespace-normal transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/60 hover:bg-primary/5 hover:text-primary active:translate-y-0 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-1 motion-safe:fill-mode-backwards motion-reduce:transition-none motion-reduce:hover:translate-y-0"
          >
            {prompt}
          </Button>
        ))}
      </div>
    </div>
  );
}
