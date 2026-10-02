function collect(value, out) {
  if (!value) return;
  if (typeof value === "string" || typeof value === "number") {
    out.push(String(value));
    return;
  }
  if (Array.isArray(value)) {
    for (const item of value) collect(item, out);
    return;
  }
  if (typeof value === "object") {
    for (const [key, enabled] of Object.entries(value)) {
      if (enabled) out.push(key);
    }
  }
}

export function cn(...args) {
  const out = [];
  collect(args, out);
  return out.join(" ");
}

export default cn;