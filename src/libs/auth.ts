import { supabase } from "@/libs/supabase";
import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import { unregisterPushNotifications } from "@/libs/pushNotifications";

export async function signOut() {
  // Drop this device's push token row first — RLS requires the session,
  // so it has to happen before supabase.auth.signOut().
  try {
    await unregisterPushNotifications();
  } catch (err) {
    if (__DEV__) console.warn("push deregistration failed:", err);
  }
  return supabase.auth.signOut();
}

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

  // Supabase returns tokens in the URL fragment on success
  // (#access_token=...&refresh_token=...) and errors in either the fragment or
  // the query string (?error=...&error_description=...). When the auth.users
  // BEFORE INSERT trigger rejects an email, GoTrue wraps the RAISE EXCEPTION
  // as "Database error saving new user", so we don't surface that raw — we
  // show a friendly message since the trigger is the only realistic cause.
  const [, fragment = ""] = result.url.split("#");
  const queryString = result.url.split("?")[1]?.split("#")[0] ?? "";
  const fragmentParams = new URLSearchParams(fragment);
  const queryParams = new URLSearchParams(queryString);

  const access_token = fragmentParams.get("access_token");
  const refresh_token = fragmentParams.get("refresh_token");
  if (!access_token || !refresh_token) {
    const hasError =
      fragmentParams.get("error") ??
      fragmentParams.get("error_description") ??
      queryParams.get("error") ??
      queryParams.get("error_description");
    if (hasError) {
      throw new Error("Login using VIT Bhopal email");
    }
    throw new Error("Sign-in succeeded but no session was returned");
  }

  const { error: setErr } = await supabase.auth.setSession({
    access_token,
    refresh_token,
  });
  if (setErr) throw setErr;
  return null;
}
