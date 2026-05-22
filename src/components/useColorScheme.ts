import { useColorScheme as useRNColorScheme } from "react-native";

// RN's ColorSchemeName is "light" | "dark" | "unspecified" | null. Treat
// "unspecified" as null at the boundary so call sites can keep `?? "light"`.
export function useColorScheme(): "light" | "dark" | null {
  const scheme = useRNColorScheme();
  return scheme === "light" || scheme === "dark" ? scheme : null;
}
