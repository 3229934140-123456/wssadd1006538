import { Clock, Calendar, User } from 'lucide-react';
import type { FollowUpWithDetails, ProblemTag } from '@/types';
import { PROBLEM_TAGS, FOLLOW_UP_RESULTS } from '@/types';
import { Avatar } from '../ui/Avatar';
import { Badge } from '../ui/Badge';
import { Tag } from '../ui/Tag';
import { Card } from '../ui/Card';
import { formatDateShort, getDaysDiff, getToday } from '@/utils';
import { cn } from '@/utils';

interface PatientCardProps {
  followUp: FollowUpWithDetails;
  onClick?: () => void;
  columnType: 'today' | 'overdue' | 'completed';
}

export function PatientCard({ followUp, onClick, columnType }: PatientCardProps) {
  const { patient, cleaningRecord, doctor, result, attemptCount } = followUp;

  const getTagColor = (tagKey: ProblemTag): 'red' | 'orange' | 'yellow' | 'green' | 'blue' | 'purple' | 'pink' | 'gray' => {
    const tag = PROBLEM_TAGS.find(t => t.key === tagKey);
    const colorMap: Record<string, any> = {
      red: 'red',
      orange: 'orange',
      yellow: 'yellow',
      purple: 'purple',
      blue: 'blue',
      pink: 'pink',
      gray: 'gray',
    };
    return colorMap[tag?.color || 'gray'] || 'gray';
  };

  const getResultInfo = () => {
    if (!result) return null;
    const info = FOLLOW_UP_RESULTS.find(r => r.key === result);
    return info;
  };

  const resultInfo = getResultInfo();

  const daysOverdue = columnType === 'overdue'
    ? getDaysDiff(followUp.plannedDate, getToday())
    : 0;

  return (
    <Card
      hover
      className={cn(
        'p-4 animate-slide-up',
        columnType === 'overdue' && 'border-l-4 border-l-warning-400'
      )}
      onClick={onClick}
    >
      <div className="flex items-start gap-3">
        <Avatar name={patient.name} size="lg" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-slate-900 truncate">{patient.name}</h4>
            {resultInfo && (
              <Badge
                variant={
                  resultInfo.color === 'green' ? 'success' :
                  resultInfo.color === 'red' ? 'danger' :
                  resultInfo.color === 'blue' ? 'info' : 'default'
                }
              >
                {resultInfo.label}
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
            <span>{patient.gender === 'male' ? '男' : '女'}</span>
            <span>·</span>
            <span>{patient.age}岁</span>
            <span>·</span>
            <span className="truncate">{patient.phone}</span>
          </div>

          <div className="flex flex-wrap gap-1.5 mt-3">
            {cleaningRecord.problemTags.slice(0, 3).map(tag => (
              <Tag key={tag} color={getTagColor(tag)}>
                {PROBLEM_TAGS.find(t => t.key === tag)?.label}
              </Tag>
            ))}
            {cleaningRecord.problemTags.length > 3 && (
              <Tag color="gray">+{cleaningRecord.problemTags.length - 3}</Tag>
            )}
          </div>

          <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
            <div className="flex items-center gap-1 text-xs text-slate-500">
              <Calendar size={12} />
              <span>洁治: {formatDateShort(cleaningRecord.date)}</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-slate-500">
              <User size={12} />
              <span>{doctor.name}</span>
            </div>
          </div>

          {columnType === 'overdue' && (
            <div className="flex items-center gap-1 mt-2 text-xs text-warning-600 bg-warning-50 px-2 py-1 rounded-md">
              <Clock size={12} />
              <span>已逾期 {daysOverdue} 天 · 已联系 {attemptCount} 次</span>
            </div>
          )}

          {columnType === 'today' && attemptCount > 1 && (
            <div className="flex items-center gap-1 mt-2 text-xs text-info-600 bg-info-50 px-2 py-1 rounded-md">
              <Clock size={12} />
              <span>第 {attemptCount} 次联系</span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
