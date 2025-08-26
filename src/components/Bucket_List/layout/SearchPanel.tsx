import React from 'react';
import { SearchBar } from '../SearchBar';
import { SearchResults } from '../SearchResults';

export function SearchPanel({ listId }: { listId: string }) {
  return (
    <div className="flex h-full flex-col bg-gray-100 dark:bg-black/90">
      <header className="border-b border-gray-200 dark:border-white/10 p-4">
        <SearchBar listId={listId} />
      </header>
      <main className="flex-1 overflow-y-auto p-4">
        <SearchResults listId={listId} />
      </main>
    </div>
  );
}