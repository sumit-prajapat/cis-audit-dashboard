/**
 * Button.jsx - Reusable button component with variants
 */
import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  isLoading = false,
  icon: Icon,
  onClick,
  ...props
}) => {
  const { theme, colors } = useTheme();

  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    primary: `bg-sky-600 text-white hover:bg-sky-700 focus:ring-sky-500`,
    secondary: `bg-gray-700 text-gray-100 hover:bg-gray-600 focus:ring-gray-500`,
    danger: `bg-red-600 text-white hover:bg-red-700 focus:ring-red-500`,
    warning: `bg-amber-600 text-white hover:bg-amber-700 focus:ring-amber-500`,
    success: `bg-green-600 text-white hover:bg-green-700 focus:ring-green-500`,
    ghost: `text-gray-300 hover:bg-gray-800 focus:ring-gray-600`,
    outline: `border border-gray-600 text-gray-300 hover:bg-gray-800 focus:ring-gray-600`,
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
    xl: 'px-8 py-4 text-xl',
  };

  const buttonClass = `${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`;

  return (
    <button
      onClick={onClick}
      disabled={disabled || isLoading}
      className={buttonClass}
      {...props}
    >
      {isLoading ? (
        <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : Icon ? (
        <Icon className="mr-2 h-5 w-5" />
      ) : null}
      {children}
    </button>
  );
};

export default Button;
