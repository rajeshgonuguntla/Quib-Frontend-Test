import axios from 'axios';
import type { CourseChatMessage, CourseChatResponse } from './courseChatApi';

export async function sendCubitChat(
  message: string,
  history: CourseChatMessage[],
): Promise<CourseChatResponse> {
  const res = await axios.post<CourseChatResponse>('/api/cubit/chat', { message, history });
  return res.data;
}
