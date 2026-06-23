import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { ChevronLeft, ChevronRight, Search, TrendingUp, Video } from 'lucide-react';
import { fetchCreators, fetchInterests, fetchPopularCreators } from '../api/catalogApi';
import type { CatalogCreator, CatalogInterest } from '../types/catalog';
import { creatorToCategoryCard, ytThumb } from '../utils/catalogMap';
import { PageHeader } from '../shell/PageHeader';
import { StaggerChildren, StaggerItem } from '../shell/motion';
import { Input } from './ui/input';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Skeleton } from './ui/skeleton';
import { Button } from './ui/button';

function TrendingRail({
  creators,
  onSelect,
}: {
  creators: CatalogCreator[];
  onSelect: (id: string) => void;
}) {
  const railRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollState = () => {
    const el = railRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  };

  useEffect(() => {
    updateScrollState();
    const el = railRef.current;
    if (!el) return;
    el.addEventListener('scroll', updateScrollState, { passive: true });
    const ro = new ResizeObserver(updateScrollState);
    ro.observe(el);
    return () => {
      el.removeEventListener('scroll', updateScrollState);
      ro.disconnect();
    };
  }, [creators]);

  const scroll = (direction: -1 | 1) => {
    railRef.current?.scrollBy({ left: direction * 300, behavior: 'smooth' });
  };

  return (
    <div className="relative">
      <div
        ref={railRef}
        className="flex gap-3 overflow-x-auto scroll-smooth pb-1 snap-x snap-mandatory [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
      >
        {creators.map((creator) => {
          const card = creatorToCategoryCard(creator);
          const rank = creator.popularRank;
          return (
            <button
              key={creator.id}
              type="button"
              onClick={() => onSelect(creator.id)}
              className="group w-[min(100%,240px)] shrink-0 snap-start rounded-2xl border border-border bg-card/80 p-3 text-left backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:border-[var(--brand)]/30 hover:shadow-[0_12px_40px_rgba(225,6,0,0.08)]"
            >
              <div className="relative mb-3 aspect-video overflow-hidden rounded-xl bg-muted">
                <img
                  src={card.image}
                  alt=""
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                />
                {rank != null && (
                  <span className="absolute left-2 top-2 flex size-7 items-center justify-center rounded-full bg-[var(--brand)] text-[11px] font-bold text-white shadow-lg">
                    #{rank}
                  </span>
                )}
              </div>
              <p className="truncate text-sm font-semibold">{card.name}</p>
              <p className="mt-0.5 truncate text-xs text-muted-foreground">{card.sub}</p>
            </button>
          );
        })}
      </div>

      {canScrollLeft && (
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-background via-background/80 to-transparent" />
      )}
      {canScrollRight && (
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-background via-background/80 to-transparent" />
      )}

      <Button
        type="button"
        variant="outline"
        size="icon"
        aria-label="Scroll trending left"
        onClick={() => scroll(-1)}
        disabled={!canScrollLeft}
        className="absolute -left-3 top-[38%] z-20 size-9 rounded-full border-border bg-background/95 shadow-md backdrop-blur disabled:opacity-0"
      >
        <ChevronLeft className="size-4" />
      </Button>
      <Button
        type="button"
        variant="outline"
        size="icon"
        aria-label="Scroll trending right"
        onClick={() => scroll(1)}
        disabled={!canScrollRight}
        className="absolute -right-3 top-[38%] z-20 size-9 rounded-full border-border bg-background/95 shadow-md backdrop-blur disabled:opacity-0"
      >
        <ChevronRight className="size-4" />
      </Button>
    </div>
  );
}

export function Creators() {
  const navigate = useNavigate();
  const [creators, setCreators] = useState<CatalogCreator[]>([]);
  const [trending, setTrending] = useState<CatalogCreator[]>([]);
  const [interests, setInterests] = useState<CatalogInterest[]>([]);
  const [loadingTrending, setLoadingTrending] = useState(true);
  const [loadingGrid, setLoadingGrid] = useState(true);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<string>('all');

  useEffect(() => {
    let mounted = true;
    Promise.all([fetchPopularCreators(), fetchInterests()])
      .then(([popular, interestList]) => {
        if (!mounted) return;
        setTrending(popular);
        setInterests(interestList);
      })
      .catch(() => {
        if (mounted) {
          setTrending([]);
          setInterests([]);
        }
      })
      .finally(() => {
        if (mounted) setLoadingTrending(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;
    setLoadingGrid(true);
    fetchCreators(category === 'all' ? undefined : category)
      .then((list) => {
        if (mounted) setCreators(list);
      })
      .catch(() => {
        if (mounted) setCreators([]);
      })
      .finally(() => {
        if (mounted) setLoadingGrid(false);
      });
    return () => {
      mounted = false;
    };
  }, [category]);

  const categories = useMemo(() => {
    const fromInterests = interests.flatMap((i) => i.categories ?? []);
    const fromCreators = creators.map((c) => c.category).filter(Boolean);
    return ['all', ...new Set([...fromInterests, ...fromCreators])];
  }, [interests, creators]);

  const filtered = creators.filter((c) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.tagline?.toLowerCase().includes(q) ||
      c.category?.toLowerCase().includes(q) ||
      c.bio?.toLowerCase().includes(q)
    );
  });

  const openCreator = (id: string) => navigate(`/educator/${id}`);

  return (
    <div>
      <PageHeader
        label="Discover"
        title="Creators"
        description="Explore educators and YouTube channels with courses and quizzes on Quib."
      />

      <section className="mb-10">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <TrendingUp size={16} className="text-[var(--brand)]" />
            <h2 className="text-sm font-medium">Trending this week</h2>
          </div>
          {!loadingTrending && trending.length > 0 && (
            <span className="text-xs text-muted-foreground">Ranked by popularity on Quib</span>
          )}
        </div>

        {loadingTrending ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[4/3] w-full rounded-2xl" />
            ))}
          </div>
        ) : trending.length === 0 ? (
          <Card className="border-dashed py-10 text-center text-sm text-muted-foreground">
            No trending creators yet. Check back soon.
          </Card>
        ) : (
          <TrendingRail creators={trending} onSelect={openCreator} />
        )}
      </section>

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-md flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search creators, topics, channels…"
            className="pl-9"
          />
        </div>
      </div>

      <div className="mb-8 flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setCategory(cat)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              category === cat
                ? 'bg-[var(--brand)] text-white'
                : 'bg-muted text-muted-foreground hover:text-foreground'
            }`}
          >
            {cat === 'all' ? 'All' : cat}
          </button>
        ))}
      </div>

      {loadingGrid ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="overflow-hidden p-0">
              <Skeleton className="aspect-[16/10] w-full rounded-none" />
              <div className="space-y-2 p-4">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </Card>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card className="py-16 text-center text-sm text-muted-foreground">
          {creators.length === 0 ? 'No creators in the catalog yet.' : 'No creators match your search.'}
        </Card>
      ) : (
        <StaggerChildren className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((creator) => {
            const thumb = creator.youtubeVideoId ? ytThumb(creator.youtubeVideoId) : '';
            return (
              <StaggerItem key={creator.id}>
                <Card
                  className="group cursor-pointer overflow-hidden transition-colors hover:border-border/80"
                  onClick={() => openCreator(creator.id)}
                >
                  <div className="relative aspect-[16/10] overflow-hidden bg-muted">
                    {thumb ? (
                      <img
                        src={thumb}
                        alt=""
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                      />
                    ) : (
                      <div
                        className="flex h-full w-full items-center justify-center text-2xl font-semibold text-white"
                        style={{ background: creator.color || 'var(--brand)' }}
                      >
                        {creator.name.charAt(0)}
                      </div>
                    )}
                    <div
                      className="pointer-events-none absolute inset-0 opacity-40"
                      style={{ background: `linear-gradient(180deg, transparent 40%, ${creator.color || '#000'}88 100%)` }}
                    />
                  </div>
                  <div className="p-4">
                    <Badge variant="muted" className="mb-2">
                      {creator.category}
                    </Badge>
                    <h3 className="text-base font-medium leading-snug">{creator.name}</h3>
                    <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{creator.tagline}</p>
                    <div className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Video size={13} />
                      <span>{creator.videoCount}+ videos</span>
                    </div>
                  </div>
                </Card>
              </StaggerItem>
            );
          })}
        </StaggerChildren>
      )}
    </div>
  );
}
