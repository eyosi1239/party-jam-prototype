import { useState } from 'react';
import { Modal } from './Modal';

const MOODS = [
  { id: 'chill', label: 'Chill', emoji: '😌' },
  { id: 'hype', label: 'Hype', emoji: '🔥' },
  { id: 'workout', label: 'Workout', emoji: '💪' },
  { id: 'focus', label: 'Focus', emoji: '🧠' },
];

interface CreatePartyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (mood: string) => Promise<void>;
}

export function CreatePartyModal({ isOpen, onClose, onCreate }: CreatePartyModalProps) {
  const [selectedMood, setSelectedMood] = useState('chill');
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    setLoading(true);
    try {
      await onCreate(selectedMood);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Party"
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
            onClick={handleCreate}
            disabled={loading}
            className="px-6 py-2.5 rounded-xl bg-[#00ff41] text-black font-medium hover:bg-[#00e639] transition-all duration-200 disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create'}
          </button>
        </>
      }
    >
      <div className="space-y-4">
        <p>Choose a vibe for your party.</p>
        <div className="grid grid-cols-2 gap-3">
          {MOODS.map((mood) => (
            <button
              key={mood.id}
              onClick={() => setSelectedMood(mood.id)}
              className={`p-4 rounded-xl border-2 text-center transition-all duration-200 ${
                selectedMood === mood.id
                  ? 'border-[#00ff41] bg-[#00ff41]/10 text-white'
                  : 'border-[#2a2a2a] bg-[#0a0a0a] text-[#9ca3af] hover:border-[#00ff41]/40'
              }`}
            >
              <div className="text-2xl mb-1">{mood.emoji}</div>
              <div className="text-sm font-medium capitalize">{mood.label}</div>
            </button>
          ))}
        </div>
      </div>
    </Modal>
  );
}
