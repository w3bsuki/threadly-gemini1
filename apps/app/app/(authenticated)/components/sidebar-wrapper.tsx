import { isAdmin } from '@/lib/auth/admin';
import { GlobalSidebar } from './sidebar';

export async function SidebarWrapper({ children }: { children: React.ReactNode }) {
  const isUserAdmin = await isAdmin();
  
  return <GlobalSidebar isAdmin={isUserAdmin}>{children}</GlobalSidebar>;
}