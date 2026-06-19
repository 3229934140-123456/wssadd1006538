import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Phone,
  Calendar,
  FileText,
  User,
  Plus,
  Clock,
  ChevronDown,
  ChevronUp,
  StickyNote,
  BadgeCheck,
  CheckCircle2,
  CalendarDays,
  AlertCircle,
  Sparkles,
  X,
} from 'lucide-react';
import { usePatientStore } from '@/store/usePatientStore';
import { useFollowUpStore } from '@/store/useFollowUpStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useAppointmentStore } from '@/store/useAppointmentStore';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Tag } from '@/components/ui/Tag';
import { Modal } from '@/components/ui/Modal';
import { TextArea } from '@/components/ui/TextArea';
import { Input } from '@/components/ui/Input';
import {
  PROBLEM_TAGS,
  CLEANING_ITEMS,
  ProblemTag,
  FOLLOW_UP_RESULTS,
} from '@/types';
import { formatDateCN, formatDateShort, getToday, addDays, isToday, isPast } from '@/utils';
import { cn } from '@/utils';

export default function PatientDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const patient = usePatientStore(state => state.getPatientById(id || ''));
  const cleaningRecords = usePatientStore(state => state.getCleaningRecordsByPatient(id || ''));
  const followUps = useFollowUpStore(state => state.getFollowUpsByPatient(id || ''));
  const appointments = useAppointmentStore(state => state.getAppointmentsByPatient(id || ''));
  const doctors = useAuthStore(state => state.users.filter(u => u.role === 'doctor'));
  const receptions = useAuthStore(state => state.users.filter(u => u.role === 'reception'));
  const addCleaningRecord = usePatientStore(state => state.addCleaningRecord);
  const addFollowUp = useFollowUpStore(state => state.addFollowUp);

  const [showAddModal, setShowAddModal] = useState(false);
  const [expandedRecord, setExpandedRecord] = useState<string | null>(
    cleaningRecords[0]?.id || null
  );
  const [showSuccessToast, setShowSuccessToast] = useState<{ visible: boolean; group: 'today' | 'future' | 'overdue'; receptionName: string; plannedDate: string } | null>(null);

  const [cleaningDate, setCleaningDate] = useState(getToday());
  const [selectedItems, setSelectedItems] = useState<string[]>(['超声波洁治', '喷砂抛光']);
  const [selectedTags, setSelectedTags] = useState<ProblemTag[]>(['tartar']);
  const [doctorNotes, setDoctorNotes] = useState('');
  const [suggestions, setSuggestions] = useState('');
  const [followUpDate, setFollowUpDate] = useState(addDays(getToday(), 7));
  const [assignedReceptionId, setAssignedReceptionId] = useState<string>(receptions[0]?.id || '');

  if (!patient) {
    return (
      <div className="p-6 text-center">
        <p>患者不存在</p>
        <Button variant="secondary" onClick={() => navigate('/patients')}>
          返回列表
        </Button>
      </div>
    );
  }

  const doctor = doctors.find(d => d.id === patient.doctorId);

  const toggleItem = (item: string) => {
    if (selectedItems.includes(item)) {
      setSelectedItems(selectedItems.filter(i => i !== item));
    } else {
      setSelectedItems([...selectedItems, item]);
    }
  };

  const toggleTag = (tag: ProblemTag) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleAddRecord = () => {
    const record = addCleaningRecord({
      patientId: patient.id,
      doctorId: patient.doctorId,
      date: cleaningDate,
      items: selectedItems,
      problemTags: selectedTags,
      doctorNotes,
      suggestedFollowUpDate: followUpDate,
      suggestions,
    });

    const finalReceptionId = assignedReceptionId || receptions[0]?.id;
    const finalReceptionName = receptions.find(r => r.id === finalReceptionId)?.name || '前台';

    addFollowUp({
      patientId: patient.id,
      cleaningRecordId: record.id,
      assignedDoctorId: patient.doctorId,
      assignedReceptionId: finalReceptionId,
      plannedDate: followUpDate,
    });

    let group: 'today' | 'future' | 'overdue' = 'future';
    if (isToday(followUpDate)) {
      group = 'today';
    } else if (isPast(followUpDate)) {
      group = 'overdue';
    }

    setShowSuccessToast({
      visible: true,
      group,
      receptionName: finalReceptionName,
      plannedDate: followUpDate,
    });

    setShowAddModal(false);
    setSelectedItems(['超声波洁治', '喷砂抛光']);
    setSelectedTags(['tartar']);
    setDoctorNotes('');
    setSuggestions('');
    setFollowUpDate(addDays(getToday(), 7));
    setAssignedReceptionId(receptions[0]?.id || '');
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
    <div className="p-6">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/patients')}
          className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{patient.name}</h1>
          <p className="text-sm text-slate-500">
            {patient.gender === 'male' ? '男' : '女'} · {patient.age}岁 · 档案号 {patient.archiveNo}
          </p>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <Button variant="secondary">
            <Phone size={16} />
            拨打电话
          </Button>
          <Button variant="primary" onClick={() => setShowAddModal(true)}>
            <Plus size={16} />
            新增洁治记录
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-6">
        <div className="col-span-1">
          <Card className="p-5 sticky top-6">
            <div className="flex flex-col items-center">
              <Avatar name={patient.name} size="xl" />
              <h3 className="mt-3 text-lg font-semibold text-slate-900">{patient.name}</h3>
              <Badge variant="info" className="mt-1">{doctor?.name}</Badge>
            </div>

            <div className="mt-6 space-y-3 text-sm">
              <div className="flex items-center gap-3">
                <Phone size={16} className="text-slate-400" />
                <span className="text-slate-700">{patient.phone}</span>
              </div>
              <div className="flex items-center gap-3">
                <Calendar size={16} className="text-slate-400" />
                <span className="text-slate-700">初诊 {formatDateShort(patient.firstVisitDate)}</span>
              </div>
              <div className="flex items-center gap-3">
                <FileText size={16} className="text-slate-400" />
                <span className="text-slate-700">{cleaningRecords.length} 次洁治</span>
              </div>
              <div className="flex items-center gap-3">
                <BadgeCheck size={16} className="text-slate-400" />
                <span className="text-slate-700">{followUps.filter(f => f.status === 'completed').length} 次随访完成</span>
              </div>
            </div>

            {appointments.length > 0 && (
              <div className="mt-6 pt-4 border-t border-slate-100">
                <h4 className="text-sm font-medium text-slate-700 mb-2">下次预约</h4>
                {appointments.filter(a => a.status === 'confirmed').slice(0, 1).map(apt => (
                  <div key={apt.id} className="p-3 bg-primary-50 rounded-lg text-sm">
                    <p className="font-medium text-primary-700">{formatDateShort(apt.date)} {apt.timeSlot}</p>
                    <p className="text-primary-600 text-xs mt-1">{apt.type}</p>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        <div className="col-span-3 space-y-4">
          <Card>
            <Card.Header>
              <h3 className="font-semibold text-slate-800">洁治记录</h3>
              <p className="text-sm text-slate-500 mt-0.5">共 {cleaningRecords.length} 次记录</p>
            </Card.Header>
            <Card.Body>
              <div className="relative">
                <div className="absolute left-4 top-0 bottom-0 w-px bg-slate-200" />

                <div className="space-y-4">
                  {cleaningRecords.map((record, index) => {
                    const isExpanded = expandedRecord === record.id;
                    const followUp = followUps.find(f => f.cleaningRecordId === record.id);

                    return (
                      <div key={record.id} className="relative pl-10">
                        <div className={cn(
                          'absolute left-2.5 top-5 w-3 h-3 rounded-full border-2 border-white',
                          index === 0 ? 'bg-primary-500' : 'bg-slate-300'
                        )} />

                        <div
                          className={cn(
                            'bg-slate-50 rounded-xl border transition-all duration-200 cursor-pointer',
                            isExpanded ? 'border-primary-200 bg-primary-50/30' : 'border-slate-200 hover:border-slate-300'
                          )}
                          onClick={() => setExpandedRecord(isExpanded ? null : record.id)}
                        >
                          <div className="flex items-center justify-between p-4">
                            <div className="flex items-center gap-4">
                              <div>
                                <p className="font-medium text-slate-800">
                                  {formatDateCN(record.date)}
                                </p>
                                <p className="text-sm text-slate-500 mt-0.5">
                                  {doctor?.name}
                                </p>
                              </div>

                              <div className="flex flex-wrap gap-1.5">
                                {record.problemTags.slice(0, 3).map(tag => (
                                  <Tag key={tag} color={getTagColor(tag)}>
                                    {PROBLEM_TAGS.find(t => t.key === tag)?.label}
                                  </Tag>
                                ))}
                              </div>
                            </div>

                            <div className="flex items-center gap-3">
                              {followUp && (
                                <Badge variant={
                                  followUp.status === 'completed' ? 'success' :
                                  followUp.status === 'overdue' ? 'warning' : 'info'
                                }>
                                  {followUp.result
                                    ? FOLLOW_UP_RESULTS.find(r => r.key === followUp.result)?.label
                                    : followUp.status === 'pending' ? '待随访' :
                                      followUp.status === 'overdue' ? '已逾期' : '已完成'
                                  }
                                </Badge>
                              )}
                              {isExpanded ? (
                                <ChevronUp size={18} className="text-slate-400" />
                              ) : (
                                <ChevronDown size={18} className="text-slate-400" />
                              )}
                            </div>
                          </div>

                          {isExpanded && (
                            <div className="px-4 pb-4 pt-2 border-t border-slate-200 animate-slide-down">
                              <div className="grid grid-cols-2 gap-4 mt-3">
                                <div>
                                  <h5 className="text-sm font-medium text-slate-700 mb-2">洁治项目</h5>
                                  <div className="flex flex-wrap gap-1.5">
                                    {record.items.map(item => (
                                      <span key={item} className="px-2 py-1 bg-white rounded-md text-xs text-slate-600 border border-slate-200">
                                        {item}
                                      </span>
                                    ))}
                                  </div>
                                </div>

                                <div>
                                  <h5 className="text-sm font-medium text-slate-700 mb-2">问题标签</h5>
                                  <div className="flex flex-wrap gap-1.5">
                                    {record.problemTags.map(tag => (
                                      <Tag key={tag} color={getTagColor(tag)}>
                                        {PROBLEM_TAGS.find(t => t.key === tag)?.label}
                                      </Tag>
                                    ))}
                                  </div>
                                </div>
                              </div>

                              <div className="mt-4">
                                <h5 className="text-sm font-medium text-slate-700 mb-2 flex items-center gap-1.5">
                                  <StickyNote size={14} className="text-primary-500" />
                                  医生交代事项
                                </h5>
                                <p className="text-sm text-slate-600 leading-relaxed bg-white p-3 rounded-lg border border-slate-200">
                                  {record.doctorNotes}
                                </p>
                              </div>

                              {record.suggestions && (
                                <div className="mt-4">
                                  <h5 className="text-sm font-medium text-slate-700 mb-2 flex items-center gap-1.5">
                                    <FileText size={14} className="text-info-500" />
                                    建议话术
                                  </h5>
                                  <p className="text-sm text-slate-600 leading-relaxed bg-info-50 p-3 rounded-lg border border-info-100">
                                    "{record.suggestions}"
                                  </p>
                                </div>
                              )}

                              {followUp && (
                                <div className="mt-4">
                                  <h5 className="text-sm font-medium text-slate-700 mb-2 flex items-center gap-1.5">
                                    <Clock size={14} className="text-warning-500" />
                                    随访信息
                                  </h5>
                                  <div className="bg-white p-3 rounded-lg border border-slate-200 text-sm text-slate-600">
                                    <div className="flex items-center justify-between">
                                      <span>计划随访日期：{formatDateShort(followUp.plannedDate)}</span>
                                      <span>已联系 {followUp.attemptCount} 次</span>
                                    </div>
                                    {followUp.patientFeedback && (
                                      <div className="mt-2 pt-2 border-t border-slate-100">
                                        <p className="text-xs text-slate-500">患者反馈：</p>
                                        <div className="flex gap-3 mt-1">
                                          {followUp.patientFeedback.bleedingImproved !== undefined && (
                                            <span className={cn(
                                              'text-xs px-2 py-0.5 rounded',
                                              followUp.patientFeedback.bleedingImproved
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-red-100 text-red-700'
                                            )}>
                                              刷牙出血 {followUp.patientFeedback.bleedingImproved ? '已缓解' : '未缓解'}
                                            </span>
                                          )}
                                          {followUp.patientFeedback.flossUsing !== undefined && (
                                            <span className={cn(
                                              'text-xs px-2 py-0.5 rounded',
                                              followUp.patientFeedback.flossUsing
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-yellow-100 text-yellow-700'
                                            )}>
                                              {followUp.patientFeedback.flossUsing ? '使用牙线' : '未用牙线'}
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </Card.Body>
          </Card>
        </div>
      </div>

      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="新增洁治记录"
        size="lg"
      >
        <div className="p-5 space-y-5">
          <Input
            label="洁治日期"
            type="date"
            value={cleaningDate}
            onChange={(e) => setCleaningDate(e.target.value)}
          />

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">洁治项目</label>
            <div className="flex flex-wrap gap-2">
              {CLEANING_ITEMS.map(item => (
                <button
                  key={item}
                  type="button"
                  onClick={() => toggleItem(item)}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-sm font-medium transition-all border-2',
                    selectedItems.includes(item)
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                  )}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">问题标签</label>
            <div className="flex flex-wrap gap-2">
              {PROBLEM_TAGS.map(tag => (
                <button
                  key={tag.key}
                  type="button"
                  onClick={() => toggleTag(tag.key)}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-sm font-medium transition-all border-2',
                    selectedTags.includes(tag.key)
                      ? getTagBorderClass(tag.color)
                      : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                  )}
                >
                  {tag.label}
                </button>
              ))}
            </div>
          </div>

          <TextArea
            label="医生交代事项"
            placeholder="请输入医生对患者的交代和注意事项..."
            value={doctorNotes}
            onChange={(e) => setDoctorNotes(e.target.value)}
            rows={3}
          />

          <TextArea
            label="建议话术（可选）"
            placeholder="前台随访时的建议沟通话术..."
            value={suggestions}
            onChange={(e) => setSuggestions(e.target.value)}
            rows={2}
          />

          <Input
            label="建议回访日期"
            type="date"
            value={followUpDate}
            onChange={(e) => setFollowUpDate(e.target.value)}
          />

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">负责跟进前台</label>
            <select
              value={assignedReceptionId}
              onChange={(e) => setAssignedReceptionId(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
            >
              {receptions.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
            <p className="text-xs text-slate-400 mt-1">
              随访待办将进入该前台的看板
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <Button variant="secondary" onClick={() => setShowAddModal(false)}>
              取消
            </Button>
            <Button variant="primary" onClick={handleAddRecord}>
              保存记录
            </Button>
          </div>
        </div>
      </Modal>

      {showSuccessToast?.visible && (
        <div className="fixed top-6 right-6 z-50 animate-slide-up">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 p-5 w-[400px] overflow-hidden">
            <div className="flex items-start gap-4">
              <div className={cn(
                'w-12 h-12 rounded-xl flex items-center justify-center shrink-0',
                showSuccessToast.group === 'today' && 'bg-primary-100 text-primary-600',
                showSuccessToast.group === 'future' && 'bg-blue-100 text-blue-600',
                showSuccessToast.group === 'overdue' && 'bg-warning-100 text-warning-600',
              )}>
                {showSuccessToast.group === 'today' && <Clock size={24} />}
                {showSuccessToast.group === 'future' && <CalendarDays size={24} />}
                {showSuccessToast.group === 'overdue' && <AlertCircle size={24} />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={18} className="text-green-500" />
                  <h4 className="font-semibold text-slate-900">洁治记录已保存</h4>
                </div>
                <div className="mt-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <Sparkles size={14} className="text-slate-400" />
                    <span className="text-sm text-slate-600">
                      随访待办已进入：
                    </span>
                    <Badge variant={
                      showSuccessToast.group === 'today' ? 'info' :
                      showSuccessToast.group === 'overdue' ? 'warning' : 'default'
                    }>
                      {showSuccessToast.group === 'today' && '🔥 今日需联系'}
                      {showSuccessToast.group === 'future' && '📅 未来待办'}
                      {showSuccessToast.group === 'overdue' && '⚠️ 逾期未联系'}
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-500">
                    计划回访：<span className="font-medium text-slate-700">{formatDateCN(showSuccessToast.plannedDate)}</span>
                  </p>
                  <p className="text-sm text-slate-500">
                    负责前台：<span className="font-medium text-slate-700">{showSuccessToast.receptionName}</span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowSuccessToast(null)}
                className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors shrink-0"
              >
                <X size={18} />
              </button>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end gap-2">
              <Button variant="secondary" size="sm" onClick={() => setShowSuccessToast(null)}>
                知道了
              </Button>
              <Button variant="primary" size="sm" onClick={() => {
                setShowSuccessToast(null);
                navigate('/board');
              }}>
                前往看板
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function getTagBorderClass(color: string) {
  const map: Record<string, string> = {
    red: 'border-red-500 bg-red-50 text-red-700',
    orange: 'border-orange-500 bg-orange-50 text-orange-700',
    yellow: 'border-yellow-500 bg-yellow-50 text-yellow-700',
    green: 'border-green-500 bg-green-50 text-green-700',
    blue: 'border-blue-500 bg-blue-50 text-blue-700',
    purple: 'border-purple-500 bg-purple-50 text-purple-700',
    pink: 'border-pink-500 bg-pink-50 text-pink-700',
    gray: 'border-slate-500 bg-slate-50 text-slate-700',
  };
  return map[color] || map.gray;
}
