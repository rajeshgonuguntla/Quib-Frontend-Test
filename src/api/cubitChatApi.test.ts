import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('axios', () => ({
  default: {
    post: vi.fn(),
  },
}));

import axios from 'axios';
import { sendCubitChat } from './cubitChatApi';

const mocked = axios as unknown as {
  post: ReturnType<typeof vi.fn>;
};

describe('sendCubitChat', () => {
  beforeEach(() => {
    mocked.post.mockReset();
  });

  it('posts the question and earlier turns to the general Cubit chat', async () => {
    const history = [
      { role: 'user' as const, content: 'What is a derivative?' },
      { role: 'assistant' as const, content: 'It measures how a function changes.' },
    ];
    mocked.post.mockResolvedValue({ data: { reply: 'Use the chain rule.' } });

    const res = await sendCubitChat('What about the chain rule?', history);

    expect(mocked.post).toHaveBeenCalledWith('/api/cubit/chat', {
      message: 'What about the chain rule?',
      history,
    });
    expect(res.reply).toBe('Use the chain rule.');
  });
});
