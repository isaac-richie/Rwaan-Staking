import { cn } from "@/lib/utils/cn";

export function Section({
  title,
  description,
  children,
  className,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("flex flex-col gap-4 sm:gap-6 mobile-section-sep", className)}>
      <div className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold sm:text-xl">{title}</h2>
        {description ? (
          <p className="text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {children}
    </section>
  );
}
