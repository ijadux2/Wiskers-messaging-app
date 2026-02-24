import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  children: React.ReactNode;
}

export function Button({ variant = 'primary', size = 'md', fullWidth = false, children, className = '', ...props }: ButtonProps) {
  return (
    <button
      className={`btn btn-${variant} ${size === 'lg' ? 'btn-lg' : size === 'sm' ? 'btn-sm' : ''} ${fullWidth ? 'btn-full' : ''} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export function IconButton({ size = 'md', children, className = '', ...props }: IconButtonProps) {
  return (
    <button
      className={`icon-btn ${size === 'sm' ? 'icon-btn-sm' : size === 'lg' ? 'icon-btn-lg' : ''} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: string;
  error?: string;
}

export function Input({ label, icon, error, className = '', ...props }: InputProps) {
  return (
    <div className="form-group">
      {label && <label>{label}</label>}
      <div className="input-wrapper">
        {icon && <i className={`fas fa-${icon}`} />}
        <input className={`${icon ? 'has-icon' : ''} ${error ? 'error' : ''} ${className}`} {...props} />
      </div>
      {error && <span className="error-text">{error}</span>}
    </div>
  );
}

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
}

export function TextArea({ label, className = '', ...props }: TextAreaProps) {
  return (
    <div className="form-group">
      {label && <label>{label}</label>}
      <textarea className={className} {...props} />
    </div>
  );
}

interface AvatarProps {
  src: string;
  alt?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  online?: boolean;
  onClick?: () => void;
}

export function Avatar({ src, alt = '', size = 'md', online, onClick }: AvatarProps) {
  return (
    <div className={`avatar-wrapper ${onClick ? 'clickable' : ''}`} onClick={onClick}>
      <img src={src} alt={alt} className={`avatar avatar-${size}`} />
      {online !== undefined && <span className={`online-indicator ${online ? 'online' : 'offline'}`} />}
    </div>
  );
}

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

export function Modal({ isOpen, onClose, title, children, size = 'md' }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={`modal modal-${size}`} onClick={e => e.stopPropagation()}>
        {title && (
          <div className="modal-header">
            <h2>{title}</h2>
            <button className="close-btn" onClick={onClose}>&times;</button>
          </div>
        )}
        <div className="modal-body">
          {children}
        </div>
      </div>
    </div>
  );
}

interface BadgeProps {
  count: number;
  children: React.ReactNode;
}

export function Badge({ count, children }: BadgeProps) {
  return (
    <div className="badge-wrapper">
      {children}
      {count > 0 && <span className="badge">{count > 99 ? '99+' : count}</span>}
    </div>
  );
}

export function Spinner() {
  return <div className="spinner"><i className="fas fa-spinner fa-spin" /></div>;
}

export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`skeleton ${className}`} />;
}
