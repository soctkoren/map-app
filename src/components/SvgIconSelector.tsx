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
    <select
      className="svg-icon-selector"
      value={selectedIcon}
      onChange={(e) => onSelectIcon(e.target.value)}
    >
      {iconNames.map((iconName) => (
        <option key={iconName} value={SVG_ICONS[iconName]}>
          {getIconDisplayName(iconName)}
        </option>
      ))}
    </select>
  );
};

export default SvgIconSelector; 