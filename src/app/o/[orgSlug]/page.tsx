import { notFound } from "next/navigation";

import { UnifiedSignInCard } from "@/components/auth/UnifiedSignInCard";
import { getPublicOrganisation } from "@/lib/services/public/getPublicOrganisation";

type OrganisationLandingPageProps = {
  params: Promise<{ orgSlug: string }>;
};

export default async function OrganisationLandingPage({
  params,
}: OrganisationLandingPageProps) {
  const { orgSlug } = await params;
  const organisation = await getPublicOrganisation(orgSlug);

  if (!organisation) {
    notFound();
  }

  return (
    <main className="gf-page">
      <div className="gf-shell max-w-lg">
        <UnifiedSignInCard
          adminNextPath={`/admin?org=${organisation.slug}`}
          guestHref={`/o/${organisation.slug}/give`}
          publicNextPath={`/o/${organisation.slug}/give`}
        />
      </div>
    </main>
  );
}
