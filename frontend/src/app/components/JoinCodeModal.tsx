import { useState, useEffect, useRef } from 'react';
import { Modal } from './Modal';

interface JoinCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onJoin: (code: string) => Promise<void>;
}

export function JoinCodeModal({ isOpen, onClose, onJoin }: JoinCodeModalProps) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setCode('');
      setError(null);
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const handleSubmit = async () => {
    const trimmed = code.trim().toUpperCase();
    if (trimmed.length !== 6) {
      setError('Code must be 6 characters');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await onJoin(trimmed);
      onClose();
    } catch (err: any) {
      setError(err?.message ?? 'Invalid code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSubmit();
    if (e.key === 'Escape') onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Join a Party"
      actions={
        <>
          <button
            onClick={onClose}
            disabled={loading}
            className="px-6 py-2.5 rounded-xl bg-[#1a1a1a] text-[#9ca3af] hover:bg-[#2a2a2a] transition-all duration-200 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || code.trim().length === 0}
            className="px-6 py-2.5 rounded-xl bg-[#00ff41] text-black font-medium hover:bg-[#00e639] transition-all duration-200 disabled:opacity-50"
          >
            {loading ? 'Joining...' : 'Join'}
          </button>
        </>
      }
    >
      <div className="space-y-4">
        <p>Enter the 6-character code from the host.</p>
        <input
          ref={inputRef}
          type="text"
          value={code}
          onChange={(e) => {
            setError(null);
            setCode(e.target.value.toUpperCase().slice(0, 6));
          }}
          onKeyDown={handleKeyDown}
          placeholder="ABC123"
          maxLength={6}
          className="w-full text-center text-3xl font-bold tracking-[0.4em] py-4 px-3 bg-[#0a0a0a] border-2 border-[#1a1a1a] rounded-xl text-white placeholder-[#3a3a3a] outline-none focus:border-[#00ff41] focus:shadow-[0_0_12px_rgba(0,255,65,0.3)] transition-all duration-200 uppercase"
        />
        {error && (
          <p className="text-red-400 text-sm text-center">{error}</p>
        )}
      </div>
    </Modal>
  );
}
