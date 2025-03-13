import React, { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className = '',
  ...rest
}) => {
  // 기본 스타일
  const baseStyle =
    'rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';

  // 크기 스타일
  const sizeStyle = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-2.5 text-lg',
  };

  // 변형 스타일
  const variantStyle = {
    primary: 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-400',
    outline:
      'border border-primary-600 text-primary-600 hover:bg-primary-50 focus:ring-primary-500',
  };

  // 너비 스타일
  const widthStyle = fullWidth ? 'w-full' : '';

  // 스타일 조합
  const buttonStyle = `${baseStyle} ${sizeStyle[size]} ${variantStyle[variant]} ${widthStyle} ${className}`;

  return (
    <button className={buttonStyle} {...rest}>
      {children}
    </button>
  );
};

export default Button;
