import type { PublicKeyCredentialRequestOptionsJSON } from '@simplewebauthn/browser';
import type { ITokenResponse, IVerifyNextResponse } from '@fridgeboard/contract/auth';
import type { FailureReason, RefreshResultKind } from './constants';

export type StartResult = { ok: true } | { ok: false; reason: FailureReason };

export type VerifyResult =
  | { ok: true }
  | ({ ok: false } & IVerifyNextResponse)
  | { ok: false; reason: FailureReason };

export type VerifyResponse =
  | { ok: true; tokens: ITokenResponse }
  | ({ ok: false } & IVerifyNextResponse)
  | { ok: false; reason: FailureReason };

export type RefreshResult =
  | { kind: RefreshResultKind.Tokens; tokens: ITokenResponse }
  | { kind: RefreshResultKind.Rejected }
  | { kind: RefreshResultKind.Unavailable };

export type PasskeyStartResult =
  | { ok: true; options: PublicKeyCredentialRequestOptionsJSON }
  | { ok: false; reason: FailureReason };
