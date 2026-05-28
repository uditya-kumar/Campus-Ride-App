import { Redirect } from 'expo-router';
import { useAuth } from '@/providers/AuthProvider';
import { ActivityIndicator, View } from 'react-native';

// This route catches the root path ("/") and immediately redirects the user
// to our intended initial screen. Adjust the destination as needed.
export default function Index() {
  const { session, loading, signingIn } = useAuth();

  // While `signingIn` is true, the OAuth deep link has just returned but
  // onAuthStateChange hasn't fired yet — show a spinner instead of bouncing
  // to /signin and back, which causes a visible flash of the signin screen.
  if (loading || signingIn) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large"/>
      </View>
    );
  }

  if (session) {
    return <Redirect href={'/(tabs)/home'} />;
  }

  return <Redirect href={'/(auth)/signin'} />;
} 