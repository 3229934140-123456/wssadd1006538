import { useState } from 'react';
import { Phone, MessageCircle, Clock, CalendarCheck, ChevronDown, ChevronUp, X } from 'lucide-react';
import { useFollowUpStore } from '@/store/useFollowUpStore';
import { formatDateShort } from '@/utils';
import { Badge } from '../ui/Badge';
import { Avatar } from '../ui/Avatar';
import { Button } from '../ui/Button';
import { cn } from '@/utils';
import type { FollowUpWithDetails } from '@/types';

interface ReminderTrackerProps {
  onOpenFollowUp: (followUp: FollowUpWithDetails) => void;
  currentReceptionFilter: string;
}

type ExpandedType = 'phone' | 'wechat' | 'noAnswer' | 'booked' | null;

export function ReminderTracker({ onOpenFollowUp, currentReceptionFilter }: ReminderTrackerProps) {
  const { phoneContacts, wechatContacts, noAnswerTomorrow, bookedConversions } =
    useFollowUpStore(state => state.getTodayStats());

  const [expanded, setExpanded] = useState<ExpandedType>(null);

  const statCards = [
    {
      key: 'phone' as const,
      title: '今日电话联系',
      count: phoneContacts.length,
      icon: <Phone size={18} />,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-100',
      textColor: 'text-blue-700',
      items: phoneContacts,
      expandedLabel: '电话联系详情',
    },
    {
      key: 'wechat' as const,
      title: '今日微信联系',
      count: wechatContacts.length,
      icon: <MessageCircle size={18} />,
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-100',
      textColor: 'text-green-700',
      items: wechatContacts,
      expandedLabel: '微信联系详情',
    },
    {
      key: 'noAnswer' as const,
      title: '未接明日待办',
      count: noAnswerTomorrow.length,
      icon: <Clock size={18} />,
      color: 'bg-warning-500',
      bgColor: 'bg-warning-50',
      borderColor: 'border-warning-100',
      textColor: 'text-warning-700',
      items: noAnswerTomorrow,
      expandedLabel: '明日待办明细',
    },
    {
      key: 'booked' as const,
      title: '预约复查转化',
      count: bookedConversions.length,
      icon: <CalendarCheck size={18} />,
      color: 'bg-info-500',
      bgColor: 'bg-info-50',
      borderColor: 'border-info-100',
      textColor: 'text-info-700',
      items: bookedConversions,
      expandedLabel: '预约转化明细',
    },
  ];

  const toggleExpand = (key: ExpandedType) => {
    setExpanded(expanded === key ? null : key);
  };

  const resultLabels: Record<string, { label: string; variant: string }> = {
    connected: { label: '已接通', variant: 'success' },
    noAnswer: { label: '未接通', variant: 'default' },
    refused: { label: '拒绝复诊', variant: 'danger' },
    booked: { label: '已预约', variant: 'info' },
  };

  return (
    <div className="mb-6 space-y-3">
      <div className="grid grid-cols-4 gap-3">
        {statCards.map((card) => (
          <button
            key={card.key}
            onClick={() => toggleExpand(card.key)}
            className={cn(
              'p-4 rounded-xl border transition-all text-left',
              card.bgColor,
              card.borderColor,
              expanded === card.key ? 'ring-2 ring-offset-2 ring-slate-300' : 'hover:shadow-md'
            )}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-slate-500 mb-1">{card.title}</p>
                <p className={cn('text-3xl font-bold', card.textColor)}>
                  {card.count}
                </p>
              </div>
              <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center text-white', card.color)}>
                {card.icon}
              </div>
            </div>
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-200/50">
              <span className="text-xs text-slate-400">今日累计</span>
              {expanded === card.key ? (
                <ChevronUp size={14} className="text-slate-400" />
              ) : (
                <ChevronDown size={14} className="text-slate-400" />
              )}
            </div>
          </button>
        ))}
      </div>

      {expanded && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-card animate-slide-down overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3 bg-slate-50 border-b border-slate-100">
            <h4 className="text-sm font-semibold text-slate-700">
              {statCards.find(c => c.key === expanded)?.expandedLabel}
            </h4>
            <Button variant="ghost" size="sm" onClick={() => setExpanded(null)}>
              <X size={14} />
            </Button>
          </div>
          <div className="p-4 max-h-[300px] overflow-y-auto">
            {(() => {
              const card = statCards.find(c => c.key === expanded);
              const items = card?.items || [];
              if (items.length === 0) {
                return (
                  <div className="text-center py-8 text-slate-400">
                    <p className="text-sm">暂无记录</p>
                  </div>
                );
              }
              return (
                <div className="space-y-2">
                  {items.map((item) => {
                    const lastLog = item.contactLogs?.[item.contactLogs.length - 1];
                    const resultInfo = lastLog ? resultLabels[lastLog.result] : null;
                    return (
                      <div
                        key={item.id}
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors group"
                      >
                        <Avatar name={item.patient.name} size="md" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-slate-800 truncate">{item.patient.name}</p>
                            {resultInfo && (
                              <Badge variant={resultInfo.variant as any} className="text-xs">
                                {resultInfo.label}
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {item.patient.phone} · 洁治 {formatDateShort(item.cleaningRecord.date)}
                          </p>
                          {lastLog?.notes && (
                            <p className="text-xs text-slate-400 mt-1 truncate">备注: {lastLog.notes}</p>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => {
                            onOpenFollowUp(item);
                            setExpanded(null);
                          }}
                        >
                          查看
                        </Button>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}
