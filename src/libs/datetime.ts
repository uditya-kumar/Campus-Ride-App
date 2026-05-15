// Storage format:    ISO string with explicit IST offset, e.g. "2026-05-15T21:45:00+05:30"
// Filter wire format: "DD-MM-YYYY"
// Display strings:    pinned to en-GB so they don't drift with device locale.

const IST_OFFSET = "+05:30";

const displayDateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "2-digit",
});

const displayDateNumericFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "2-digit",
  year: "2-digit",
});

const displayTimeFormatter = new Intl.DateTimeFormat("en-GB", {
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

// --- Conversions ---

// "DD-MM-YYYY" -> Date
// e.g. "15-05-2026" -> Date(2026, 4, 15)
export function parseDDMMYYYY(s: string): Date {
  const [day, month, year] = s.split("-").map(Number);
  return new Date(year, month - 1, day);
}

// Date -> "DD-MM-YYYY"
// e.g. Date(2026, 4, 15) -> "15-05-2026"
export function toDDMMYYYY(d: Date): string {
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `${dd}-${mm}-${d.getFullYear()}`;
}

// "DD-MM-YYYY" (+ optional "HH:mm") -> ISO string with IST offset
// e.g. ("15-05-2026", "21:45") -> "2026-05-15T21:45:00+05:30"
export function toIsoIST(dateDDMMYYYY: string, time = "00:00"): string {
  const [day, month, year] = dateDDMMYYYY.split("-");
  return `${year}-${month}-${day}T${time}:00${IST_OFFSET}`;
}

// ISO string -> "DD-MM-YYYY"
// e.g. "2026-05-15T21:45:00+05:30" -> "15-05-2026"
export function fromIsoToDDMMYYYY(iso: string): string {
  return toDDMMYYYY(new Date(iso));
}

// "DD-MM-YYYY" -> { start, end } as IST ISO strings covering that whole day
// e.g. "15-05-2026" -> { start: "2026-05-15T00:00:00+05:30", end: "2026-05-15T23:59:00+05:30" }
export function dayRangeIST(dateDDMMYYYY: string): {
  start: string;
  end: string;
} {
  return {
    start: toIsoIST(dateDDMMYYYY, "00:00"),
    end: toIsoIST(dateDDMMYYYY, "23:59"),
  };
}

// --- Display ---

// ISO string -> "DD MMM YY"
// e.g. "2026-05-15T21:45:00+05:30" -> "15 May 26"
export function formatDisplayDate(iso: string): string {
  return displayDateFormatter.format(new Date(iso));
}

// Date -> "DD/MM/YY"
// e.g. Date(2026, 4, 15) -> "15/05/26"
export function formatDisplayDateNumeric(d: Date): string {
  return displayDateNumericFormatter.format(d);
}

// ISO string -> "HH:mm" (24h)
// e.g. "2026-05-15T21:45:00+05:30" -> "21:45"
export function formatDisplayTime(iso: string): string {
  return displayTimeFormatter.format(new Date(iso));
}
