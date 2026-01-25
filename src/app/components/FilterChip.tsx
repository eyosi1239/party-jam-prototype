interface FilterChipProps {
  label: string;
  selected?: boolean;
  onClick?: () => void;
}

export function FilterChip({ label, selected = false, onClick }: FilterChipProps) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-xl transition-all duration-200 text-sm whitespace-nowrap ${
        selected
          ? 'bg-[#00ff41] text-black shadow-lg shadow-[#00ff41]/30 font-medium'
          : 'bg-[#1a1a1a] text-[#9ca3af] border border-[#2a2a2a] hover:border-[#00ff41]/50 hover:text-[#00ff41]'
      }`}
    >
      {label}
    </button>
  );
}
