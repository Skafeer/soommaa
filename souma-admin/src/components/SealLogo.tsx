interface SealLogoProps {
  size?: 'sm' | 'md' | 'lg';
}

const SIZES = {
  sm: { outer: 'h-9 w-9', text: 'text-sm' },
  md: { outer: 'h-14 w-14', text: 'text-lg' },
  lg: { outer: 'h-20 w-20', text: 'text-2xl' },
};

export function SealLogo({ size = 'md' }: SealLogoProps) {
  const s = SIZES[size];
  return (
    <div
      className={`${s.outer} flex items-center justify-center rounded-full border-2 border-dashed border-ink-700 p-1`}
    >
      <div className="flex h-full w-full items-center justify-center rounded-full border border-ink-700 bg-ink-50">
        <span className={`${s.text} font-display font-bold text-ink-800`}>س</span>
      </div>
    </div>
  );
}