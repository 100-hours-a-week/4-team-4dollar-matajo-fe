import React, { useState, forwardRef } from 'react';
import styled, { css } from 'styled-components';
import theme from '../../../styles/theme';

// 인풋 종류
type InputVariant = 'default' | 'outlined' | 'filled';

// 인풋 크기
type InputSize = 'small' | 'medium' | 'large' | 'full';

// 인풋 상태
type InputStatus = 'default' | 'success' | 'error';

// 인풋 props 타입
interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  variant?: InputVariant;
  size?: InputSize;
  status?: InputStatus;
  label?: string;
  helperText?: string;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onLeftIconClick?: () => void;
  onRightIconClick?: () => void;
}

// 스타일드 컴포넌트 props 타입
interface StyledWrapperProps {
  $variant: InputVariant;
  $size: InputSize;
  $status: InputStatus;
  $fullWidth: boolean;
  $isFocused: boolean;
  $hasLeftIcon: boolean;
  $hasRightIcon: boolean;
  $disabled: boolean;
}

interface StyledInputProps {
  $hasLeftIcon: boolean;
  $hasRightIcon: boolean;
}

// 변형에 따른 스타일
const variantStyles = {
  default: css<StyledWrapperProps>`
    border: 1px solid ${({ $isFocused, $status }) => {
      if ($isFocused) return theme.colors.primary.main;
      if ($status === 'error') return theme.colors.state.error;
      if ($status === 'success') return theme.colors.state.success;
      return theme.colors.neutral.lightGray;
    }};
    background-color: ${theme.colors.neutral.white};
    
    &:hover:not(:disabled) {
      border-color: ${({ $status }) => {
        if ($status === 'error') return theme.colors.state.error;
        if ($status === 'success') return theme.colors.state.success;
        return theme.colors.primary.light;
      }};
    }
  `,
  
  outlined: css<StyledWrapperProps>`
    border: 1px solid ${({ $isFocused, $status }) => {
      if ($isFocused) return theme.colors.primary.main;
      if ($status === 'error') return theme.colors.state.error;
      if ($status === 'success') return theme.colors.state.success;
      return theme.colors.neutral.lightGray;
    }};
    background-color: transparent;
    
    &:hover:not(:disabled) {
      border-color: ${({ $status }) => {
        if ($status === 'error') return theme.colors.state.error;
        if ($status === 'success') return theme.colors.state.success;
        return theme.colors.primary.light;
      }};
    }
  `,
  
  filled: css<StyledWrapperProps>`
    border: none;
    background-color: ${({ $isFocused, $disabled }) => {
      if ($disabled) return theme.colors.neutral.lightGray;
      if ($isFocused) return theme.colors.neutral.white;
      return theme.colors.neutral.background;
    }};
    box-shadow: ${({ $isFocused, $status }) => {
      if (!$isFocused) return 'none';
      if ($status === 'error') return `0 2px 0 0 ${theme.colors.state.error}`;
      if ($status === 'success') return `0 2px 0 0 ${theme.colors.state.success}`;
      return `0 2px 0 0 ${theme.colors.primary.main}`;
    }};
    
    &:hover:not(:disabled) {
      background-color: ${theme.colors.neutral.lightGray};
    }
  `,
};

// 사이즈에 따른 스타일
const sizeStyles = {
  small: css`
    height: 32px;
    font-size: ${theme.typography.fontSize.sm};
    
    input {
      padding: ${({ $hasLeftIcon, $hasRightIcon }: StyledWrapperProps) => {
        const leftPadding = $hasLeftIcon ? '32px' : '12px';
        const rightPadding = $hasRightIcon ? '32px' : '12px';
        return `0 ${rightPadding} 0 ${leftPadding}`;
      }};
    }
    
    .input-icon {
      &.left {
        left: 8px;
      }
      
      &.right {
        right: 8px;
      }
    }
  `,
  
  medium: css`
    height: 40px;
    font-size: ${theme.typography.fontSize.base};
    
    input {
      padding: ${({ $hasLeftIcon, $hasRightIcon }: StyledWrapperProps) => {
        const leftPadding = $hasLeftIcon ? '40px' : '16px';
        const rightPadding = $hasRightIcon ? '40px' : '16px';
        return `0 ${rightPadding} 0 ${leftPadding}`;
      }};
    }
    
    .input-icon {
      &.left {
        left: 12px;
      }
      
      &.right {
        right: 12px;
      }
    }
  `,
  
  large: css`
    height: 48px;
    font-size: ${theme.typography.fontSize.lg};
    
    input {
      padding: ${({ $hasLeftIcon, $hasRightIcon }: StyledWrapperProps) => {
        const leftPadding = $hasLeftIcon ? '48px' : '20px';
        const rightPadding = $hasRightIcon ? '48px' : '20px';
        return `0 ${rightPadding} 0 ${leftPadding}`;
      }};
    }
    
    .input-icon {
      &.left {
        left: 16px;
      }
      
      &.right {
        right: 16px;
      }
    }
  `,
  
  full: css`
    height: 48px;
    font-size: ${theme.typography.fontSize.lg};
    width: 100%;
    
    input {
      padding: ${({ $hasLeftIcon, $hasRightIcon }: StyledWrapperProps) => {
        const leftPadding = $hasLeftIcon ? '48px' : '20px';
        const rightPadding = $hasRightIcon ? '48px' : '20px';
        return `0 ${rightPadding} 0 ${leftPadding}`;
      }};
    }
    
    .input-icon {
      &.left {
        left: 16px;
      }
      
      &.right {
        right: 16px;
      }
    }
  `,
};

// 상태에 따른 헬퍼 텍스트 스타일
const helperTextStyles = {
  default: css`
    color: ${theme.colors.text.tertiary};
  `,
  
  success: css`
    color: ${theme.colors.state.success};
  `,
  
  error: css`
    color: ${theme.colors.state.error};
  `,
};

// 스타일드 컴포넌트
const InputWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: ${({ $fullWidth }: { $fullWidth: boolean }) => ($fullWidth ? '100%' : 'auto')};
`;

const Label = styled.label`
  margin-bottom: 6px;
  color: ${theme.colors.text.primary};
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.medium};
`;

const InputContainer = styled.div<StyledWrapperProps>`
  display: flex;
  align-items: center;
  position: relative;
  border-radius: ${theme.borderRadius.lg};
  transition: ${theme.transition.DEFAULT};
  width: ${({ $fullWidth }) => ($fullWidth ? '100%' : 'auto')};
  
  ${({ $variant }) => variantStyles[$variant]}
  ${({ $size }) => sizeStyles[$size]}
  
  ${({ $disabled }) => $disabled && css`
    opacity: 0.6;
    cursor: not-allowed;
  `}
`;

const StyledInput = styled.input`
  width: 100%;
  height: 100%;
  border: none;
  background: transparent;
  outline: none;
  color: ${theme.colors.text.primary};
  font-family: inherit;
  
  &::placeholder {
    color: ${theme.colors.text.tertiary};
  }
  
  &:disabled {
    cursor: not-allowed;
  }
`;

const HelperText = styled.span<{ $status: InputStatus }>`
  margin-top: 4px;
  font-size: ${theme.typography.fontSize.xs};
  
  ${({ $status }) => helperTextStyles[$status]}
`;

const InputIcon = styled.div<{ position: 'left' | 'right'; clickable: boolean }>`
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  top: 50%;
  transform: translateY(-50%);
  color: ${theme.colors.neutral.darkGray};
  
  ${({ clickable }) => clickable && css`
    cursor: pointer;
    
    &:hover {
      color: ${theme.colors.primary.main};
    }
  `}
`;

// 인풋 컴포넌트
const Input = forwardRef<HTMLInputElement, InputProps>(({
  variant = 'default',
  size = 'medium',
  status = 'default',
  label,
  helperText,
  fullWidth = false,
  leftIcon,
  rightIcon,
  onLeftIconClick,
  onRightIconClick,
  disabled = false,
  ...rest
}, ref) => {
  const [isFocused, setIsFocused] = useState(false);
  const hasLeftIcon = !!leftIcon;
  const hasRightIcon = !!rightIcon;
  
  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
    if (rest.onFocus) {
      rest.onFocus(e);
    }
  };
  
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);
    if (rest.onBlur) {
      rest.onBlur(e);
    }
  };
  
  return (
    <InputWrapper $fullWidth={fullWidth}>
      {label && <Label>{label}</Label>}
      <InputContainer
        $variant={variant}
        $size={size}
        $status={status}
        $fullWidth={fullWidth}
        $isFocused={isFocused}
        $hasLeftIcon={hasLeftIcon}
        $hasRightIcon={hasRightIcon}
        $disabled={disabled}
      >
        {leftIcon && (
          <InputIcon
            className="input-icon left"
            position="left"
            clickable={!!onLeftIconClick}
            onClick={onLeftIconClick}
          >
            {leftIcon}
          </InputIcon>
        )}
        <StyledInput
          ref={ref}
          $hasLeftIcon={hasLeftIcon}
          $hasRightIcon={hasRightIcon}
          disabled={disabled}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...rest}
        />
        {rightIcon && (
          <InputIcon
            className="input-icon right"
            position="right"
            clickable={!!onRightIconClick}
            onClick={onRightIconClick}
          >
            {rightIcon}
          </InputIcon>
        )}
      </InputContainer>
      {helperText && <HelperText $status={status}>{helperText}</HelperText>}
    </InputWrapper>
  );
});

Input.displayName = 'Input';

export default Input;