import { useTranslation } from 'react-i18next';
import { Btn } from '@/components';

function buildPageRange(current: number, total: number, delta: number): (number | '...')[] {
  if (total <= 1) return [1];

  const range: number[] = [];
  for (let i = Math.max(2, current - delta); i <= Math.min(total - 1, current + delta); i++) {
    range.push(i);
  }

  const items: (number | '...')[] = [1];
  if (range[0] > 2) items.push('...');
  items.push(...range);
  if (range[range.length - 1] < total - 1) items.push('...');

  items.push(total);
  return items;
}

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  className = '',
}: PaginationProps) {
  const { t } = useTranslation('common');
  const canGoPrev = currentPage > 1;
  const canGoNext = currentPage < totalPages;
  const delta = totalPages <= 7 ? totalPages : 1;

  return (
    <div className={['flex items-center justify-center gap-1', className].join(' ')}>
      <Btn
        variant="secondary"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={!canGoPrev}
        aria-label={t('pagination.prev')}
        className="w-8 px-0"
      >
        {' '}
        {'◀'}{' '}
      </Btn>

      <div className="flex gap-1">
        {buildPageRange(currentPage, totalPages, delta).map((page, i) =>
          page === '...' ? (
            <span key={`ellipsis-${i}`} className="flex items-center px-1 text-sm select-none">
              …
            </span>
          ) : (
            <Btn
              key={page}
              variant={currentPage === page ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => onPageChange(page)}
              className={`w-8 px-0${currentPage === page ? ' pointer-events-none' : ''}`}
            >
              {page}
            </Btn>
          ),
        )}
      </div>

      <Btn
        variant="secondary"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={!canGoNext}
        aria-label={t('pagination.next')}
        className="w-8 px-0"
      >
        {' '}
        {'▶'}{' '}
      </Btn>
    </div>
  );
}
