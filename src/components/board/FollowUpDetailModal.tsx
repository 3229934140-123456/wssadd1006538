import { useState } from 'react';
import {
  Phone,
  MessageCircle,
  Calendar,
  User,
  FileText,
  StickyNote,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Clock,
  ChevronRight,
  Plus,
} from 'lucide-react';
import type { FollowUpWithDetails, FollowUpResult, PatientFeedback } from '@/types';
import { FOLLOW_UP_RESULTS, PROBLEM_TAGS, ProblemTag } from '@/types';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Avatar } from '../ui/Avatar';
import { Badge } from '../ui/Badge';
import { Tag } from '../ui/Tag';
import { TextArea } from '../ui/TextArea';
import { Input } from '../ui/Input';
import { formatDateCN, formatDateShort, addDays, getToday, TIME_SLOTS } from '@/utils';
import { cn } from '@/utils';
import { useFollowUpStore } from '@/store/useFollowUpStore';
import { useAppointmentStore } from '@/store/useAppointmentStore';
import { AppointmentScheduler } from './AppointmentScheduler';

interface FollowUpDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  followUp: FollowUpWithDetails | null;
}

type TabType = 'detail' | 'history' | 'appointment';

export function FollowUpDetailModal({ isOpen, onClose, followUp }: FollowUpDetailModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>('detail');
  const [selectedResult, setSelectedResult] = useState<FollowUpResult | null>(null);
  const [feedback, setFeedback] = useState<PatientFeedback>({});
  const [notes, setNotes] = useState('');
  const [nextFollowUpDate, setNextFollowUpDate] = useState(addDays(getToday(), 30));
  const [showScheduler, setShowScheduler] = useState(false);
  const updateFollowUpResult = useFollowUpStore(state => state.updateFollowUpResult);
  const addAppointment = useAppointmentStore(state => state.addAppointment);

  if (!followUp) return null;

  const { patient, cleaningRecord, doctor } = followUp;

  const handleResultSelect = (result: FollowUpResult) => {
    setSelectedResult(result);
    if (result === 'booked') {
      setShowScheduler(true);
    }
  };

  const handleSave = () => {
    if (!selectedResult) return;

    updateFollowUpResult(
      followUp.id,
      selectedResult,
      feedback,
      notes,
      selectedResult === 'connected' ? nextFollowUpDate : undefined
    );
    onClose();
  };

  const handleAppointmentBooked = (date: string, timeSlot: string) => {
    addAppointment({
      patientId: patient.id,
      followUpId: followUp.id,
      doctorId: doctor.id,
      date,
      timeSlot,
      type: '洁治后复查',
      notes: '随访预约',
    });

    updateFollowUpResult(
      followUp.id,
      'booked',
      feedback,
      notes
    );

    setShowScheduler(false);
    onClose();
  };

  const getResultBtnClass = (result: FollowUpResult) => {
    const isSelected = selectedResult === result;
    const baseClass = 'flex-1 py-3 px-4 rounded-xl border-2 text-sm font-medium transition-all duration-200 flex flex-col items-center gap-1';

    if (result === 'connected') {
      return cn(baseClass, isSelected
        ? 'border-green-500 bg-green-50 text-green-700'
        : 'border-slate-200 hover:border-green-300 hover:bg-green-50 text-slate-600');
    }
    if (result === 'noAnswer') {
      return cn(baseClass, isSelected
        ? 'border-slate-400 bg-slate-50 text-slate-700'
        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-600');
    }
    if (result === 'refused') {
      return cn(baseClass, isSelected
        ? 'border-danger-500 bg-danger-50 text-danger-700'
        : 'border-slate-200 hover:border-danger-300 hover:bg-danger-50 text-slate-600');
    }
    if (result === 'booked') {
      return cn(baseClass, isSelected
        ? 'border-info-500 bg-info-50 text-info-700'
        : 'border-slate-200 hover:border-info-300 hover:bg-info-50 text-slate-600');
    }
    return baseClass;
  };

  const getTagColor = (tagKey: ProblemTag): any => {
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

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" title="随访详情">
      {showScheduler ? (
        <AppointmentScheduler
          patient={patient}
          doctor={doctor}
          onConfirm={handleAppointmentBooked}
          onCancel={() => setShowScheduler(false)}
        />
      ) : (
        <div className="flex flex-col lg:flex-row min-h-[600px]">
          <div className="w-full lg:w-72 bg-slate-50 border-b lg:border-b-0 lg:border-r border-slate-100 p-5 shrink-0">
            <div className="flex flex-col items-center">
              <Avatar name={patient.name} size="xl" />
              <h3 className="mt-3 text-lg font-semibold text-slate-900">{patient.name}</h3>
              <p className="text-sm text-slate-500">
                {patient.gender === 'male' ? '男' : '女'} · {patient.age}岁
              </p>
              <Badge variant="info" className="mt-2">
                {doctor.name}
              </Badge>
            </div>

            <div className="mt-6 space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <Phone size={16} className="text-slate-400" />
                <span className="text-slate-700">{patient.phone}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <FileText size={16} className="text-slate-400" />
                <span className="text-slate-700">档案号: {patient.archiveNo}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Calendar size={16} className="text-slate-400" />
                <span className="text-slate-700">初诊: {formatDateShort(patient.firstVisitDate)}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <AlertCircle size={16} className="text-slate-400" />
                <span className="text-slate-700">
                  计划回访: {formatDateShort(followUp.plannedDate)}
                </span>
              </div>
            </div>

            <div className="mt-6">
              <h4 className="text-sm font-medium text-slate-700 mb-2">快捷操作</h4>
              <div className="space-y-2">
                <button className="w-full flex items-center gap-2 px-3 py-2 bg-white rounded-lg text-sm text-slate-700 hover:bg-primary-50 hover:text-primary-600 border border-slate-200 transition-colors">
                  <Phone size={16} />
                  拨打电话
                </button>
                <button className="w-full flex items-center gap-2 px-3 py-2 bg-white rounded-lg text-sm text-slate-700 hover:bg-primary-50 hover:text-primary-600 border border-slate-200 transition-colors">
                  <MessageCircle size={16} />
                  发送微信
                </button>
              </div>
            </div>
          </div>

          <div className="flex-1 flex flex-col min-w-0">
            <div className="flex border-b border-slate-100 px-5">
              {[
                { key: 'detail', label: '本次洁治详情' },
                { key: 'history', label: '随访记录' },
                { key: 'appointment', label: '预约记录' },
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as TabType)}
                  className={cn(
                    'px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors',
                    activeTab === tab.key
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-slate-500 hover:text-slate-700'
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto p-5">
              {activeTab === 'detail' && (
                <div className="space-y-5 animate-fade-in">
                  <div>
                    <h4 className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-2">
                      <StickyNote size={16} className="text-primary-500" />
                      问题标签
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {cleaningRecord.problemTags.map(tag => (
                        <Tag key={tag} color={getTagColor(tag)}>
                          {PROBLEM_TAGS.find(t => t.key === tag)?.label}
                        </Tag>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-2">
                      <FileText size={16} className="text-primary-500" />
                      洁治项目
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {cleaningRecord.items.map(item => (
                        <span key={item} className="px-3 py-1 bg-slate-100 rounded-md text-sm text-slate-700">
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-2">
                      <User size={16} className="text-primary-500" />
                      医生交代事项
                    </h4>
                    <div className="p-4 bg-primary-50 rounded-xl text-sm text-slate-700 leading-relaxed">
                      {cleaningRecord.doctorNotes}
                    </div>
                  </div>

                  {cleaningRecord.suggestions && (
                    <div>
                      <h4 className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-2">
                        <MessageCircle size={16} className="text-primary-500" />
                        建议话术
                      </h4>
                      <div className="p-4 bg-info-50 rounded-xl text-sm text-slate-700 leading-relaxed border border-info-100">
                        "{cleaningRecord.suggestions}"
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'history' && (
                <div className="space-y-4 animate-fade-in">
                  <div className="text-center py-8 text-slate-400">
                    <Clock size={32} className="mx-auto mb-2 opacity-50" />
                    <p className="text-sm">历史随访记录</p>
                    <p className="text-xs mt-1">共 {followUp.attemptCount} 次联系</p>
                  </div>
                </div>
              )}

              {activeTab === 'appointment' && (
                <div className="space-y-4 animate-fade-in">
                  <div className="text-center py-8 text-slate-400">
                    <Calendar size={32} className="mx-auto mb-2 opacity-50" />
                    <p className="text-sm">暂无预约记录</p>
                  </div>
                </div>
              )}
            </div>

            <div className="border-t border-slate-100 p-5 bg-slate-50/50">
              <h4 className="text-sm font-semibold text-slate-800 mb-3">联系结果</h4>

              <div className="grid grid-cols-4 gap-2 mb-4">
                {FOLLOW_UP_RESULTS.map(result => (
                  <button
                    key={result.key}
                    onClick={() => handleResultSelect(result.key)}
                    className={getResultBtnClass(result.key)}
                  >
                    {result.key === 'connected' && <CheckCircle2 size={20} />}
                    {result.key === 'noAnswer' && <Clock size={20} />}
                    {result.key === 'refused' && <XCircle size={20} />}
                    {result.key === 'booked' && <Calendar size={20} />}
                    <span>{result.label}</span>
                  </button>
                ))}
              </div>

              {selectedResult === 'connected' && (
                <div className="space-y-4 animate-slide-down">
                  <h5 className="text-sm font-medium text-slate-700">患者反馈</h5>
                  <div className="grid grid-cols-2 gap-3">
                    <label className="flex items-center gap-2 p-3 bg-white rounded-lg border border-slate-200 cursor-pointer hover:border-primary-300 transition-colors">
                      <input
                        type="checkbox"
                        checked={feedback.bleedingImproved || false}
                        onChange={(e) => setFeedback({ ...feedback, bleedingImproved: e.target.checked })}
                        className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                      />
                      <span className="text-sm text-slate-700">刷牙出血已缓解</span>
                    </label>
                    <label className="flex items-center gap-2 p-3 bg-white rounded-lg border border-slate-200 cursor-pointer hover:border-primary-300 transition-colors">
                      <input
                        type="checkbox"
                        checked={feedback.flossUsing || false}
                        onChange={(e) => setFeedback({ ...feedback, flossUsing: e.target.checked })}
                        className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                      />
                      <span className="text-sm text-slate-700">按时使用牙线</span>
                    </label>
                  </div>

                  <TextArea
                    label="其他反馈"
                    placeholder="请输入患者的其他反馈或备注..."
                    value={feedback.otherComments || ''}
                    onChange={(e) => setFeedback({ ...feedback, otherComments: e.target.value })}
                    rows={3}
                  />

                  <Input
                    label="下次回访日期"
                    type="date"
                    value={nextFollowUpDate}
                    onChange={(e) => setNextFollowUpDate(e.target.value)}
                  />
                </div>
              )}

              {(selectedResult === 'refused' || selectedResult === 'noAnswer') && (
                <div className="space-y-4 animate-slide-down">
                  <TextArea
                    label="备注说明"
                    placeholder={selectedResult === 'refused' ? '请记录患者拒绝的原因...' : '请记录未接通的情况...'}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={2}
                  />
                </div>
              )}

              <div className="flex justify-end gap-3 mt-5">
                <Button variant="secondary" onClick={onClose}>
                  取消
                </Button>
                <Button
                  variant="primary"
                  onClick={handleSave}
                  disabled={!selectedResult}
                >
                  保存结果
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}
