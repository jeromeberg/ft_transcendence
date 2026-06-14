import { useState, useEffect, useRef } from "react";
import { getRandomQuote } from "@/api/quote.api";

const FALLBACK_QUOTE = "I didn't tell Mama anything. I was just about to come up and wake you so that I could tell you.";

function correctPrefixLength(typed: string, word: string): number {
  let i = 0;
  while (i < typed.length && typed[i] === word[i]) i++;
  return i;
}

function calcMaxTime(passageLength: number): number {
  return Math.max(20, Math.ceil(passageLength / 2.5));
}

export function useGameState(active: boolean, forcedEnd = false, practice = false, initialText?: string, maxTimeOverride?: number) {
  const [passage, setPassage] = useState<string>(() => initialText ?? FALLBACK_QUOTE);
  const words = passage.split(" ");
  const maxTime = maxTimeOverride ?? calcMaxTime(passage.length);

  const [wordIndex, setWordIndex] = useState(0);
  const [typed, setTyped] = useState("");
  const [completedChars, setCompletedChars] = useState(0);
  const [totalTyped, setTotalTyped] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [lockedWpm, setLockedWpm] = useState<number | null>(null);
  const [lockedElapsed, setLockedElapsed] = useState<number | null>(null);
  const startedAt = useRef<number | null>(null);
  const hasProgressRef = useRef(false);

  const currentWord = words[wordIndex] ?? "";
  const correctInCurrent = correctPrefixLength(typed, currentWord);
  const totalCorrect = completedChars + correctInCurrent;
  const progress = passage.length > 0 ? totalCorrect / passage.length : 0;
  const finished = wordIndex >= words.length;
  const localTimeout = !practice && active && elapsed >= maxTime && !finished;
  const playerDone = finished || forcedEnd || localTimeout;
  const timedOut = !practice && !finished && (localTimeout || forcedEnd);
  const raceOver = forcedEnd || localTimeout;
  const timeLeft = timedOut ? 0 : Math.max(0, maxTime - elapsed);
  const liveMinutes = startedAt.current != null ? (Date.now() - startedAt.current) / 60000 : 0;
  const wpm = lockedWpm ?? (liveMinutes > 0 ? Math.round(totalCorrect / 5 / liveMinutes) : 0);
  const accuracy = totalTyped > 0
    ? Math.min(100, Math.round((completedChars / totalTyped) * 100))
    : 0;

  const handleType = (newValue: string) => {
    if (newValue.length > typed.length) {
      setTotalTyped((t: number) => t + (newValue.length - typed.length));
    }
    setTyped(newValue);
  };

  const completeWord = () => {
    const isLast = wordIndex === words.length - 1;
    setCompletedChars((c: number) => c + currentWord.length + (isLast ? 0 : 1));
    setWordIndex((i: number) => i + 1);
    setTyped("");
    if (!isLast) setTotalTyped((t: number) => t + 1);
  };

  useEffect(() => {
    if (typed.length > 0 || wordIndex > 0 || completedChars > 0 || totalTyped > 0 || elapsed > 0) {
      hasProgressRef.current = true;
    }
  }, [typed, wordIndex, completedChars, totalTyped, elapsed]);

  useEffect(() => {
    if (initialText) {
      setPassage(initialText);
      return;
    }
    if (!practice) {
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const quote = await getRandomQuote();
        if (!cancelled && !hasProgressRef.current && quote.text) {
          setPassage(quote.text);
        }
      } catch {
        // fallback
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [practice, initialText]);

  useEffect(() => {
    if (playerDone && lockedWpm === null) {
      const mins = startedAt.current != null ? (Date.now() - startedAt.current) / 60000 : 0;
      setLockedWpm(mins > 0 ? Math.round(totalCorrect / 5 / mins) : 0);
      setLockedElapsed(Math.round(mins * 60));
    }
  }, [playerDone, lockedWpm, totalCorrect]);

  useEffect(() => {
    if (active && startedAt.current === null) {
      startedAt.current = Date.now();
    }
  }, [active]);

  useEffect(() => {
    if (!active || raceOver) return;
    const id = setInterval(() => {
      if (startedAt.current !== null) {
        setElapsed(Math.floor((Date.now() - startedAt.current) / 1000));
      }
    }, 500);
    return () => clearInterval(id);
  }, [active, raceOver]);

  return {
    passage, words, wordIndex, typed,
    handleType, completeWord,
    elapsed, timeLeft, wpm, progress, finished, playerDone, timedOut,
    finishTime: lockedElapsed,
    accuracy,
    totalCorrect,
  };
}
