import { useState, useMemo, useEffect, useRef } from 'react';
import {
  Calendar,
  Filter,
  Search,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Plus,
  UserPlus,
  CalendarDays,
  Phone,
  MessageCircle,
  CheckSquare,
  Square,
  Pin,
} from 'lucide-react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { FollowUpColumn } from '@/components/board/FollowUpColumn';
import { FollowUpDetailModal } from '@/components/board/FollowUpDetailModal';
import { BatchContactModal } from '@/components/board/BatchContactModal';
import { ReminderTracker } from '@/components/board/ReminderTracker';
import { useFollowUpStore } from '@/store/useFollowUpStore';
import { useAuthStore } from '@/store/useAuthStore';
import type { FollowUpWithDetails, BoardColumnType } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatDateCN, getToday } from '@/utils';

export default function Board() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const initialHighlightId = searchParams.get('highlight');

  const [selectedFollowUp, setSelectedFollowUp] = useState<FollowUpWithDetails | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState<string>('all');
  const [selectedReception, setSelectedReception] = useState<string>('all');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const [highlightedColumn, setHighlightedColumn] = useState<BoardColumnType | null>(null);
  const hasOpenedRef = useRef(false);

  const todayFollowUps = useFollowUpStore(state => state.getTodayFollowUps());
  const overdueFollowUps = useFollowUpStore(state => state.getOverdueFollowUps());
  const futureFollowUps = useFollowUpStore(state => state.getFutureFollowUps());
  const completedFollowUps = useFollowUpStore(state => state.getCompletedFollowUps());
  const users = useAuthStore(state => state.users);

  useEffect(() => {
    if (initialHighlightId && !hasOpenedRef.current) {
      hasOpenedRef.current = true;
      const allItems = [
        { col: 'today' as BoardColumnType, items: todayFollowUps },
        { col: 'overdue' as BoardColumnType, items: overdueFollowUps },
        { col: 'future' as BoardColumnType, items: futureFollowUps },
        { col: 'completed' as BoardColumnType, items: completedFollowUps },
      ];
      for (const { col, items } of allItems) {
        const target = items.find(f => f.id === initialHighlightId);
        if (target) {
          setSelectedFollowUp(target);
          setIsModalOpen(true);
          setHighlightedId(initialHighlightId);
          setHighlightedColumn(col);
          break;
        }
      }
      navigate('/board', { replace: true });
    }
  }, [initialHighlightId, todayFollowUps, overdueFollowUps, futureFollowUps, completedFollowUps, navigate]);

  const doctors = [
    { id: 'all', name: '全部医生' },
    ...users.filter(u => u.role === 'doctor').map(u => ({ id: u.id, name: u.name })),
  ];

  const receptions = [
    { id: 'all', name: '全部前台' },
    { id: 'mine', name: '我的任务' },
    ...users.filter(u => u.role === 'reception').map(u => ({ id: u.id, name: u.name })),
  ];

  const currentUser = useAuthStore(state => state.currentUser);

  const columns = useMemo(() => {
    const filterByKeyword = (items: FollowUpWithDetails[]) => {
      if (!searchKeyword.trim()) return items;
      const keyword = searchKeyword.toLowerCase();
      return items.filter(item =>
        item.patient.name.toLowerCase().includes(keyword) ||
        item.patient.phone.includes(keyword) ||
        item.patient.archiveNo.toLowerCase().includes(keyword)
      );
    };

    const filterByDoctor = (items: FollowUpWithDetails[]) => {
      if (selectedDoctor === 'all') return items;
      return items.filter(item => item.assignedDoctorId === selectedDoctor);
    };

    const filterByReception = (items: FollowUpWithDetails[]) => {
      if (selectedReception === 'all') return items;
      if (selectedReception === 'mine') {
        if (!currentUser) return items;
        return items.filter(item => item.assignedReceptionId === currentUser.id);
      }
      return items.filter(item => item.assignedReceptionId === selectedReception);
    };

    const applyFilters = (items: FollowUpWithDetails[]) =>
      filterByReception(filterByDoctor(filterByKeyword(items)));

    return {
      today: applyFilters(todayFollowUps),
      overdue: applyFilters(overdueFollowUps),
      future: applyFilters(futureFollowUps),
      completed: applyFilters(completedFollowUps),
    };
  }, [todayFollowUps, overdueFollowUps, futureFollowUps, completedFollowUps, searchKeyword, selectedDoctor, selectedReception, currentUser]);

  const allSelectableItems = useMemo(() => [
    ...columns.today,
    ...columns.overdue,
  ], [columns.today, columns.overdue]);

  const handleCardClick = (followUp: FollowUpWithDetails) => {
    setSelectedFollowUp(followUp);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedFollowUp(null);
    setHighlightedId(null);
    setHighlightedColumn(null);
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    if (selectedIds.size === allSelectableItems.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(allSelectableItems.map(i => i.id)));
    }
  };

  const totalPending = columns.today.length + columns.overdue.length;

  return (
    <div className="h-full flex flex-col p-6">
      <div className="shrink-0 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">随访看板</h1>
            <p className="text-sm text-slate-500 mt-1">
              {formatDateCN(getToday())} · 待联系 <span className="font-medium text-warning-600">{totalPending}</span> 位患者
              {selectedReception === 'mine' && currentUser && (
                <span className="ml-2 text-primary-600">· 查看我的任务</span>
              )}
              {highlightedColumn && highlightedId && (
                <span className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 bg-primary-100 text-primary-700 rounded text-xs font-medium animate-pulse">
                  <Pin size={12} />
                  已定位到「{highlightedColumn === 'today' ? '今日需联系' :
                    highlightedColumn === 'overdue' ? '逾期未联系' :
                    highlightedColumn === 'future' ? '未来待办' : '已完成'}」列
                </span>
              )}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {selectedIds.size > 0 && (
              <Button variant="secondary" size="md" onClick={() => setShowBatchModal(true)}>
                <Phone size={16} />
                批量联系 ({selectedIds.size})
              </Button>
            )}
            <Button
              variant={selectedIds.size > 0 ? 'ghost' : 'secondary'}
              size="md"
              onClick={selectAll}
            >
              {selectedIds.size === allSelectableItems.length && allSelectableItems.length > 0 ? (
                <CheckSquare size={16} />
              ) : (
                <Square size={16} />
              )}
              {selectedIds.size === allSelectableItems.length && allSelectableItems.length > 0 ? '取消全选' : '全选'}
            </Button>
          </div>
        </div>

        <ReminderTracker
          onOpenFollowUp={handleCardClick}
          currentReceptionFilter={selectedReception}
        />

        <div className="flex items-center gap-4 bg-white rounded-xl p-3 shadow-card border border-slate-100">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="搜索患者姓名、电话、档案号..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter size={16} className="text-slate-400" />
            <select
              value={selectedDoctor}
              onChange={(e) => setSelectedDoctor(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              {doctors.map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <UserPlus size={16} className="text-slate-400" />
            <select
              value={selectedReception}
              onChange={(e) => setSelectedReception(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              {receptions.map(r => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <Badge variant="danger">逾期 {columns.overdue.length}</Badge>
            <Badge variant="info">今日 {columns.today.length}</Badge>
            <Badge variant="default">未来 {columns.future.length}</Badge>
            <Badge variant="success">已完成 {columns.completed.length}</Badge>
          </div>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-4 gap-4 min-h-0">
        <FollowUpColumn
          type="today"
          title="今日需联系"
          items={columns.today}
          onCardClick={handleCardClick}
          color="blue"
          icon={<Clock size={20} className="text-slate-300" />}
          selectedIds={selectedIds}
          onToggleSelect={toggleSelect}
          highlightedId={highlightedId}
          isHighlightedColumn={highlightedColumn === 'today'}
        />

        <FollowUpColumn
          type="overdue"
          title="逾期未联系"
          items={columns.overdue}
          onCardClick={handleCardClick}
          color="orange"
          icon={<AlertTriangle size={20} className="text-slate-300" />}
          selectedIds={selectedIds}
          onToggleSelect={toggleSelect}
          highlightedId={highlightedId}
          isHighlightedColumn={highlightedColumn === 'overdue'}
        />

        <FollowUpColumn
          type="future"
          title="未来待办"
          items={columns.future}
          onCardClick={handleCardClick}
          color="gray"
          icon={<CalendarDays size={20} className="text-slate-300" />}
          selectedIds={selectedIds}
          onToggleSelect={toggleSelect}
          highlightedId={highlightedId}
          isHighlightedColumn={highlightedColumn === 'future'}
        />

        <FollowUpColumn
          type="completed"
          title="已完成"
          items={columns.completed}
          onCardClick={handleCardClick}
          color="green"
          icon={<CheckCircle2 size={20} className="text-slate-300" />}
          highlightedId={highlightedId}
          isHighlightedColumn={highlightedColumn === 'completed'}
        />
      </div>

      <FollowUpDetailModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        followUp={selectedFollowUp}
      />

      {showBatchModal && (
        <BatchContactModal
          selectedItems={allSelectableItems.filter(i => selectedIds.has(i.id))}
          onClose={() => {
            setShowBatchModal(false);
            setSelectedIds(new Set());
          }}
        />
      )}
    </div>
  );
}
