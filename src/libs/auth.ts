import { supabase } from "@/libs/supabase";
import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";

export const signOut = () => supabase.auth.signOut();

export const getSession = () => supabase.auth.getSession();

// Google OAuth via Supabase's hosted callback. The flow:
//  1. Ask Supabase for an authorize URL (skipBrowserRedirect: true keeps it local).
//  2. Open it in an in-process auth session that listens for our `karpool://`
//     redirect (same in-app browser experience as the About DEV link).
//  3. Parse access/refresh tokens out of the returned URL fragment and hand
//     them to setSession — AuthProvider's onAuthStateChange picks it up.
export async function googleSignIn() {
  const redirectTo = Linking.createURL("/");

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo, skipBrowserRedirect: true },
  });
  if (error) throw error;
  if (!data?.url) throw new Error("Could not start Google sign-in");

  const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo, {
    createTask: false,
  });
  if (result.type !== "success" || !result.url) {
    // User dismissed the sheet or canceled in Google — nothing to do.
    return null;
  }

  // Supabase returns tokens in the URL fragment (#access_token=...&refresh_token=...).
  const fragment = result.url.split("#")[1] ?? "";
  const params = new URLSearchParams(fragment);
  const access_token = params.get("access_token");
  const refresh_token = params.get("refresh_token");
  if (!access_token || !refresh_token) {
    throw new Error("Sign-in succeeded but no session was returned");
  }

  const { error: setErr } = await supabase.auth.setSession({
    access_token,
    refresh_token,
  });
  if (setErr) throw setErr;
  return null;
}
