'use client';

import AuthScreen from '@/components/auth/AuthScreen';
import { useRouter, useSearchParams } from 'next/navigation';

export default function AuthRoute() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get('next');
  const role = searchParams.get('role') === 'owner' ? 'owner' : 'explorer';

  return (
    <AuthScreen
      initialRole={role}
      onLoginSuccess={(role) => {
        router.push(next || (role === 'owner' ? '/owner' : '/'));
      }}
    />
  );
}
