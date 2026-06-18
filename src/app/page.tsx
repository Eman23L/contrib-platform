import { redirect } from "next/navigation";

import { UnifiedSignInCard } from "@/components/auth/UnifiedSignInCard";
import { getAuthenticatedServerUser } from "@/lib/supabase/server";

const ADMIN_PATH = "/admin?org=grace-community";
const GUEST_PATH = "/o/grace-community";

export default async function HomePage() {
  const authenticatedUser = await getAuthenticatedServerUser();

  if (authenticatedUser) {
    redirect(ADMIN_PATH);
  }

  return (
    <main className="gf-page">
      <div className="gf-shell max-w-lg">
        <UnifiedSignInCard guestHref={GUEST_PATH} nextPath={ADMIN_PATH} />
      </div>
    </main>
  );
}
