interface Props {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizes = {
  sm: 'h-4 w-4 border-2',
  md: 'h-8 w-8 border-2',
  lg: 'h-12 w-12 border-3',
};

export default function Spinner({ className = '', size = 'md' }: Props) {
  return (
    <div
      className={`animate-spin rounded-full border-indigo-600 border-t-transparent ${sizes[size]} ${className}`}
    />
  );
}

export function FullPageSpinner() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <Spinner size="lg" />
    </div>
  );
}
