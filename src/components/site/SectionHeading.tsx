import { clsx } from "clsx";

export function SectionHeading({
  kicker,
  title,
  description,
  align = "left",
  dark = false,
}: {
  kicker?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  dark?: boolean;
}) {
  return (
    <div className={clsx("max-w-2xl", align === "center" && "mx-auto text-center")}>
      {kicker && (
        <p className={clsx("text-sm font-medium mb-2", dark ? "text-rust" : "text-rust")}>{kicker}</p>
      )}
      <h2
        className={clsx(
          "font-display font-semibold text-4xl sm:text-5xl leading-[1.05]",
          dark ? "text-white" : "text-ink"
        )}
      >
        {title}
      </h2>
      {description && (
        <p className={clsx("mt-4 text-base leading-relaxed", dark ? "text-steel-light" : "text-steel")}>
          {description}
        </p>
      )}
    </div>
  );
}
