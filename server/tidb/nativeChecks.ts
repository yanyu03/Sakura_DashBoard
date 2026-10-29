/** TiDB rejects CHECKs on certain FK action columns; application transactions enforce all checks. */
export const transactionOnlyChecks = new Set([
  "organization_units:4",
  "organization_units:5",
  "identity_reporting_lines:1",
  "identity_object_bindings:3",
  "schedule_submissions:3",
  "organization_unit_profiles:0",
]);
