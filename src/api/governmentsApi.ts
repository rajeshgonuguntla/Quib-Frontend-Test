import axios from 'axios';

export interface GovernmentInquiryPayload {
  organizationName: string;
  contactName: string;
  contactEmail: string;
  countryRegion?: string;
  message: string;
}

export interface GovernmentInquiryResult {
  inquiryId: string;
  message: string;
}

export async function submitGovernmentInquiry(
  payload: GovernmentInquiryPayload,
): Promise<GovernmentInquiryResult> {
  const { data } = await axios.post<GovernmentInquiryResult>('/api/public/government-inquiry', payload);
  return data;
}
