import type { CompleteWebAuthnRegistrationCommandInput } from '@aws-sdk/client-cognito-identity-provider';

export type BodyDocument = NonNullable<CompleteWebAuthnRegistrationCommandInput['Credential']>;

export type BodyObject = Record<string, BodyDocument>;
