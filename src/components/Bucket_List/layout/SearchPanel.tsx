import React from 'react';
import { SearchBar } from '../SearchBar';
import { SearchResults } from '../SearchResults';
import { BackupRestore } from '../BackupRestore';

export function SearchPanel() {
  return (
    <div className="flex h-full flex-col p-6">
      <div className="flex items-center justify-between mb-6">
        <SearchBar />
        <BackupRestore />
      </div>
      <div className="flex-1 overflow-y-auto">
        <SearchResults />
      </div>
    </div>
  );
}