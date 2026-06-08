// A creator can only restrict a ride to their own gender (or leave it open to
// both). The full set is kept for reference; the per-creator options come from
// genderPreferenceOptionsFor().
export const genderPreferenceOptions = ["Both", "Male Only", "Female Only"];

export function genderPreferenceOptionsFor(gender: string | null | undefined) {
  if (gender === "male") return ["Both", "Male Only"];
  if (gender === "female") return ["Both", "Female Only"];
  return ["Both"];
}
