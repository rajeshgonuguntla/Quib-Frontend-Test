import axios from 'axios';

export async function createCourseCheckout(courseId: string): Promise<string> {
  const { data } = await axios.post<{ checkoutUrl: string }>(`/api/courses/${courseId}/checkout`);
  if (!data.checkoutUrl) {
    throw new Error('Checkout URL missing from server response');
  }
  return data.checkoutUrl;
}
