import { useState, useCallback } from 'react';

interface Tier {
  id: string;
  label: string;
  color: string;
  rank: number;
  items: any[];
}

interface UndoRedoState {
  tiers: Tier[];
  bankItems: any[];
}

const useUndoRedo = (initialState: UndoRedoState) => {
  const [history, setHistory] = useState<UndoRedoState[]>([initialState]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const setState = useCallback((newState: UndoRedoState) => {
    const newHistory = history.slice(0, currentIndex + 1);
    setHistory([...newHistory, newState]);
    setCurrentIndex(newHistory.length);
  }, [history, currentIndex]);

  const undo = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(prevIndex => prevIndex - 1);
    }
  }, [currentIndex]);

  const redo = useCallback(() => {
    if (currentIndex < history.length - 1) {
      setCurrentIndex(prevIndex => prevIndex + 1);
    }
  }, [currentIndex, history.length]);

  const canUndo = currentIndex > 0;
  const canRedo = currentIndex < history.length - 1;
  const currentState = history[currentIndex];

  return { currentState, setState, undo, redo, canUndo, canRedo };
};

export default useUndoRedo;