import type { FollowUpWithDetails, BoardColumnType } from '@/types';
import { PatientCard } from './PatientCard';
import { cn } from '@/utils';

interface FollowUpColumnProps {
  type: BoardColumnType;
  title: string;
  items: FollowUpWithDetails[];
  onCardClick: (followUp: FollowUpWithDetails) => void;
  color?: 'blue' | 'orange' | 'green' | 'gray';
  icon: React.ReactNode;
}

const colorStyles = {
  blue: 'bg-blue-500',
  orange: 'bg-warning-500',
  green: 'bg-green-500',
  gray: 'bg-slate-400',
};

const headerColorStyles = {
  blue: 'bg-blue-50 border-blue-100',
  orange: 'bg-warning-50 border-warning-100',
  green: 'bg-green-50 border-green-100',
  gray: 'bg-slate-50 border-slate-100',
};

export function FollowUpColumn({
  type,
  title,
  items,
  onCardClick,
  color = 'blue',
  icon,
}: FollowUpColumnProps) {
  return (
    <div className="flex flex-col h-full min-w-0">
      <div className={cn(
        'px-4 py-3 rounded-t-xl border-b shrink-0 flex items-center gap-3',
        headerColorStyles[color]
      )}>
        <div className={cn(
          'w-2.5 h-2.5 rounded-full',
          colorStyles[color]
        )} />
        <h3 className="font-semibold text-slate-800 text-sm">{title}</h3>
        <span className="ml-auto px-2 py-0.5 bg-white rounded-full text-xs font-medium text-slate-600 shadow-sm">
          {items.length}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-slate-50 rounded-b-xl min-h-0">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-slate-400">
            <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center mb-3 shadow-sm">
              {icon}
            </div>
            <p className="text-sm">暂无记录</p>
          </div>
        ) : (
          items.map((followUp, index) => (
            <div key={followUp.id} style={{ animationDelay: `${index * 30}ms` }}>
              <PatientCard
                followUp={followUp}
                onClick={() => onCardClick(followUp)}
                columnType={type}
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
