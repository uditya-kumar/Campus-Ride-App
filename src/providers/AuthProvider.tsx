import { createContext, use, useEffect, useRef, useState } from "react";
import type { PropsWithChildren } from "react";
import type { Session } from "@supabase/supabase-js";
import { AppState } from "react-native";
import { usePostHog } from "posthog-react-native";
import { supabase } from "@/libs/supabase";
import { registerForPushNotifications } from "@/libs/pushNotifications";

type AuthCtx = {
  session: Session | null;
  loading: boolean;
  signingIn: boolean;
  setSigningIn: (v: boolean) => void;
};

const AuthContext = createContext<AuthCtx>({
  session: null,
  loading: true,
  signingIn: false,
  setSigningIn: () => {},
});

export function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [signingIn, setSigningIn] = useState(false);
  const posthog = usePostHog();
  const lastIdentifiedId = useRef<string | null>(null);

  useEffect(() => {
    // onAuthStateChange is the single source of truth for `session`. It fires
    // synchronously on subscribe with the initial session (INITIAL_SESSION
    // event), and again on every later change. getSession() only flips the
    // initial loading flag — its data is ignored to avoid racing with the
    // subscription.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      // Once a session lands, the deep-link sign-in race is over.
      if (newSession) setSigningIn(false);
    });

    supabase.auth.getSession().then(() => setLoading(false));

    // Toggle the access-token auto-refresh based on app foreground state.
    // Lives here (not in libs/supabase.ts) so the listener gets cleaned up.
    const appStateSub = AppState.addEventListener("change", (next) => {
      if (next === "active") supabase.auth.startAutoRefresh();
      else supabase.auth.stopAutoRefresh();
    });

    return () => {
      subscription.unsubscribe();
      appStateSub.remove();
    };
  }, []);

  useEffect(() => {
    const userId = session?.user.id;
    if (!userId) return;
    registerForPushNotifications(userId).catch((err) => {
      if (__DEV__) console.warn("push registration failed:", err);
    });
  }, [session?.user.id]);

  useEffect(() => {
    if (!posthog) return;
    const user = session?.user;
    if (user) {
      if (lastIdentifiedId.current === user.id) return;
      lastIdentifiedId.current = user.id;
      const meta = user.user_metadata ?? {};
      const properties: Record<string, string | number | boolean> = {
        created_at: user.created_at,
      };
      if (user.email) properties.email = user.email;
      const name = (meta.full_name ?? meta.name) as string | undefined;
      if (name) properties.name = name;
      if (typeof meta.avatar_url === "string")
        properties.avatar_url = meta.avatar_url;
      posthog.identify(user.id, properties);
    } else if (lastIdentifiedId.current) {
      lastIdentifiedId.current = null;
      posthog.reset();
    }
  }, [posthog, session?.user]);

  return (
    <AuthContext.Provider value={{ session, loading, signingIn, setSigningIn }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => use(AuthContext);
