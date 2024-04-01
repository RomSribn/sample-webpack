const DEFAULT_LIMIT = 12;
/**
 * Limit string to a certain length and add ellipsis at the end.
 * @param tagId tag id to limit.
 * @param limit limit of the string.
 * @example
 * getEllipsisString('12345678901234567890', 5) // '12345…'
 */
export const getEllipsisString = (tagId: string, limit = DEFAULT_LIMIT) =>
  tagId.length > limit ? `${tagId.slice(0, limit)}…` : tagId;
