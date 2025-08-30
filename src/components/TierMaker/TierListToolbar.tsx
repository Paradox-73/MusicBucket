interface TierListToolbarProps {
  title: string;
  setTitle: (title: string) => void;
  onSave: () => void;
  onEditTiers: () => void;
  onShare: () => void;
}

export const TierListToolbar = ({ title, setTitle, onSave, onEditTiers, onShare }: TierListToolbarProps) => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-center p-4 bg-gray-900 rounded-lg gap-4">
      <input 
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="My Awesome Tier List"
        className="text-2xl font-bold bg-transparent border-b-2 border-gray-700 focus:border-blue-500 outline-none text-white"/>
      <div className="flex gap-2">
        <button className="px-4 py-2 bg-gray-700 rounded">New</button>
        <button onClick={onEditTiers} className="px-4 py-2 bg-gray-700 rounded">Edit Tiers</button>
        <button onClick={onSave} className="px-4 py-2 bg-green-600 rounded">Save</button>
        <button onClick={onShare} className="px-4 py-2 bg-blue-600 rounded">Share</button>
      </div>
    </div>
  );
};
