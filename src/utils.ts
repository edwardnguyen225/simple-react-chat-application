export const ROOM_ID_SEPARATOR = '#';

export const getRoomIdFromUserIds = (userIds: string[]): string => {
  // Sort the ids alphabetically and join them with a separator
  return userIds.sort().join(ROOM_ID_SEPARATOR);
};
