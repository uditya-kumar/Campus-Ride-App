import { createContext, useContext, useEffect, useState } from "react";
import type { PropsWithChildren } from "react";
import type { Session } from "@supabase/supabase-js";
import { AppState } from "react-native";
import { supabase } from "@/libs/supabase";

type AuthCtx = { session: Session | null; loading: boolean };

const AuthContext = createContext<AuthCtx>({ session: null, loading: true });

export function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

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

  return (
    <AuthContext.Provider value={{ session, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
