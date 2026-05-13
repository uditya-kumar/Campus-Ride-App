import { Redirect } from 'expo-router';
import { useAuth } from '../providers/AuthProvider';
import { ActivityIndicator, View } from 'react-native';

// This route catches the root path ("/") and immediately redirects the user
// to our intended initial screen. Adjust the destination as needed.
export default function Index() {
  const { session, loading } = useAuth();

  if (loading) {
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