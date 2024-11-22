import ClientLayout from '@/components/layout/ClientLayout';
import { getClient } from '@/lib/client';

async function getSettings() {
  return await getClient().fetch(`*[_type == "siteSettings"][0]`);
}

export default async function ShopLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const settings = await getSettings();

  return (
    <>
      {children}
    </>
  );
}
