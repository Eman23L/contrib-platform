import { notFound } from "next/navigation";

import { UnifiedSignInCard } from "@/components/auth/UnifiedSignInCard";
import { getOrganisationPublicSettings } from "@/lib/organisationSettings";
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

  const publicSettings = getOrganisationPublicSettings(
    organisation.settings,
    organisation.name,
  );

  return (
    <main className="gf-page">
      <div className="gf-shell max-w-lg">
        <UnifiedSignInCard
          adminNextPath={`/admin?org=${organisation.slug}`}
          guestHref={`/o/${organisation.slug}/give`}
          intro={publicSettings.publicPageIntro}
          kicker={organisation.name}
          publicNextPath="/account"
          title={publicSettings.publicPageHeading}
        />
      </div>
    </main>
  );
}
