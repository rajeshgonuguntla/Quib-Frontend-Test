import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { Bell, BookMarked, Menu, Search } from 'lucide-react';
import { ThemeToggle } from '../components/ThemeToggle';
import { UserAvatar } from '../components/UserAvatar';
import { useUserProfile } from '../context/UserProfileContext';
import { searchCourses } from '../api/catalogApi';
import type { CourseSearchResult } from '../types/catalog';
import { ytThumb } from '../utils/catalogMap';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '../components/ui/breadcrumb';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import { Input } from '../components/ui/input';
import { Sheet, SheetContent, SheetTrigger } from '../components/ui/sheet';
import { clearToken } from '../auth';
import { getDisplayName } from '../utils/userDisplay';
import { AppSidebar } from './AppSidebar';
import { getRouteMeta } from './navConfig';

export function AppTopbar({ onOpenMobileNav }: { onOpenMobileNav?: () => void }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { profile, setProfile } = useUserProfile();
  const meta = getRouteMeta(location.pathname);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<CourseSearchResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setSearchLoading(false);
      return;
    }
    setSearchLoading(true);
    const timer = window.setTimeout(() => {
      searchCourses(searchQuery, 8)
        .then((results) => {
          setSearchResults(results);
          setSearchOpen(true);
        })
        .catch(() => setSearchResults([]))
        .finally(() => setSearchLoading(false));
    }, 280);
    return () => window.clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = () => {
    clearToken();
    setProfile(null);
    navigate('/signin');
  };

  return (
    <header className="sticky top-0 z-40 flex h-14 shrink-0 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur-xl sm:px-6">
      <Sheet>
        <SheetTrigger asChild>
          <button
            type="button"
            className="inline-flex size-8 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:bg-accent hover:text-foreground lg:hidden"
            aria-label="Open navigation"
          >
            <Menu size={16} />
          </button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[260px] p-0">
          <AppSidebar pathname={location.pathname} search={location.search} />
        </SheetContent>
      </Sheet>

      <Breadcrumb className="hidden min-w-0 flex-1 sm:block">
        <BreadcrumbList>
          {meta.parent && (
            <>
              <BreadcrumbItem>
                <Link to={meta.parent.path} className="transition-colors hover:text-foreground text-muted-foreground">
                  {meta.parent.label}
                </Link>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
            </>
          )}
          {meta.section && meta.section !== meta.title && (
            <>
              <BreadcrumbItem>
                <span className="text-muted-foreground">{meta.section}</span>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
            </>
          )}
          <BreadcrumbItem>
            <BreadcrumbPage>{meta.title}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div ref={searchRef} className="relative ml-auto hidden max-w-md flex-1 md:block">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => searchQuery.trim() && setSearchOpen(true)}
          placeholder="Search courses, creators…"
          className="h-8 border-border bg-muted/40 pl-9 text-sm shadow-none"
        />
        {searchOpen && searchQuery.trim() && (
          <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-50 overflow-hidden rounded-lg border border-border bg-popover shadow-lg">
            {searchLoading ? (
              <p className="px-4 py-3 text-xs text-muted-foreground">Searching…</p>
            ) : searchResults.length === 0 ? (
              <p className="px-4 py-3 text-xs text-muted-foreground">No courses found.</p>
            ) : (
              <div className="max-h-72 overflow-y-auto py-1">
                {searchResults.map((result) => (
                  <button
                    key={result.courseId}
                    type="button"
                    onClick={() => {
                      setSearchOpen(false);
                      setSearchQuery('');
                      navigate(`/course-details/${result.courseId}`, {
                        state: { from: `${location.pathname}${location.search}` },
                      });
                    }}
                    className="flex w-full items-start gap-3 px-3 py-2.5 text-left transition-colors hover:bg-accent"
                  >
                    {result.youtubeVideoId ? (
                      <img src={ytThumb(result.youtubeVideoId)} alt="" className="size-10 shrink-0 rounded object-cover" />
                    ) : (
                      <div className="flex size-10 shrink-0 items-center justify-center rounded bg-muted">
                        <BookMarked size={14} className="text-muted-foreground" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">{result.title}</p>
                      <p className="truncate text-xs text-muted-foreground">{result.channelName ?? 'YouTube'}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center gap-1.5">
        <ThemeToggle size="sm" />
        <button
          type="button"
          className="relative hidden size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground sm:inline-flex"
          aria-label="Notifications"
        >
          <Bell size={15} />
          <span className="absolute right-2 top-2 size-1.5 rounded-full bg-[var(--brand)]" />
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button type="button" className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring">
              <UserAvatar profile={profile} size="md" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuLabel className="font-normal">
              <p className="text-sm font-medium">{getDisplayName(profile)}</p>
              <p className="truncate text-xs text-muted-foreground">{profile?.email}</p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate('/settings')}>Settings</DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/my-courses')}>My courses</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut} className="text-destructive focus:text-destructive">
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
