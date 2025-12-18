/**
 * AdminButton - Reusable button component for admin interface
 *
 * Matches main app's button styling with admin-specific variants.
 * Supports primary, secondary, danger, and ghost variants.
 */

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import styled, { css } from 'styled-components';
import { colors, fonts } from '../../../theme/styleVars';
import { IconProp } from '@fortawesome/fontawesome-svg-core';

/**
 * Button variant types
 */
type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';

/**
 * Button size types
 */
type ButtonSize = 'small' | 'medium' | 'large';

/**
 * Button props interface
 */
interface AdminButtonProps {
  /** Button text content */
  text?: string;
  /** Button variant style */
  variant?: ButtonVariant;
  /** Button size */
  size?: ButtonSize;
  /** FontAwesome icon */
  icon?: IconProp;
  /** Click handler */
  onClick?: () => void;
  /** Disabled state */
  disabled?: boolean;
  /** Full width button */
  fullWidth?: boolean;
  /** Loading state */
  loading?: boolean;
  /** HTML button type */
  type?: 'button' | 'submit' | 'reset';
  /** Additional CSS class name */
  className?: string;
  /** Children elements (alternative to text) */
  children?: React.ReactNode;
}

/**
 * Variant styles
 */
const variantStyles = {
  primary: css`
    background-color: ${colors.mint};
    border-color: ${colors.mint};
    color: white;

    &:hover:not(:disabled) {
      background-color: ${colors.darkPrimary};
      border-color: ${colors.darkPrimary};
    }

    &:active:not(:disabled) {
      background-color: ${colors.darkPrimary};
      border-color: ${colors.darkPrimary};
    }
  `,
  secondary: css`
    background-color: white;
    border-color: ${colors.slate};
    color: ${colors.slate};

    &:hover:not(:disabled) {
      background-color: ${colors.bodyBg};
      border-color: ${colors.mint};
      color: ${colors.mint};
    }
  `,
  danger: css`
    background-color: ${colors.salmon};
    border-color: ${colors.salmon};
    color: white;

    &:hover:not(:disabled) {
      background-color: #d16850;
      border-color: #d16850;
    }
  `,
  ghost: css`
    background-color: transparent;
    border-color: ${colors.mint};
    color: ${colors.mint};

    &:hover:not(:disabled) {
      background-color: ${colors.mint};
      border-color: ${colors.mint};
      color: white;
    }
  `
};

/**
 * Size styles
 */
const sizeStyles = {
  small: css`
    padding: 0.5rem 1rem;
    font-size: 0.75rem;
    height: 32px;
  `,
  medium: css`
    padding: 0.75rem 1.5rem;
    font-size: 0.875rem;
    height: 40px;
  `,
  large: css`
    padding: 1rem 2rem;
    font-size: 1rem;
    height: 48px;
  `
};

/**
 * Styled button component
 */
const StyledButton = styled.button<{
  $variant: ButtonVariant;
  $size: ButtonSize;
  $fullWidth: boolean;
}>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  border-radius: 20px;
  border: 2px solid transparent;
  font-family: ${fonts.montserrat};
  font-weight: 700;
  letter-spacing: 0.1em;
  text-align: center;
  text-transform: uppercase;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.08);

  ${(props) => variantStyles[props.$variant]}
  ${(props) => sizeStyles[props.$size]}
  ${(props) =>
    props.$fullWidth &&
    css`
      width: 100%;
    `}

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &:focus-visible {
    outline: 2px solid ${colors.mint};
    outline-offset: 2px;
  }
`;

/**
 * Loading spinner
 */
const Spinner = styled.div`
  width: 14px;
  height: 14px;
  border: 2px solid currentColor;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

/**
 * AdminButton Component
 */
const AdminButton: React.FC<AdminButtonProps> = ({
  text,
  variant = 'primary',
  size = 'medium',
  icon,
  onClick,
  disabled = false,
  fullWidth = false,
  loading = false,
  type = 'button',
  className,
  children
}) => {
  return (
    <StyledButton
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      $variant={variant}
      $size={size}
      $fullWidth={fullWidth}
      className={className}
    >
      {loading && <Spinner />}
      {!loading && icon && <FontAwesomeIcon icon={icon} />}
      {text || children}
    </StyledButton>
  );
};

export default AdminButton;
