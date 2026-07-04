export const FORM_LIMITS = {
  name: 200,
  contact: 200,
  prayerRequest: 5000,
  connectMessage: 2000,
  maxInterests: 10,
  maxInterestLabel: 80,
} as const;

export function trimToMax(value: string, max: number): string {
  return value.trim().slice(0, max);
}

export function normalizeInterests(interests: string[]): string[] {
  return interests
    .map((item) => item.trim().slice(0, FORM_LIMITS.maxInterestLabel))
    .filter(Boolean)
    .slice(0, FORM_LIMITS.maxInterests);
}

export function validatePrayerRequestInput(input: {
  name?: string;
  contact?: string;
  request: string;
}): string | null {
  const request = input.request.trim();
  if (!request) return 'Please share your prayer request.';
  if (request.length > FORM_LIMITS.prayerRequest) {
    return `Prayer request must be ${FORM_LIMITS.prayerRequest} characters or fewer.`;
  }
  if ((input.name?.trim().length ?? 0) > FORM_LIMITS.name) {
    return `Name must be ${FORM_LIMITS.name} characters or fewer.`;
  }
  if ((input.contact?.trim().length ?? 0) > FORM_LIMITS.contact) {
    return `Contact info must be ${FORM_LIMITS.contact} characters or fewer.`;
  }
  return null;
}

export function validateConnectCardInput(input: {
  name: string;
  contact: string;
  message?: string;
  interests: string[];
}): string | null {
  const name = input.name.trim();
  const contact = input.contact.trim();
  if (!name) return 'Please enter your name.';
  if (!contact) return 'Please enter an email or phone number.';
  if (name.length > FORM_LIMITS.name) return `Name must be ${FORM_LIMITS.name} characters or fewer.`;
  if (contact.length > FORM_LIMITS.contact) {
    return `Contact info must be ${FORM_LIMITS.contact} characters or fewer.`;
  }
  if ((input.message?.trim().length ?? 0) > FORM_LIMITS.connectMessage) {
    return `Message must be ${FORM_LIMITS.connectMessage} characters or fewer.`;
  }
  if (input.interests.length > FORM_LIMITS.maxInterests) {
    return `Please choose up to ${FORM_LIMITS.maxInterests} interests.`;
  }
  return null;
}