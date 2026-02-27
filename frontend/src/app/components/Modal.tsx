import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
}

export function Modal({ isOpen, onClose, title, children, actions }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-gradient-to-b from-[#0a0a0a] to-[#050505] border border-[#1a1a1a] rounded-3xl p-6 max-w-md w-full shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl text-white font-medium">{title}</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#9ca3af] hover:text-white hover:bg-[#1a1a1a] transition-all duration-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="text-[#9ca3af] mb-6">
          {children}
        </div>

        {/* Actions */}
        {actions && (
          <div className="flex gap-3 justify-end">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}
