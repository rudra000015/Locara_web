'use client';

import AuthScreen from '@/components/auth/AuthScreen';
import { useRouter } from 'next/navigation';

export default function AuthRoute() {
  const router = useRouter();

  return (
    <AuthScreen
      onLoginSuccess={(role) => {
        router.push(role === 'owner' ? '/owner' : '/');
      }}
    />
  );
}
