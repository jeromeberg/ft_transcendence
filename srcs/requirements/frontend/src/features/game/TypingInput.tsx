import { useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Input } from '@/components';

type Props = {
  active?: boolean;
  finished?: boolean;
  words?: string[];
  wordIndex?: number;
  typed?: string;
  onType?: (value: string) => void;
  onCompleteWord?: () => void;
};

export default function TypingInput({
  active,
  finished,
  words = [],
  wordIndex = 0,
  typed = '',
  onType,
  onCompleteWord,
}: Props) {
  const { t } = useTranslation('pages');
  const ref = useRef<HTMLInputElement>(null);
  const currentWord = words[wordIndex] ?? '';
  const isLastWord = wordIndex === words.length - 1;

  useEffect(() => {
    if (active) ref.current?.focus();
  }, [active]);

  const handleKeyDown = (e: { key: string; preventDefault: () => void }) => {
    // Space only acts as a word delimiter once the current word is fully correct; otherwise it
    // falls through and is typed as a (wrong) character, like any other mistake.
    if (e.key === ' ' && typed === currentWord) {
      e.preventDefault();
      if (!isLastWord) {
        onCompleteWord?.();
      }
    }
    if (e.key === 'Backspace' && typed === '') {
      e.preventDefault();
    }
  };

  const nextWord = words[wordIndex + 1] ?? '';
  const maxInputLength = currentWord.length + nextWord.length + 4;

  const handleChange = ({ target }: { target: HTMLInputElement }) => {
    const value = target.value.slice(0, maxInputLength);
    onType?.(value);
    if (isLastWord && value === currentWord) onCompleteWord?.();
  };

  // Build passage as a flat string and compute cursor position absolutely
  const passage = words.join(' ');
  const charOffset = words.slice(0, wordIndex).reduce((acc, w) => acc + w.length + 1, 0);
  const absoluteCursor = charOffset + typed.length;

  // Find the first error within the current word
  let firstError = typed.length;
  for (let i = 0; i < typed.length; i++) {
    if (i >= currentWord.length || typed[i] !== currentWord[i]) {
      firstError = i;
      break;
    }
  }
  const hasError = firstError < typed.length;
  const overflow = typed.length > currentWord.length;
  const redStart =
    charOffset + (hasError && firstError < currentWord.length ? firstError : currentWord.length);
  const cursorIsError = hasError || overflow;

  const charNodes: React.ReactNode[] = passage.split('').map((char, i) => {
    let cls: string;
    if (!finished && i === absoluteCursor) {
      // Bar caret: a left border on the next character (negative margin cancels its width, no jitter).
      cls = `text-dim border-l-2 -ml-0.5 ${cursorIsError ? 'border-red-400' : 'border-default'}`;
    } else if (i < charOffset || i < absoluteCursor) {
      // Already typed: correct characters light up matrix green, mistakes get a red mark.
      cls = i >= charOffset && i >= redStart ? 'bg-red-500/40 text-default' : 'text-default';
    } else {
      // Not yet typed: dim green (in-theme, still readable), brightening to full
      // matrix green as each character is typed.
      cls = 'text-dim';
    }
    return (
      <span key={i} className={cls}>
        {char}
      </span>
    );
  });

  // Trailing cursor when the cursor is past the end of the passage.
  if (!finished && absoluteCursor >= passage.length) {
    charNodes.push(
      <span key="trail" className={cursorIsError ? 'text-red-400' : 'text-default'}>
        |
      </span>,
    );
  }

  return (
    <div className="w-full flex flex-col gap-3">
      {words.length > 0 && (
        <div
          className="font-mono leading-relaxed p-3 bg-black/20 border border-dim rounded select-none"
          onCopy={(e) => e.preventDefault()}
        >
          {charNodes}
        </div>
      )}
      {!finished && (
        <Input
          ref={ref}
          placeholder={active ? t('play.type_here') : t('play.waiting_start')}
          disabled={!active}
          value={typed}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          onKeyDown={handleKeyDown}
          onChange={handleChange}
          onPaste={(e) => e.preventDefault()}
        />
      )}
    </div>
  );
}
