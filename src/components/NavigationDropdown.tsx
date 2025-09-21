import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';

interface NavItem {
  name: string;
  path?: string;
  submenu?: NavItem[];
}

interface NavigationDropdownProps {
  item: NavItem;
  isMobile?: boolean;
  onLinkClick?: () => void;
}

const NavigationDropdown: React.FC<NavigationDropdownProps> = ({ item, isMobile, onLinkClick }) => {
  const [isOpen, setIsOpen] = useState(false);

  if (item.submenu) {
    return (
      <div className={isMobile ? 'block' : 'relative'}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center justify-between w-full text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-secondary transition-colors duration-200 ${isMobile ? 'py-2' : ''}`}
        >
          {item.name}
          <ChevronDown className={`ml-1 h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
        {isOpen && (
          <div className={isMobile ? 'pl-4 space-y-1' : 'absolute left-0 mt-2 w-48 bg-white dark:bg-gray-700 rounded-md shadow-lg py-1 z-20'}>
            {item.submenu.map((subItem) => (
              <Link
                key={subItem.path}
                to={subItem.path!}
                className={`block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 ${isMobile ? '' : 'w-full text-left'}`}
                onClick={() => {
                  setIsOpen(false);
                  onLinkClick?.();
                }}
              >
                {subItem.name}
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <Link
      to={item.path!}
      className={`text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-secondary transition-colors duration-200 ${isMobile ? 'block py-2' : ''}`}
      onClick={onLinkClick}
    >
      {item.name}
    </Link>
  );
};

export default NavigationDropdown;
