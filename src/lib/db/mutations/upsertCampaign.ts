import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import {
  getCampaignSlug,
  type ValidatedCampaignForm,
} from "@/lib/validators/campaign";

type UpsertCampaignInput = ValidatedCampaignForm & {
  organisationId: string;
};

export async function upsertCampaign(
  supabase: SupabaseClient,
  input: UpsertCampaignInput,
) {
  const values = {
    description: input.description,
    ends_at: input.endsAt,
    fund_id: input.fundId,
    goal_amount_minor: input.goalAmountMinor,
    is_active: input.isActive,
    name: input.name,
    organisation_id: input.organisationId,
    starts_at: input.startsAt,
  };

  if (input.campaignId) {
    const { error } = await supabase
      .from("campaigns")
      .update(values)
      .eq("id", input.campaignId)
      .eq("organisation_id", input.organisationId);

    if (error) {
      throw new Error(`Failed to update campaign: ${error.message}`);
    }

    return;
  }

  const { error } = await supabase.from("campaigns").insert({
    ...values,
    slug: getCampaignSlug(input.name),
  });

  if (error) {
    throw new Error(`Failed to create campaign: ${error.message}`);
  }
}
