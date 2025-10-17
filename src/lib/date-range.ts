export type DateRange = "7d" | "30d" | "90d" | "1y" | "all";

export function rangeKeyToDateRange(key: DateRange): { from: string; to: string } {
  if (key === "all") return getDefaultDateRange("1y");
  return getDefaultDateRange(key);
}

function getDefaultDateRange(range: Exclude<DateRange, "all"> = "30d"): { from: string; to: string } {
  const MS_PER_MINUTE = 60_000;
  const to = new Date();
  const from = new Date(to);
  const DAYS_7_INCLUSIVE_OFFSET = 6;
  const DAYS_30_INCLUSIVE_OFFSET = 29;
  const DAYS_90_INCLUSIVE_OFFSET = 89;
  switch (range) {
    case "7d":
      from.setDate(to.getDate() - DAYS_7_INCLUSIVE_OFFSET);
      break;
    case "90d":
      from.setDate(to.getDate() - DAYS_90_INCLUSIVE_OFFSET);
      break;
    case "1y":
      from.setFullYear(to.getFullYear() - 1);
      break;
    default:
      from.setDate(to.getDate() - DAYS_30_INCLUSIVE_OFFSET);
  }
  const toISO = new Date(to.getTime() - to.getTimezoneOffset() * MS_PER_MINUTE)
    .toISOString()
    .split(".")[0] + "Z";
  const fromISO = new Date(from.getTime() - from.getTimezoneOffset() * MS_PER_MINUTE)
    .toISOString()
    .split(".")[0] + "Z";
  return { from: fromISO, to: toISO };
}
