import type { ReactNode } from 'react';

type AppLayoutProperties = {
  readonly children: ReactNode;
};

// EMERGENCY BYPASS - Skip ALL layout logic in production
const AuthenticatedLayout = ({ children }: AppLayoutProperties) => {
  return <>{children}</>;
};

export default AuthenticatedLayout;