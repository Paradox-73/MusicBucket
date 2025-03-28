import React from 'react';
import { Filters } from '../Filters';
import { BucketList } from '../BucketList';

export function BucketListPanel() {
  return (
    <div className="flex h-full flex-col p-6">
      <div className="mb-6">
        <Filters />
      </div>
      <div className="flex-1 overflow-y-auto">
        <BucketList />
      </div>
    </div>
  );
}