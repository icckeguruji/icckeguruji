import { useEffect } from 'react';
import { useRouter } from 'expo-router';

// Old admin view completely replaced by unified student & admin tabs
export default function AdminRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/(tabs)');
  }, [router]);

  return null;
}
