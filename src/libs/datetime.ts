// DD-MM-YYYY + HH:mm (24h) -> ISO string in IST (+05:30)
// Example: toIsoIST("13-05-2026", "21:45") -> "2026-05-13T21:45:00+05:30"
export function toIsoIST(dateDDMMYYYY: string, time = "00:00"): string {
  const [day, month, year] = dateDDMMYYYY.split("-");
  return `${year}-${month}-${day}T${time}:00+05:30`;
}

// ISO timestamp -> "DD-MM-YYYY"
export function fromIsoToDDMMYYYY(iso: string): string {
  const d = new Date(iso);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `${dd}-${mm}-${d.getFullYear()}`;
}
