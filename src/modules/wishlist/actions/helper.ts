export function getWishlistTag(input: { userId?: string; sessionId?: string }): string {
  if (input.userId) {
    return `wishlist:user:${input.userId}`;
  }
  if (input.sessionId) {
    return `wishlist:session:${input.sessionId}`;
  }
  return "wishlist:unknown";
}
