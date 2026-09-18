'use client';

import type { ReactNode } from 'react';
import { DataProvider } from '@/components/DataProvider';

export default function Providers({ children }: { children: ReactNode }) {
  return <DataProvider>{children}</DataProvider>;
}
