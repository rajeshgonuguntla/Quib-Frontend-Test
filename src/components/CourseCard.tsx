import { courseThumbGlyph } from '../utils/browseFilter';

export type CourseCardModel = {
  id: string;
  title: string;
  creator: string;
  tag: string;
  progress: number;
  lessonsDone: number;
  lessonsTotal: number;
  current?: boolean;
  image?: string;
};

export function CourseCard({
  item,
  onOpen,
}: {
  item: CourseCardModel;
  onOpen: () => void;
}) {
  const current = item.current ?? item.progress > 0;
  const fill = current ? Math.max(item.progress, 2) : item.progress;

  return (
    <button
      type="button"
      className={`course-card${current ? ' current' : ''}`}
      onClick={onOpen}
    >
      <div className="thumb">
        {item.image ? (
          <img
            className="thumb-img"
            src={item.image}
            alt=""
            referrerPolicy="no-referrer"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        ) : null}
        <span className="thumb-tag">{item.tag || 'General'}</span>
        <span className="thumb-glyph">{courseThumbGlyph(item.tag, item.title)}</span>
        <div className="thumb-play">
          <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <path d="M8 5v14l11-7z" />
          </svg>
        </div>
      </div>
      <div className="course-body">
        <div className="course-title">{item.title}</div>
        <div className="course-creator">{item.creator}</div>
        <div className="progress-row">
          <span className="progress-lessons">
            {item.lessonsDone} / {item.lessonsTotal} lessons
          </span>
          <span className="progress-pct">{Math.round(item.progress)}%</span>
        </div>
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${fill}%` }} />
        </div>
      </div>
    </button>
  );
}
