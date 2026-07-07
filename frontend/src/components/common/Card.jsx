/**
 * Card.jsx - Reusable card component with glass morphism support
 */
import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';

const Card = ({
  children,
  className = '',
  hoverable = false,
  glassmorphism = false,
  noBorder = false,
  ...props
}) => {
  const { theme } = useTheme();

  const baseStyles = `rounded-xl p-6 transition-all duration-200`;
  
  const background = glassmorphism
    ? 'bg-white/10 backdrop-blur-md border border-white/20'
    : `bg-gray-800 border border-gray-700`;

  const hoverStyles = hoverable
    ? 'hover:bg-gray-700 hover:shadow-lg hover:border-gray-600 cursor-pointer'
    : '';

  const borderClass = noBorder ? 'border-0' : '';

  const cardClass = `${baseStyles} ${background} ${hoverStyles} ${borderClass} ${className}`;

  return (
    <div className={cardClass} {...props}>
      {children}
    </div>
  );
};

export default Card;
