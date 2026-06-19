import { redirect } from "next/navigation";

import { UnifiedSignInCard } from "@/components/auth/UnifiedSignInCard";
import { listAdminMembershipsForUser } from "@/lib/db/queries/memberships";
import {
  createServerSupabaseUserClient,
  getAuthenticatedServerUser,
} from "@/lib/supabase/server";

const ADMIN_PATH = "/admin?org=grace-community";
const PUBLIC_GIVING_PATH = "/o/grace-community/give";

export default async function HomePage() {
  const authenticatedUser = await getAuthenticatedServerUser();

  if (authenticatedUser) {
    const supabase = createServerSupabaseUserClient(authenticatedUser.accessToken);
    const memberships = await listAdminMembershipsForUser(
      supabase,
      authenticatedUser.user.id,
    );

    redirect(memberships.length > 0 ? ADMIN_PATH : PUBLIC_GIVING_PATH);
  }

  return (
    <main className="gf-page">
      <div className="gf-shell max-w-lg">
        <UnifiedSignInCard
          adminNextPath={ADMIN_PATH}
          guestHref={PUBLIC_GIVING_PATH}
          publicNextPath={PUBLIC_GIVING_PATH}
        />
      </div>
    </main>
  );
}
