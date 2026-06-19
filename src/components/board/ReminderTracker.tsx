import { useState, useMemo } from 'react';
import {
  Phone,
  MessageCircle,
  Clock,
  CalendarCheck,
  ChevronDown,
  ChevronUp,
  X,
  TrendingUp,
  BarChart3,
} from 'lucide-react';
import { useFollowUpStore } from '@/store/useFollowUpStore';
import { useAuthStore } from '@/store/useAuthStore';
import { formatDateShort, formatDateCN, getToday, addDays } from '@/utils';
import { Badge } from '../ui/Badge';
import { Avatar } from '../ui/Avatar';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { cn } from '@/utils';
import type { ContactLogWithDetails, FollowUpWithDetails, DailyStats } from '@/types';

interface ReminderTrackerProps {
  onOpenFollowUp: (followUp: FollowUpWithDetails) => void;
  currentReceptionFilter: string;
}

type ExpandedType = 'phone' | 'wechat' | 'noAnswer' | 'booked' | null;

export function ReminderTracker({ onOpenFollowUp, currentReceptionFilter }: ReminderTrackerProps) {
  const currentUser = useAuthStore(state => state.currentUser);

  const filterReceptionId = useMemo(() => {
    if (currentReceptionFilter === 'mine' && currentUser) return currentUser.id;
    if (currentReceptionFilter !== 'all' && currentReceptionFilter !== 'mine') return currentReceptionFilter;
    return undefined;
  }, [currentReceptionFilter, currentUser]);

  const { phoneContacts, wechatContacts, noAnswerTomorrow, bookedConversions } =
    useFollowUpStore(state => state.getTodayStats(filterReceptionId));

  const recent7Days = useFollowUpStore(state => state.getRecent7DaysStats(filterReceptionId));

  const [expanded, setExpanded] = useState<ExpandedType>(null);
  const [showTrend, setShowTrend] = useState(false);

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
      expandedLabel: '电话联系明细',
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
      expandedLabel: '微信联系明细',
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

  const methodLabels: Record<string, { label: string; icon: React.ReactNode }> = {
    phone: { label: '电话', icon: <Phone size={12} /> },
    wechat: { label: '微信', icon: <MessageCircle size={12} /> },
  };

  const weekDays = ['日', '一', '二', '三', '四', '五', '六'];
  const maxValue = Math.max(...recent7Days.map(d => Math.max(d.totalContacts, 1)), 1);

  return (
    <div className="mb-6 space-y-3">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-base font-semibold text-slate-800 flex items-center gap-2">
          <BarChart3 size={18} className="text-primary-500" />
          今日运营数据
          {currentReceptionFilter === 'mine' && currentUser && (
            <span className="text-xs font-normal text-primary-600 bg-primary-50 px-2 py-0.5 rounded">
              我的任务
            </span>
          )}
        </h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowTrend(!showTrend)}
          className="gap-1.5"
        >
          <TrendingUp size={14} />
          {showTrend ? '收起趋势' : '查看近7天趋势'}
        </Button>
      </div>

      {showTrend && (
        <Card className="mb-3 overflow-hidden">
          <Card.Body className="pb-4">
            <h4 className="text-sm font-semibold text-slate-700 mb-4">近7天随访趋势</h4>
            <div className="flex items-end gap-2 h-36">
              {recent7Days.map((day, idx) => {
                const isToday = day.date === getToday();
                const totalHeight = (day.totalContacts / maxValue) * 100;
                const noAnswerHeight = day.totalContacts > 0 ? (day.noAnswer / day.totalContacts) * totalHeight : 0;
                const bookedHeight = day.totalContacts > 0 ? (day.booked / day.totalContacts) * totalHeight : 0;
                const connectedHeight = totalHeight - noAnswerHeight - bookedHeight;

                return (
                  <div key={day.date} className="flex-1 flex flex-col items-center gap-1.5">
                    <div className="w-full h-24 flex items-end gap-px">
                      <div className="flex-1 flex flex-col justify-end gap-px">
                        {connectedHeight > 0 && (
                          <div
                            className="w-full bg-green-400 rounded-t transition-all hover:bg-green-500"
                            style={{ height: `${connectedHeight}%` }}
                            title={`已接通/已联系: ${day.totalContacts - day.noAnswer - day.booked}`}
                          />
                        )}
                        {bookedHeight > 0 && (
                          <div
                            className="w-full bg-blue-400 transition-all hover:bg-blue-500"
                            style={{ height: `${bookedHeight}%` }}
                            title={`已预约: ${day.booked}`}
                          />
                        )}
                        {noAnswerHeight > 0 && (
                          <div
                            className="w-full bg-warning-400 rounded-b transition-all hover:bg-warning-500"
                            style={{ height: `${noAnswerHeight}%` }}
                            title={`未接通: ${day.noAnswer}`}
                          />
                        )}
                      </div>
                    </div>
                    <div className="text-center">
                      <p className={cn(
                        'text-xs font-medium',
                        isToday ? 'text-primary-600' : 'text-slate-500'
                      )}>
                        {weekDays[new Date(day.date).getDay()]}
                      </p>
                      <p className={cn(
                        'text-xs',
                        isToday ? 'text-primary-600 font-bold' : 'text-slate-400'
                      )}>
                        {new Date(day.date).getDate()}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {day.totalContacts}次
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex items-center justify-center gap-4 mt-3 pt-3 border-t border-slate-100">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-green-400" />
                <span className="text-xs text-slate-500">已联系</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-blue-400" />
                <span className="text-xs text-slate-500">已预约</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-warning-400" />
                <span className="text-xs text-slate-500">未接通</span>
              </div>
            </div>
          </Card.Body>
        </Card>
      )}

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
              <span className="text-xs text-slate-400">今日累计 · 按联系记录</span>
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
            <div>
              <h4 className="text-sm font-semibold text-slate-700">
                {statCards.find(c => c.key === expanded)?.expandedLabel}
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">
                共 {statCards.find(c => c.key === expanded)?.items.length} 条记录
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setExpanded(null)}>
              <X size={14} />
            </Button>
          </div>
          <div className="p-4 max-h-[360px] overflow-y-auto">
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
                  {items.map((log) => {
                    const resultInfo = resultLabels[log.result];
                    const methodInfo = methodLabels[log.contactMethod];
                    return (
                      <div
                        key={log.id}
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors group"
                      >
                        <Avatar name={log.patient.name} size="md" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-medium text-slate-800 truncate">{log.patient.name}</p>
                            {methodInfo && (
                              <Badge variant="default" className="text-xs gap-1">
                                {methodInfo.icon}
                                {methodInfo.label}
                              </Badge>
                            )}
                            {resultInfo && (
                              <Badge variant={resultInfo.variant as any} className="text-xs">
                                {resultInfo.label}
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {log.patient.phone} · 洁治 {formatDateShort(log.cleaningRecord.date)}
                          </p>
                          <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                            <span>联系时间: {log.contactTime}</span>
                            <span>操作: {log.operatorName}</span>
                          </div>
                          {log.notes && (
                            <p className="text-xs text-slate-500 mt-1 truncate">
                              备注: {log.notes}
                            </p>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => {
                            onOpenFollowUp(log.followUp);
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
