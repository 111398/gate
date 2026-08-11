import { CONSENT_POLICY_VERSIONS, CONSENT_TYPES, type ConsentType } from "@/shared/config/consents";
import { trpc } from "@/shared/api/trpc/client";

export function useMissingConsents() {
  const query = trpc.consents.list.useQuery();

  const acceptedRows = query.data ?? [];

  const missingTypes: ConsentType[] = CONSENT_TYPES.filter((type) => {
    const latest = acceptedRows.find((row) => row.consent_type === type);
    return !latest || latest.policy_version !== CONSENT_POLICY_VERSIONS[type];
  });

  return {
    isLoading: query.isLoading,
    missingTypes,
    hasMissingConsents: query.isLoading ? false : missingTypes.length > 0,
  };
}
