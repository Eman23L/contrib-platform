import { revalidatePath } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";

import { getAdminOrganisationBySlug } from "@/lib/db/queries/admin";
import { updateOrganisationSettings } from "@/lib/db/mutations/updateOrganisationSettings";
import { requireAdminRole } from "@/lib/auth/requireAdminRole";
import { createServerSupabaseUserClient } from "@/lib/supabase/server";
import {
  ORGANISATION_PUBLIC_SETTING_KEYS,
  type OrganisationPublicSettings,
} from "@/lib/organisationSettings";
import { validateOrganisationSettingsForm } from "@/lib/validators/organisationSettings";

function redirectToAdminSettings(
  request: NextRequest,
  params: Record<string, string>,
) {
  const url = new URL("/admin", request.url);

  url.searchParams.set("section", "settings");

  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }

  return NextResponse.redirect(url);
}

function redirectToSettings(request: NextRequest, orgSlug: string, params: Record<string, string>) {
  const url = new URL("/admin", request.url);

  url.searchParams.set("org", orgSlug);
  url.searchParams.set("section", "settings");

  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }

  return NextResponse.redirect(url);
}

function mergePublicSettings(
  currentSettings: Record<string, unknown>,
  publicSettings: OrganisationPublicSettings,
) {
  const nextSettings = { ...currentSettings };

  for (const key of ORGANISATION_PUBLIC_SETTING_KEYS) {
    if (publicSettings[key]) {
      nextSettings[key] = publicSettings[key];
    } else {
      delete nextSettings[key];
    }
  }

  return nextSettings;
}

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const currentOrgSlug = formData.get("currentOrgSlug");

  if (typeof currentOrgSlug !== "string" || !currentOrgSlug.trim()) {
    return redirectToAdminSettings(request, {
      settingsError: "missing-org",
    });
  }

  const orgSlug = currentOrgSlug.trim();
  const access = await requireAdminRole(orgSlug);

  if (access.kind === "unauthenticated") {
    return NextResponse.redirect(new URL(access.signInPath, request.url));
  }

  if (access.kind !== "authenticated") {
    return redirectToSettings(request, orgSlug, {
      settingsError: "unauthorized",
    });
  }

  const role = access.value.membership.role;

  if (role !== "owner" && role !== "admin") {
    return redirectToSettings(request, orgSlug, {
      settingsError: "forbidden",
    });
  }

  const validated = validateOrganisationSettingsForm(formData);

  if (!validated.ok) {
    return redirectToSettings(request, orgSlug, {
      settingsError: validated.error,
    });
  }

  const supabase = createServerSupabaseUserClient(access.value.accessToken);
  const organisation = await getAdminOrganisationBySlug(supabase, orgSlug);

  if (!organisation) {
    return redirectToSettings(request, orgSlug, {
      settingsError: "not-found",
    });
  }

  try {
    const updated = await updateOrganisationSettings(supabase, {
      ...validated.value,
      organisationId: organisation.id,
      settings: mergePublicSettings(
        organisation.settings,
        validated.value.publicSettings,
      ),
    });

    revalidatePath(`/admin`);
    revalidatePath(`/o/${orgSlug}`);
    revalidatePath(`/o/${orgSlug}/give`);
    revalidatePath(`/o/${updated.slug}`);
    revalidatePath(`/o/${updated.slug}/give`);

    return redirectToSettings(request, updated.slug, {
      settingsSaved: "1",
    });
  } catch {
    return redirectToSettings(request, orgSlug, {
      settingsError: "save-failed",
    });
  }
}
