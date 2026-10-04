import { describe, expect, it } from 'vitest';
import { generateDashboardAnswer, stripAnswerMarkup } from './dashboardAnswer';

describe('generateDashboardAnswer', () => {
  it('answers a known topic in plain paragraphs', () => {
    const answer = generateDashboardAnswer('How do Python lists work?');
    expect(answer).toContain('**Python**');
    expect(answer).toContain('YouTube URL');
    expect(stripAnswerMarkup(answer)).not.toContain('**');
  });

  it('uses the question itself when the topic is unfamiliar', () => {
    const answer = generateDashboardAnswer('pottery glazes');
    expect(answer.startsWith('**Pottery glazes**')).toBe(true);
    expect(answer.length).toBeGreaterThan(80);
  });
});
