import Fuse from 'fuse.js';
import versesData from '@/data/gita_verses_enhanced.json';
import { ShlokaCard } from './api';

const verses = versesData as ShlokaCard[];

const fuseOptions = {
  keys: [
    'english',
    'hindi',
    'theme_tags',
    'problem_domains',
    'key_concepts',
    'chapter_title',
    'sanskrit_transliterated'
  ],
  threshold: 0.3,
  includeScore: true,
};

const fuse = new Fuse(verses, fuseOptions);

export const gitaData = {
  searchGita: (query: string, limit = 20) => {
    if (!query) return [];
    const results = fuse.search(query);
    return results.slice(0, limit).map(res => res.item);
  },

  getChapter: (n: number) => {
    return verses.filter(v => parseInt(String(v.chapter), 10) === n).sort((a,b) => {
        const vA = parseInt(a.verse_range.split('-')[0], 10);
        const vB = parseInt(b.verse_range.split('-')[0], 10);
        return vA - vB;
    });
  },

  getVerse: (chunk_id: string) => {
    return verses.find(v => v.chunk_id === chunk_id);
  },

  getByTheme: (tag: string) => {
    return verses.filter(v => 
      v.theme_tags?.includes(tag) || 
      v.problem_domains?.includes(tag) ||
      v.key_concepts?.includes(tag)
    );
  },

  getAllThemes: () => {
    const all = new Set<string>();
    verses.forEach(v => {
      v.theme_tags?.forEach(t => all.add(t));
      v.problem_domains?.forEach((t: string) => all.add(t));
      v.key_concepts?.forEach(t => all.add(t));
    });
    return Array.from(all).sort();
  },

  getChapterList: () => {
    const list: Record<number, {chapter: number, chapter_title: string, verse_count: number, preview_theme: string}> = {};
    verses.forEach(v => {
      if (!list[v.chapter]) {
        list[v.chapter] = {
          chapter: v.chapter,
          chapter_title: v.chapter_title || `Chapter ${v.chapter}`,
          verse_count: 0,
          preview_theme: v.theme_tags?.[0] || 'Philosophy'
        };
      }
      list[v.chapter].verse_count += 1;
    });
    return Object.values(list).sort((a,b) => a.chapter - b.chapter);
  }
};
