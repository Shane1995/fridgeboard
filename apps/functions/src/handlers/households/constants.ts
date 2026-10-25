export const CONDITION_FAILED = 'ConditionalCheckFailed';
export const PROFILE_REASON_INDEX = 0;
export const GUARD_REASON_INDEX = 3;
export const LOCATION_HEADER = 'Location';
export const INVITE_LIMIT = 4;
export const CAN_CREATE_CONDITION = 'attribute_exists(PK) AND canCreateHousehold = :allowed';
export const PROFILE_EXISTS_CONDITION = 'attribute_exists(PK)';
export const NOT_EXISTS_CONDITION = 'attribute_not_exists(PK)';
export const MEMBER_REASON_INDEX = 0;
export const LIMIT_REASON_INDEX = 1;
export const INVITE_REASON_INDEX = 2;
export const MEMBER_EXISTS_CONDITION = 'attribute_exists(PK)';
export const INVITE_ROOM_CONDITION =
  'attribute_exists(PK) AND (attribute_not_exists(inviteLimit) OR invitesUsed < inviteLimit)';
export const INVITE_SLOT_CONDITION = 'attribute_not_exists(PK) OR expiresAt <= :now';
