// Function to generate a referral code
export function referralCodeGenerator(): string {
  return (
    Math.random().toString(36).substring(2) +
    Math.random().toString(36).substring(2)
  ).substring(0, 12);
}

// Function to build a referral tag
export function buildReferralTag(
  hashId: string,
  referralTag: string | null = null
): string {
  if (!referralTag) {
    return `${hashId}:`;
  }
  return `${referralTag}${hashId}:`;
}

// Function to generate a hash ID
export function generateHashId(id: number): string {
  // Convert number id to base 36
  return id.toString(36);
}
