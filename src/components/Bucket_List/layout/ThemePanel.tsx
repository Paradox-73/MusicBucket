import React from 'react';

interface ThemePanelProps {
  // Props for theme customization
}

const ThemePanel: React.FC<ThemePanelProps> = () => {
  return (
    <div className="mt-8 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
      <h2 className="text-xl font-bold mb-4">Theme Customization</h2>
      <p className="text-gray-600 dark:text-gray-300">Customize your bucket list's look and feel!</p>
      {/* Placeholder for theme options */}
      <div className="flex gap-4 mt-4">
        <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Light Theme</button>
        <button className="px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-900">Dark Theme</button>
      </div>
    </div>
  );
};

export default ThemePanel;