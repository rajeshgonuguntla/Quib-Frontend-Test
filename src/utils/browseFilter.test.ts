import { describe, expect, it } from 'vitest';
import { browseCategoryKey, courseThumbGlyph, matchesBrowseCard } from './browseFilter';

describe('browseFilter', () => {
  it('maps catalog categories onto mock chips', () => {
    expect(browseCategoryKey('Programming')).toBe('programming');
    expect(browseCategoryKey('AI / MACHINE LEARNING')).toBe('ai-ml');
    expect(browseCategoryKey('Data')).toBe('data');
    expect(browseCategoryKey('Web Dev')).toBe('web');
    expect(browseCategoryKey('General')).toBe('other');
  });

  it('filters like the mock: chip + title/creator search', () => {
    const python = {
      category: 'Programming',
      title: 'Python for Beginners',
      creator: 'rajesh gonuguntla',
    };
    expect(matchesBrowseCard({ filter: 'all', query: '', ...python })).toBe(true);
    expect(matchesBrowseCard({ filter: 'ai-ml', query: '', ...python })).toBe(false);
    expect(matchesBrowseCard({ filter: 'programming', query: 'rajesh', ...python })).toBe(true);
    expect(matchesBrowseCard({ filter: 'all', query: 'databricks', ...python })).toBe(false);
  });

  it('picks mock glyph tokens from tag and title', () => {
    expect(courseThumbGlyph('Programming', 'Python for Beginners')).toBe('>>>');
    expect(courseThumbGlyph('AI / ML', 'Intro to Databricks')).toBe('{ }');
    expect(courseThumbGlyph('Web dev', 'Building REST APIs with Python')).toBe('GET /');
  });
});
