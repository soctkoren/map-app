import React from 'react';
import type { LayerStyle } from '../types';
import { SVG_ICONS } from '../types';
import './SvgIconSelector.css';

interface SvgIconSelectorProps {
  onAddIcon: (svgPath: string, style: LayerStyle) => void;
}

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
      <button 
        className="add-icon-btn"
        onClick={() => handleIconClick(SVG_ICONS.mapPin)}
      >
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="icon-preview">
          <path d={SVG_ICONS.mapPin} fill="currentColor"/>
        </svg>
        Add Map Icon
      </button>
    </div>
  );
};

export default SvgIconSelector; 