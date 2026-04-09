import { Lightbulb, AlertTriangle, Info, AlertCircle } from 'lucide-react';

type CalloutType = 'tip' | 'warning' | 'info' | 'danger';

const config: Record<
  CalloutType,
  { icon: React.ComponentType<{ className?: string }>; bg: string; border: string; iconColor: string }
> = {
  tip: {
    icon: Lightbulb,
    bg: 'bg-primary-500/5 dark:bg-primary-400/5',
    border: 'border-primary-500/20 dark:border-primary-400/20',
    iconColor: 'text-primary-500 dark:text-primary-400',
  },
  info: {
    icon: Info,
    bg: 'bg-blue-500/5 dark:bg-blue-400/5',
    border: 'border-blue-500/20 dark:border-blue-400/20',
    iconColor: 'text-blue-500 dark:text-blue-400',
  },
  warning: {
    icon: AlertTriangle,
    bg: 'bg-yellow-500/5 dark:bg-yellow-400/5',
    border: 'border-yellow-500/20 dark:border-yellow-400/20',
    iconColor: 'text-yellow-500 dark:text-yellow-400',
  },
  danger: {
    icon: AlertCircle,
    bg: 'bg-red-500/5 dark:bg-red-400/5',
    border: 'border-red-500/20 dark:border-red-400/20',
    iconColor: 'text-red-500 dark:text-red-400',
  },
};

export function Callout({
  type = 'tip',
  title,
  children,
}: {
  type?: CalloutType;
  title?: string;
  children: React.ReactNode;
}) {
  const { icon: Icon, bg, border, iconColor } = config[type];

  return (
    <div
      className={`my-6 rounded-lg border px-4 py-3.5 text-sm leading-relaxed ${bg} ${border}`}
    >
      <div className="flex items-start gap-3">
        <Icon className={`mt-0.5 h-4.5 w-4.5 shrink-0 ${iconColor}`} />
        <div className="min-w-0">
          {title && (
            <p className="mb-1 font-semibold text-[var(--text-highlighted)]">{title}</p>
          )}
          <div className="text-[var(--text-default)] [&_p]:my-1.5 [&_code]:text-xs [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_code]:bg-[var(--bg-muted)]">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
