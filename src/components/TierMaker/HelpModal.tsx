import React, { useRef, useEffect } from 'react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  sectionToScrollTo?: string | null; // New prop
}

const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose, sectionToScrollTo }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const previouslyFocusedElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      previouslyFocusedElement.current = document.activeElement as HTMLElement;
      modalRef.current?.focus();
    } else {
      previouslyFocusedElement.current?.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && sectionToScrollTo && modalRef.current) {
      const targetElement = modalRef.current.querySelector(`#${sectionToScrollTo}`);
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }, [isOpen, sectionToScrollTo]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
      role="dialog"
      aria-modal="true"
      tabIndex={-1}
      ref={modalRef}
    >
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-2xl w-full relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-2xl"
          aria-label="Close"
        >
          &times;
        </button>
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Tier Maker Help / FAQ</h2>

        <div className="prose dark:prose-invert max-h-96 overflow-y-auto">
          <h3 id="getting-started" className="text-xl font-semibold mb-2">Getting Started</h3> {/* Added id */}
          <p>Welcome to the Tier Maker! Here's how to get started:</p>
          <ul className="list-disc list-inside mb-4">
            <li><strong>Select Scope:</strong> Choose whether you want to tier Artists, Albums, Tracks, or Playlists from the Item Bank.</li>
            <li><strong>Fetch Items:</strong> Based on your scope, items will be fetched from Spotify. You can also add custom items.</li>
            <li><strong>Drag & Drop:</strong> Drag items from the Item Bank to the Tier Rows to categorize them.</li>
            <li><strong>Reorder Items:</strong> Drag items within a tier to reorder them.</li>
            <li><strong>Edit Tiers:</strong> Double-click a tier label to edit it, or use the gear icon for more settings (color, etc.).</li>
            <li><strong>Add/Remove Tiers:</strong> Use the '+' and '-' buttons next to the tiers to manage them.</li>
            <li><strong>Save & Load:</strong> Save your tier list to your account or load a previously saved one.</li>
            <li><strong>Share:</strong> Make your tier list public and share the link with others!</li>
          </ul>

          <h3 id="keyboard-shortcuts" className="text-xl font-semibold mb-2">Keyboard Shortcuts</h3> {/* Added id */}
          <ul className="list-disc list-inside mb-4">
            <li><strong>Ctrl/Cmd + S:</strong> Save Tier List</li>
            <li><strong>Esc:</strong> Close any open modal (Edit Tiers, Item Details, Custom Item, Help)</li>
          </ul>

          <h3 id="troubleshooting" className="text-xl font-semibold mb-2">Troubleshooting</h3> {/* Added id */}
          <ul className="list-disc list-inside mb-4">
            <li><strong>Items not loading?</strong> Ensure you are logged in to Spotify and your access token is valid. Try refreshing the page.</li>
            <li><strong>Drag & Drop issues?</strong> Ensure your browser is up to date.</li>
          </ul>

          <p className="mt-4">If you have further questions, please contact support.</p>
        </div>
      </div>
    </div>
  );
};

export default HelpModal;