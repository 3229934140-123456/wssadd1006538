import { useState, useMemo } from 'react';
import {
  Calendar,
  Filter,
  Search,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Plus,
  UserPlus,
} from 'lucide-react';
import { FollowUpColumn } from '@/components/board/FollowUpColumn';
import { FollowUpDetailModal } from '@/components/board/FollowUpDetailModal';
import { useFollowUpStore } from '@/store/useFollowUpStore';
import { usePatientStore } from '@/store/usePatientStore';
import type { FollowUpWithDetails, BoardColumnType } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatDateCN, getToday } from '@/utils';

export default function Board() {
  const [selectedFollowUp, setSelectedFollowUp] = useState<FollowUpWithDetails | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState<string>('all');

  const todayFollowUps = useFollowUpStore(state => state.getTodayFollowUps());
  const overdueFollowUps = useFollowUpStore(state => state.getOverdueFollowUps());
  const completedFollowUps = useFollowUpStore(state => state.getCompletedFollowUps());
  const patients = usePatientStore(state => state.patients);

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

    return {
      today: filterByDoctor(filterByKeyword(todayFollowUps)),
      overdue: filterByDoctor(filterByKeyword(overdueFollowUps)),
      completed: filterByDoctor(filterByKeyword(completedFollowUps)),
    };
  }, [todayFollowUps, overdueFollowUps, completedFollowUps, searchKeyword, selectedDoctor]);

  const handleCardClick = (followUp: FollowUpWithDetails) => {
    setSelectedFollowUp(followUp);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedFollowUp(null);
  };

  const doctors = [
    { id: 'all', name: '全部医生' },
    { id: 'doctor1', name: '张明医生' },
    { id: 'doctor2', name: '李华医生' },
    { id: 'doctor3', name: '王芳医生' },
  ];

  const totalPending = columns.today.length + columns.overdue.length;

  return (
    <div className="h-full flex flex-col p-6">
      <div className="shrink-0 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">随访看板</h1>
            <p className="text-sm text-slate-500 mt-1">
              {formatDateCN(getToday())} · 待联系 <span className="font-medium text-warning-600">{totalPending}</span> 位患者
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="secondary" size="md">
              <Plus size={16} />
              新增患者
            </Button>
            <Button variant="primary" size="md">
              <Calendar size={16} />
              查看日历
            </Button>
          </div>
        </div>

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

          <div className="ml-auto flex items-center gap-2">
            <Badge variant="warning">逾期 {columns.overdue.length}</Badge>
            <Badge variant="info">今日 {columns.today.length}</Badge>
            <Badge variant="success">已完成 {columns.completed.length}</Badge>
          </div>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-3 gap-4 min-h-0">
        <FollowUpColumn
          type="today"
          title="今日需联系"
          items={columns.today}
          onCardClick={handleCardClick}
          color="blue"
          icon={<Clock size={20} className="text-slate-300" />}
        />

        <FollowUpColumn
          type="overdue"
          title="逾期未联系"
          items={columns.overdue}
          onCardClick={handleCardClick}
          color="orange"
          icon={<AlertTriangle size={20} className="text-slate-300" />}
        />

        <FollowUpColumn
          type="completed"
          title="已完成"
          items={columns.completed}
          onCardClick={handleCardClick}
          color="green"
          icon={<CheckCircle2 size={20} className="text-slate-300" />}
        />
      </div>

      <FollowUpDetailModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        followUp={selectedFollowUp}
      />
    </div>
  );
}
