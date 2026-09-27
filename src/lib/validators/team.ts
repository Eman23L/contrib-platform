import "server-only";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

// "owner" is deliberately not assignable here — granting ownership is
// sensitive enough that it stays a manual, direct-database action rather
// than something reachable from a simple admin form.
export type AssignableTeamRole = "admin" | "finance";

export type ValidatedTeamInviteForm = {
  email: string;
  role: AssignableTeamRole;
};

type InviteValidationResult =
  | {
      ok: true;
      value: ValidatedTeamInviteForm;
    }
  | {
      error: string;
      ok: false;
    };

type MembershipActionValidationResult =
  | {
      ok: true;
      value: string;
    }
  | {
      error: string;
      ok: false;
    };

function getFormString(formData: FormData, key: string) {
  const value = formData.get(key);

  return typeof value === "string" ? value.trim() : "";
}

export function validateTeamInviteForm(formData: FormData): InviteValidationResult {
  const email = getFormString(formData, "email").toLowerCase();
  const role = getFormString(formData, "role");

  if (!email || !EMAIL_PATTERN.test(email)) {
    return {
      error: "Enter a valid email address.",
      ok: false,
    };
  }

  if (role !== "admin" && role !== "finance") {
    return {
      error: "Choose a valid role for this team member.",
      ok: false,
    };
  }

  return {
    ok: true,
    value: { email, role },
  };
}

export function validateMembershipId(formData: FormData): MembershipActionValidationResult {
  const membershipId = getFormString(formData, "membershipId");

  if (!membershipId || !UUID_PATTERN.test(membershipId)) {
    return {
      error: "Invalid team member record.",
      ok: false,
    };
  }

  return {
    ok: true,
    value: membershipId,
  };
}
