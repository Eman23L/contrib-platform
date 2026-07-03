import { revalidatePath } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";

import { requireAdminRole } from "@/lib/auth/requireAdminRole";
import { getAdminOrganisationBySlug } from "@/lib/db/queries/admin";
import { upsertCampaign } from "@/lib/db/mutations/upsertCampaign";
import { createServerSupabaseUserClient } from "@/lib/supabase/server";
import { validateCampaignForm } from "@/lib/validators/campaign";

function redirectToCampaigns(
  request: NextRequest,
  orgSlug: string | null,
  params: Record<string, string>,
) {
  const url = new URL("/admin", request.url);

  if (orgSlug) {
    url.searchParams.set("org", orgSlug);
  }

  url.searchParams.set("section", "campaigns");

  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }

  return NextResponse.redirect(url);
}

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const currentOrgSlug = formData.get("currentOrgSlug");

  if (typeof currentOrgSlug !== "string" || !currentOrgSlug.trim()) {
    return redirectToCampaigns(request, null, {
      campaignError: "Missing organisation context.",
    });
  }

  const orgSlug = currentOrgSlug.trim();
  const access = await requireAdminRole(orgSlug);

  if (access.kind === "unauthenticated") {
    return NextResponse.redirect(new URL(access.signInPath, request.url));
  }

  if (access.kind !== "authenticated") {
    return redirectToCampaigns(request, orgSlug, {
      campaignError: "This account cannot manage campaigns for this organisation.",
    });
  }

  const role = access.value.membership.role;

  if (role !== "owner" && role !== "admin" && role !== "finance") {
    return redirectToCampaigns(request, orgSlug, {
      campaignError: "This role cannot manage campaigns.",
    });
  }

  const validated = validateCampaignForm(formData);

  if (!validated.ok) {
    return redirectToCampaigns(request, orgSlug, {
      campaignError: validated.error,
    });
  }

  const supabase = createServerSupabaseUserClient(access.value.accessToken);
  const organisation = await getAdminOrganisationBySlug(supabase, orgSlug);

  if (!organisation) {
    return redirectToCampaigns(request, orgSlug, {
      campaignError: "Organisation was not found.",
    });
  }

  try {
    await upsertCampaign(supabase, {
      ...validated.value,
      organisationId: organisation.id,
    });

    revalidatePath("/admin");

    return redirectToCampaigns(request, organisation.slug, {
      campaignSaved: "1",
    });
  } catch {
    return redirectToCampaigns(request, orgSlug, {
      campaignError: "Campaign could not be saved. Check the fund, dates, and name are valid.",
    });
  }
}
