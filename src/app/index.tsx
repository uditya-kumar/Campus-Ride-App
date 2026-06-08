import { Redirect, type Href } from 'expo-router';
import { useAuth } from '@/providers/AuthProvider';
import { useProfile } from '@/hooks/useProfile';
import { ActivityIndicator, View } from 'react-native';

// This route catches the root path ("/") and immediately redirects the user
// to our intended initial screen. It's the always-mounted, unguarded fallback
// in the root stack — the Stack.Protected groups gate everything else, this
// just points the user at the right one.
export default function Index() {
  const { session, loading, signingIn } = useAuth();
  const { data: profile, isLoading: profileLoading } = useProfile();

  // Hold the spinner until we actually know where to send them:
  //  - `loading`/`signingIn`: auth state not settled. While `signingIn` the
  //    OAuth deep link has returned but onAuthStateChange hasn't fired — showing
  //    a spinner avoids a flash of /signin and back.
  //  - `session && profileLoading`: signed in but gender unknown, so we can't
  //    yet decide between onboarding and home.
  if (loading || signingIn || (session && profileLoading)) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large"/>
      </View>
    );
  }

  if (!session) {
    return <Redirect href={'/(auth)/signin'} />;
  }

  // Signed in but no gender (or no profile row yet) → finish onboarding first.
  if (!profile?.gender) {
    return <Redirect href={'/(onboarding)/gender' as Href} />;
  }

  return <Redirect href={'/(tabs)/home'} />;
}