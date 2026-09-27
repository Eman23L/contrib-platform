import { revalidatePath } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";

import { requireAdminRole } from "@/lib/auth/requireAdminRole";
import { getAdminOrganisationBySlug } from "@/lib/db/queries/admin";
import { upsertFund } from "@/lib/db/mutations/upsertFund";
import { createServerSupabaseUserClient } from "@/lib/supabase/server";
import { validateFundForm } from "@/lib/validators/fund";

function redirectToFunds(
  request: NextRequest,
  orgSlug: string | null,
  params: Record<string, string>,
) {
  const url = new URL("/admin", request.url);

  if (orgSlug) {
    url.searchParams.set("org", orgSlug);
  }

  url.searchParams.set("section", "funds");

  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }

  return NextResponse.redirect(url);
}

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const currentOrgSlug = formData.get("currentOrgSlug");

  if (typeof currentOrgSlug !== "string" || !currentOrgSlug.trim()) {
    return redirectToFunds(request, null, {
      fundError: "Missing organisation context.",
    });
  }

  const orgSlug = currentOrgSlug.trim();
  const access = await requireAdminRole(orgSlug);

  if (access.kind === "unauthenticated") {
    return NextResponse.redirect(new URL(access.signInPath, request.url));
  }

  if (access.kind !== "authenticated") {
    return redirectToFunds(request, orgSlug, {
      fundError: "This account cannot manage funds for this organisation.",
    });
  }

  const role = access.value.membership.role;

  if (role !== "owner" && role !== "admin" && role !== "finance") {
    return redirectToFunds(request, orgSlug, {
      fundError: "This role cannot manage funds.",
    });
  }

  const validated = validateFundForm(formData);

  if (!validated.ok) {
    return redirectToFunds(request, orgSlug, {
      fundError: validated.error,
    });
  }

  const supabase = createServerSupabaseUserClient(access.value.accessToken);
  const organisation = await getAdminOrganisationBySlug(supabase, orgSlug);

  if (!organisation) {
    return redirectToFunds(request, orgSlug, {
      fundError: "Organisation was not found.",
    });
  }

  try {
    await upsertFund(supabase, {
      ...validated.value,
      organisationId: organisation.id,
    });

    revalidatePath("/admin");

    return redirectToFunds(request, organisation.slug, {
      fundSaved: "1",
    });
  } catch {
    return redirectToFunds(request, orgSlug, {
      fundError: "Fund could not be saved. Check the name is valid and try again.",
    });
  }
}
