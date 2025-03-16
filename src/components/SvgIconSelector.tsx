import React from 'react';
import type { LayerStyle } from '../types';
import { SVG_ICONS } from '../types';
import './SvgIconSelector.css';

interface SvgIconSelectorProps {
  selectedIcon: string;
  onSelectIcon: (iconPath: string) => void;
}

type IconKey = keyof typeof SVG_ICONS;

const SvgIconSelector: React.FC<SvgIconSelectorProps> = ({ selectedIcon, onSelectIcon }) => {
  const iconNames = Object.keys(SVG_ICONS) as IconKey[];

  const getIconDisplayName = (key: IconKey) => {
    return key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1').trim();
  };

  return (
    <div className="map-pins-grid">
      {iconNames.map((iconName) => (
        <button
          key={iconName}
          className={`map-pin-button ${SVG_ICONS[iconName] === selectedIcon ? 'selected' : ''}`}
          onClick={() => onSelectIcon(SVG_ICONS[iconName])}
          title={getIconDisplayName(iconName)}
        >
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d={SVG_ICONS[iconName]} />
          </svg>
        </button>
      ))}
    </div>
  );
};

export default SvgIconSelector; 