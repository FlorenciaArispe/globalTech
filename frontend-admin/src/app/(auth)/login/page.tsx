// app/(auth)/login/page.tsx
import { Suspense } from 'react';
import LoginClient from './LoginClient';

export default function Page() {
  return (
    <Suspense>
      <LoginClient />
    </Suspense>
  );
}
