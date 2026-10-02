import { useState } from "react";
import { cn } from "../../utils/cn";

const SIZES = {
  xs: "size-7 text-[10px]",
  sm: "size-9 text-[11px]",
  md: "size-11 text-xs",
  lg: "size-14 text-sm",
  xl: "size-20 text-lg",
};

const SHAPES = {
  circle: "rounded-full",
  rounded: "rounded-xl",
  square: "rounded-lg",
};

function initialsOf(name) {
  if (!name) return "?";
  return (
    name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase() || "?"
  );
}

function Avatar({
  src,
  name,
  size = "md",
  shape = "circle",
  className,
  ring = false,
}) {
  const [failed, setFailed] = useState(false);
  const showImage = Boolean(src) && !failed;

  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center overflow-hidden",
        "bg-surface-muted font-bold uppercase text-ink-subtle",
        SIZES[size],
        SHAPES[shape],
        ring && "ring-2 ring-white/70",
        className,
      )}
    >
      {showImage ? (
        <img
          src={src}
          alt={name || undefined}
          loading="lazy"
          decoding="async"
          onError={() => setFailed(true)}
          className="size-full object-cover"
        />
      ) : (
        <span aria-hidden={name ? undefined : "true"}>
          {initialsOf(name)}
        </span>
      )}
    </span>
  );
}

function TeamBadge({ src, name, shortName, size = "lg", className }) {
  const [failed, setFailed] = useState(false);
  const initials = (shortName || name || "?").slice(0, 3).toUpperCase();

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center overflow-hidden",
        "border border-line bg-surface font-black uppercase tracking-tight text-ink-muted",
        SIZES[size],
        "rounded-xl",
        className,
      )}
    >
      {src && !failed ? (
        <img
          src={src}
          alt={`${name ?? "Team"} logo`}
          loading="lazy"
          decoding="async"
          onError={() => setFailed(true)}
          className="size-full object-cover"
        />
      ) : (
        <span>{initials}</span>
      )}
    </span>
  );
}

export { Avatar, TeamBadge };
export default Avatar;