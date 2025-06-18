import React from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, size = 'md' }) => {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 transition-opacity duration-300 ease-in-out animate-fade-in"
      onClick={onClose}
    >
      <div
        className={`bg-brixium-bg-light rounded-xl shadow-2xl p-6 m-4 ${sizeClasses[size]} w-full transform transition-all duration-300 ease-in-out animate-slide-in-up relative`}
        onClick={(e) => e.stopPropagation()} 
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-brixium-gray hover:text-brixium-gray-light transition-colors"
          aria-label="Close modal"
        >
          <X size={24} />
        </button>
        {title && (
          <h2 className="text-xl font-semibold text-brixium-purple-light mb-4">
            {title}
          </h2>
        )}
        <div>{children}</div>
      </div>
    </div>
  );
};

export default Modal;