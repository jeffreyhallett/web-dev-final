'use client';

import { useEffect, useRef } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface ModalProps {
   isOpen: boolean;
   onClose: () => void;
   title: string;
   children: React.ReactNode;
   size?: 'sm' | 'md' | 'lg';
}

export default function Modal({ isOpen, onClose, title, children, size = 'md' }: ModalProps) {
   const modalRef = useRef<HTMLDivElement>(null);

   // Handle escape key
   useEffect(() => {
      const handleEscape = (e: KeyboardEvent) => {
         if (e.key === 'Escape' && isOpen) {
            onClose();
         }
      };

      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
   }, [isOpen, onClose]);

   // Handle click outside
   const handleBackdropClick = (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
         onClose();
      }
   };

   // Prevent body scroll when modal is open
   useEffect(() => {
      if (isOpen) {
         document.body.style.overflow = 'hidden';
      } else {
         document.body.style.overflow = 'unset';
      }
      return () => {
         document.body.style.overflow = 'unset';
      };
   }, [isOpen]);

   if (!isOpen) return null;

   const sizeClasses = {
      sm: 'max-w-sm',
      md: 'max-w-md',
      lg: 'max-w-lg',
   };

   return (
      <div
         className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
         onClick={handleBackdropClick}
      >
         <div
            ref={modalRef}
            className={`bg-white rounded-xl shadow-xl w-full ${sizeClasses[size]} mx-4 max-h-[90vh] overflow-hidden flex flex-col`}
         >
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
               <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
               <button
                  onClick={onClose}
                  className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
               >
                  <XMarkIcon className="w-5 h-5 text-gray-500" />
               </button>
            </div>
            <div className="px-6 py-4 overflow-y-auto flex-1">
               {children}
            </div>
         </div>
      </div>
   );
}
