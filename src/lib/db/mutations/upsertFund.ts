import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import { getFundSlug, type ValidatedFundForm } from "@/lib/validators/fund";

type UpsertFundInput = ValidatedFundForm & {
  organisationId: string;
};

export async function upsertFund(
  supabase: SupabaseClient,
  input: UpsertFundInput,
) {
  // Only one fund per organisation can be the default (enforced by a
  // partial unique index), so clear the previous default first.
  if (input.isDefault) {
    const { error: clearDefaultError } = await supabase
      .from("funds")
      .update({ is_default: false })
      .eq("organisation_id", input.organisationId)
      .eq("is_default", true);

    if (clearDefaultError) {
      throw new Error(`Failed to update default fund: ${clearDefaultError.message}`);
    }
  }

  const values = {
    description: input.description,
    is_active: input.isActive,
    is_default: input.isDefault,
    name: input.name,
    organisation_id: input.organisationId,
  };

  if (input.fundId) {
    const { error } = await supabase
      .from("funds")
      .update(values)
      .eq("id", input.fundId)
      .eq("organisation_id", input.organisationId);

    if (error) {
      throw new Error(`Failed to update fund: ${error.message}`);
    }

    return;
  }

  const { error } = await supabase.from("funds").insert({
    ...values,
    slug: getFundSlug(input.name),
  });

  if (error) {
    throw new Error(`Failed to create fund: ${error.message}`);
  }
}
