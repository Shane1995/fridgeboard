export type SchemaIssue = { path: readonly PropertyKey[]; message: string };

export type ConfigurationSchema = {
  safeParse: (
    value: unknown,
  ) => { success: true } | { success: false; error: { issues: readonly SchemaIssue[] } };
};

export type ConfigurationTarget = {
  name: string;
  file: string;
  schema: ConfigurationSchema;
};
