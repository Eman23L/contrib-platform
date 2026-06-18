import "server-only";

import type { User } from "@supabase/supabase-js";

import { listAdminMembershipsForUser } from "@/lib/db/queries/memberships";
import { createServerSupabaseServiceClient } from "@/lib/supabase/server";

const USERS_PAGE_SIZE = 1000;
const MAX_USER_PAGES = 10;

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

async function findUserByEmail(email: string): Promise<User | null> {
  const normalizedEmail = normalizeEmail(email);
  const supabase = createServerSupabaseServiceClient();

  for (let page = 1; page <= MAX_USER_PAGES; page += 1) {
    const { data, error } = await supabase.auth.admin.listUsers({
      page,
      perPage: USERS_PAGE_SIZE,
    });

    if (error) {
      throw new Error("Could not check sign-in method.");
    }

    const user =
      data.users.find(
        (item) => item.email && normalizeEmail(item.email) === normalizedEmail,
      ) ?? null;

    if (user) {
      return user;
    }

    if (data.users.length < USERS_PAGE_SIZE) {
      return null;
    }
  }

  return null;
}

export async function hasAdminSignInAccess(email: string) {
  const user = await findUserByEmail(email);

  if (!user) {
    return false;
  }

  const supabase = createServerSupabaseServiceClient();
  const memberships = await listAdminMembershipsForUser(supabase, user.id);

  return memberships.length > 0;
}
