export type OfferSubmissionInput = {
  endpoint: string;
  data: FormData;
  fetcher?: typeof fetch;
};

type FormspreeError = {
  message?: string;
};

type FormspreePayload = {
  error?: string;
  errors?: FormspreeError[];
};

export function offerSubmissionError(payload: FormspreePayload | null, status: number) {
  if (status === 429) return 'Too many attempts were made. Please wait a moment and try again.';

  const messages = [
    payload?.error,
    ...(payload?.errors?.map((error) => error.message) ?? []),
  ].filter((message): message is string => Boolean(message));

  return messages.join(' ') || 'Your enquiry could not be sent. Please try again or contact Kraftt Digital directly.';
}

export async function submitOfferEnquiry({ endpoint, data, fetcher = fetch }: OfferSubmissionInput) {
  const response = await fetcher(endpoint, {
    method: 'POST',
    body: data,
    headers: { Accept: 'application/json' },
  });
  const payload = await response.json().catch(() => null) as FormspreePayload | null;

  if (!response.ok) throw new Error(offerSubmissionError(payload, response.status));
  return payload;
}
