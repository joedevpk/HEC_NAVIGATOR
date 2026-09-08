import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { Loader2, MapPin } from 'lucide-react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'dark';
type Size = 'sm' | 'md' | 'lg';
type BadgeColor = 'slate' | 'blue' | 'green' | 'amber' | 'red';

const variants: Record<Variant, string> = {
  primary:
    'bg-hec-500 text-white hover:bg-hec-600 shadow-glass focus-visible:ring-hec-300',
  secondary:
    'bg-white text-hec-950 border border-slate-200 hover:border-hec-300 hover:bg-hec-50 focus-visible:ring-hec-200',
  ghost:
    'bg-transparent text-hec-900 hover:bg-slate-100 focus-visible:ring-slate-200',
  dark: 'bg-hec-950 text-white hover:bg-hec-900 focus-visible:ring-hec-300',
};

const sizes: Record<Size, string> = {
  sm: 'h-9 px-3.5 text-sm rounded-xl gap-1.5',
  md: 'h-11 px-5 text-sm rounded-xl gap-2',
  lg: 'h-13 px-6 text-base rounded-2xl gap-2.5 py-3.5',
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  icon?: ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading,
      icon,
      children,
      className = '',
      disabled,
      type = 'button', // ⚠️ voir note plus bas
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        type={type}
        aria-busy={loading || undefined}
        className={`inline-flex items-center justify-center font-semibold transition-all duration-200 focus:outline-none focus-visible:ring-4 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98] ${variants[variant]} ${sizes[size]} ${className}`}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        ) : (
          icon && (
            <span aria-hidden="true" className="inline-flex">
              {icon}
            </span>
          )
        )}
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';

export function Logo({
  size = 'md',
  inverted = false,
}: {
  size?: 'sm' | 'md' | 'lg';
  inverted?: boolean;
}) {
  const box =
    size === 'lg' ? 'h-11 w-11' : size === 'sm' ? 'h-8 w-8' : 'h-9 w-9';
  const text =
    size === 'lg' ? 'text-xl' : size === 'sm' ? 'text-sm' : 'text-base';
  return (
    <div className="flex items-center gap-2.5">
      <div
        className={`${box} grid place-items-center rounded-xl bg-hec-950 shadow-glass`}
      >
        <MapPin
          className="h-1/2 w-1/2 text-hec-400"
          strokeWidth={2.5}
          aria-hidden="true"
        />
      </div>
      <div className="leading-tight">
        <div
          className={`font-display font-extrabold ${text} ${
            inverted ? 'text-white' : 'text-hec-950'
          }`}
        >
          HEC <span className="text-hec-500">Localisation</span>
        </div>
      </div>
    </div>
  );
}

export function Spinner({ label }: { label?: string }) {
  return (
    <div
      className="flex flex-col items-center justify-center gap-3 py-16 text-slate-500"
      role="status"
      aria-live="polite"
    >
      <Loader2 className="h-6 w-6 animate-spin text-hec-500" aria-hidden="true" />
      {label && <p className="text-sm">{label}</p>}
    </div>
  );
}

export function Badge({
  children,
  color = 'slate',
}: {
  children: ReactNode;
  color?: BadgeColor;
}) {
  const map: Record<BadgeColor, string> = {
    slate: 'bg-slate-100 text-slate-700',
    blue: 'bg-hec-50 text-hec-700',
    green: 'bg-emerald-50 text-emerald-700',
    amber: 'bg-amber-50 text-amber-700',
    red: 'bg-red-50 text-red-600',
  };
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${map[color]}`}
    >
      {children}
    </span>
  );
}

export function EmptyState({
  icon,
  title,
  description,
}: {
  icon: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-200 bg-white/60 px-6 py-14 text-center">
      <div
        className="grid h-12 w-12 place-items-center rounded-2xl bg-slate-100 text-slate-400"
        aria-hidden="true"
      >
        {icon}
      </div>
      <div>
        <p className="font-semibold text-hec-950">{title}</p>
        <p className="mt-1 text-sm text-slate-500">{description}</p>
      </div>
    </div>
  );
}