import React from 'react';
import type { LayerStyle } from '../types';
import { SVG_ICONS } from '../types';
import './SvgIconSelector.css';

interface SvgIconSelectorProps {
  onAddIcon: (svgPath: string, style: LayerStyle) => void;
}

const ICON_NAMES: { [key: string]: string } = {
  mapPin: 'Map Pin',
  heart: 'Heart',
  star: 'Star',
  babyBottle: 'Baby Bottle',
  graduation: 'Graduation'
};

const SvgIconSelector: React.FC<SvgIconSelectorProps> = ({ onAddIcon }) => {
  const handleIconClick = (svgPath: string) => {
    onAddIcon(svgPath, {
      fontSize: 48, // Default size for icons
      color: '#0066FF', // Default color
      rotation: 0,
      fontFamily: 'sans-serif',
      isSvg: true
    });
  };

  return (
    <div className="svg-icon-selector">
      <div className="icon-grid">
        {Object.entries(SVG_ICONS).map(([key, path]) => (
          <button 
            key={key}
            className="icon-button"
            onClick={() => handleIconClick(path)}
            title={ICON_NAMES[key]}
          >
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="icon-preview">
              <path d={path} fill="currentColor"/>
            </svg>
            <span className="icon-name">{ICON_NAMES[key]}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default SvgIconSelector; 