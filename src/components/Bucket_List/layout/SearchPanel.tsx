
import React from 'react';
import { SearchBar } from '../SearchBar';
import { SearchResults } from '../SearchResults';

export function SearchPanel() {
  return (
    <div className="flex h-full flex-col bg-black/90">
      <header className="border-b border-white/10 p-4">
        <SearchBar />
      </header>
      <main className="flex-1 overflow-y-auto p-4">
        <SearchResults />
      </main>
    </div>
  );
}
