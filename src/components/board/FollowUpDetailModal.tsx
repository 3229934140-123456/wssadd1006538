import { useState, useEffect } from 'react';
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
  Plus,
  History,
  CalendarCheck,
  Check,
  ArrowRight,
} from 'lucide-react';
import type {
  FollowUpWithDetails,
  FollowUpResult,
  PatientFeedback,
  ContactMethod,
  ContactLog,
  Appointment,
} from '@/types';
import {
  FOLLOW_UP_RESULTS,
  PROBLEM_TAGS,
  ProblemTag,
  CONTACT_METHODS,
} from '@/types';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Avatar } from '../ui/Avatar';
import { Badge } from '../ui/Badge';
import { Tag } from '../ui/Tag';
import { TextArea } from '../ui/TextArea';
import { Input } from '../ui/Input';
import { formatDateCN, formatDateShort, addDays, getToday } from '@/utils';
import { cn } from '@/utils';
import { useFollowUpStore } from '@/store/useFollowUpStore';
import { useAppointmentStore } from '@/store/useAppointmentStore';
import { useAuthStore } from '@/store/useAuthStore';
import { AppointmentScheduler } from './AppointmentScheduler';

interface FollowUpDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  followUp: FollowUpWithDetails | null;
}

type TabType = 'detail' | 'timeline' | 'appointment';

export function FollowUpDetailModal({ isOpen, onClose, followUp }: FollowUpDetailModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>('detail');
  const [selectedResult, setSelectedResult] = useState<FollowUpResult | null>(null);
  const [contactMethod, setContactMethod] = useState<ContactMethod>('phone');
  const [feedback, setFeedback] = useState<PatientFeedback>({});
  const [notes, setNotes] = useState('');
  const [nextFollowUpDate, setNextFollowUpDate] = useState(addDays(getToday(), 30));
  const [showScheduler, setShowScheduler] = useState(false);
  const [justBooked, setJustBooked] = useState(false);

  const updateFollowUpResult = useFollowUpStore((state) => state.updateFollowUpResult);
  const addAppointment = useAppointmentStore((state) => state.addAppointment);
  const getAppointmentsByPatient = useAppointmentStore((state) => state.getAppointmentsByPatient);
  const getFollowUpById = useFollowUpStore((state) => state.getFollowUpById);
  const { currentUser } = useAuthStore();

  useEffect(() => {
    if (isOpen) {
      setSelectedResult(null);
      setContactMethod('phone');
      setFeedback({});
      setNotes('');
      setNextFollowUpDate(addDays(getToday(), 30));
      setShowScheduler(false);
      setJustBooked(false);
    }
  }, [isOpen]);

  if (!followUp) return null;

  const latestFollowUp = getFollowUpById(followUp.id) || followUp;
  const { patient, cleaningRecord, doctor } = followUp;
  const contactLogs = latestFollowUp.contactLogs || [];
  const appointments = getAppointmentsByPatient(patient.id).filter(
    (a) => a.status !== 'cancelled'
  );
  const relatedAppointments = appointments.filter(
    (a) => a.followUpId === followUp.id
  );

  const handleResultSelect = (result: FollowUpResult) => {
    setSelectedResult(result);
    setJustBooked(false);
    if (result !== 'booked') {
      setShowScheduler(false);
    }
  };

  const feedbackFilled = selectedResult === 'booked'
    ? (feedback.bleedingImproved !== undefined && feedback.flossUsing !== undefined && !!notes.trim())
    : true;

  const handleSave = () => {
    if (!selectedResult || !currentUser) return;

    updateFollowUpResult(
      followUp.id,
      selectedResult,
      contactMethod,
      currentUser.id,
      currentUser.name,
      feedback,
      notes,
      selectedResult === 'connected' ? nextFollowUpDate : undefined,
      undefined
    );
    onClose();
  };

  const handleAppointmentBooked = (
    date: string,
    timeSlot: string,
    finalFeedback?: PatientFeedback,
    finalNotes?: string,
    finalContactMethod?: ContactMethod
  ) => {
    const mergedFeedback = finalFeedback && Object.keys(finalFeedback).length > 0 ? finalFeedback : feedback;
    const mergedNotes = finalNotes || notes;
    const mergedContactMethod = finalContactMethod || contactMethod;

    const newApt = addAppointment({
      patientId: patient.id,
      followUpId: followUp.id,
      doctorId: doctor.id,
      date,
      timeSlot,
      type: '洁治后复查',
      notes: mergedNotes || '随访预约',
    });

    if (currentUser) {
      updateFollowUpResult(
        followUp.id,
        'booked',
        mergedContactMethod,
        currentUser.id,
        currentUser.name,
        mergedFeedback,
        mergedNotes,
        undefined,
        newApt.id
      );
    }

    setShowScheduler(false);
    setJustBooked(true);
    setActiveTab('appointment');
  };

  const getResultBtnClass = (result: FollowUpResult) => {
    const isSelected = selectedResult === result;
    const baseClass =
      'flex-1 py-3 px-4 rounded-xl border-2 text-sm font-medium transition-all duration-200 flex flex-col items-center gap-1';

    if (result === 'connected') {
      return cn(
        baseClass,
        isSelected
          ? 'border-green-500 bg-green-50 text-green-700'
          : 'border-slate-200 hover:border-green-300 hover:bg-green-50 text-slate-600'
      );
    }
    if (result === 'noAnswer') {
      return cn(
        baseClass,
        isSelected
          ? 'border-slate-400 bg-slate-50 text-slate-700'
          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-600'
      );
    }
    if (result === 'refused') {
      return cn(
        baseClass,
        isSelected
          ? 'border-danger-500 bg-danger-50 text-danger-700'
          : 'border-slate-200 hover:border-danger-300 hover:bg-danger-50 text-slate-600'
      );
    }
    if (result === 'booked') {
      return cn(
        baseClass,
        isSelected
          ? 'border-info-500 bg-info-50 text-info-700'
          : 'border-slate-200 hover:border-info-300 hover:bg-info-50 text-slate-600'
      );
    }
    return baseClass;
  };

  const getTagColor = (tagKey: ProblemTag): any => {
    const tag = PROBLEM_TAGS.find((t) => t.key === tagKey);
    const colorMap: Record<string, any> = {
      red: 'red', orange: 'orange', yellow: 'yellow',
      purple: 'purple', blue: 'blue', pink: 'pink', gray: 'gray',
    };
    return colorMap[tag?.color || 'gray'] || 'gray';
  };

  const getResultBadgeVariant = (result: FollowUpResult): string => {
    const map: Record<FollowUpResult, string> = {
      connected: 'success', noAnswer: 'default', refused: 'danger', booked: 'info',
    };
    return map[result];
  };

  const renderFeedbackChips = (fb?: PatientFeedback) => {
    if (!fb) return null;
    const chips: { label: string; color: string }[] = [];
    if (fb.bleedingImproved !== undefined) {
      chips.push({
        label: fb.bleedingImproved ? '刷牙出血已缓解' : '刷牙出血未缓解',
        color: fb.bleedingImproved ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700',
      });
    }
    if (fb.flossUsing !== undefined) {
      chips.push({
        label: fb.flossUsing ? '按时使用牙线' : '未使用牙线',
        color: fb.flossUsing ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700',
      });
    }
    if (fb.otherComments) {
      chips.push({
        label: fb.otherComments,
        color: 'bg-slate-100 text-slate-700',
      });
    }
    if (chips.length === 0) return null;
    return (
      <div className="flex flex-wrap gap-1.5 mt-2">
        {chips.map((c, i) => (
          <span key={i} className={cn('px-2 py-0.5 rounded text-xs font-medium', c.color)}>
            {c.label}
          </span>
        ))}
      </div>
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" title="随访详情">
      {showScheduler ? (
        <AppointmentScheduler
          patient={patient}
          doctor={doctor}
          onConfirm={handleAppointmentBooked}
          onCancel={() => setShowScheduler(false)}
          preFeedback={feedback}
          preNotes={notes}
          preContactMethod={contactMethod}
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
                <span className="text-slate-700">计划回访: {formatDateShort(latestFollowUp.plannedDate)}</span>
              </div>
            </div>

            {contactLogs.length > 0 && (
              <div className="mt-6 pt-4 border-t border-slate-200">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-slate-700">跟进次数</h4>
                  <Badge variant="warning">{contactLogs.length} 次</Badge>
                </div>
              </div>
            )}

            {justBooked && (
              <div className="mt-4 p-3 bg-green-50 border border-green-100 rounded-xl animate-slide-up">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-green-600" />
                  <span className="text-sm font-medium text-green-800">预约成功</span>
                </div>
                <p className="text-xs text-green-700 mt-1">预约记录和反馈已保存</p>
              </div>
            )}
          </div>

          <div className="flex-1 flex flex-col min-w-0">
            <div className="flex border-b border-slate-100 px-5">
              {[
                { key: 'detail', label: '本次洁治详情' },
                { key: 'timeline', label: `联系时间线 (${contactLogs.length})` },
                { key: 'appointment', label: `预约记录 (${relatedAppointments.length})` },
              ].map((tab) => (
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
                      {cleaningRecord.problemTags.map((tag) => (
                        <Tag key={tag} color={getTagColor(tag)}>
                          {PROBLEM_TAGS.find((t) => t.key === tag)?.label}
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
                      {cleaningRecord.items.map((item) => (
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
                        &quot;{cleaningRecord.suggestions}&quot;
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'timeline' && (
                <div className="animate-fade-in">
                  {contactLogs.length === 0 ? (
                    <div className="text-center py-12 text-slate-400">
                      <History size={36} className="mx-auto mb-3 opacity-50" />
                      <p className="text-sm">暂无联系记录</p>
                      <p className="text-xs mt-1">联系后将自动记录在这里</p>
                    </div>
                  ) : (
                    <div className="relative">
                      <div className="absolute left-4 top-2 bottom-2 w-px bg-slate-200" />
                      <div className="space-y-5">
                        {contactLogs
                          .slice()
                          .reverse()
                          .map((log, idx) => (
                            <TimelineItem
                              key={log.id}
                              log={log}
                              index={contactLogs.length - idx}
                              renderFeedbackChips={renderFeedbackChips}
                              getResultBadgeVariant={getResultBadgeVariant}
                            />
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'appointment' && (
                <div className="animate-fade-in">
                  {relatedAppointments.length === 0 ? (
                    <div className="text-center py-12 text-slate-400">
                      <CalendarCheck size={36} className="mx-auto mb-3 opacity-50" />
                      <p className="text-sm">暂无预约记录</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {relatedAppointments.map((apt) => (
                        <div
                          key={apt.id}
                          className={cn(
                            'p-4 rounded-xl border',
                            apt.status === 'confirmed'
                              ? 'bg-info-50 border-info-100'
                              : apt.status === 'completed'
                                ? 'bg-green-50 border-green-100'
                                : 'bg-slate-50 border-slate-200'
                          )}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <Badge variant={
                              apt.status === 'confirmed' ? 'info' :
                              apt.status === 'completed' ? 'success' : 'danger'
                            }>
                              {apt.status === 'confirmed' ? '已预约复查' :
                               apt.status === 'completed' ? '已完成复查' : '已取消'}
                            </Badge>
                            <span className="text-xs text-slate-500">
                              创建于 {formatDateShort(apt.createdAt)}
                            </span>
                          </div>
                          <p className="text-sm font-medium text-slate-800">
                            {formatDateCN(apt.date)} {apt.timeSlot}
                          </p>
                          <p className="text-xs text-slate-500 mt-1">
                            {apt.type} · {doctor.name}
                          </p>
                          {apt.notes && (
                            <p className="text-xs text-slate-500 mt-2 pt-2 border-t border-slate-100">
                              备注：{apt.notes}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {latestFollowUp.patientFeedback && (
                    <div className="mt-5 p-4 bg-green-50 border border-green-100 rounded-xl">
                      <h4 className="text-sm font-semibold text-green-800 mb-2 flex items-center gap-1.5">
                        <CheckCircle2 size={14} />
                        最近一次患者反馈
                      </h4>
                      {renderFeedbackChips(latestFollowUp.patientFeedback)}
                      {latestFollowUp.notes && (
                        <p className="text-sm text-green-700 mt-2 pt-2 border-t border-green-100">
                          备注：{latestFollowUp.notes}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="border-t border-slate-100 p-5 bg-slate-50/50">
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-slate-800 mb-2">联系方式</h4>
                <div className="flex gap-2">
                  {CONTACT_METHODS.map((method) => (
                    <button
                      key={method.key}
                      onClick={() => setContactMethod(method.key)}
                      className={cn(
                        'flex items-center gap-2 px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all',
                        contactMethod === method.key
                          ? 'border-primary-500 bg-primary-50 text-primary-700'
                          : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                      )}
                    >
                      {method.key === 'phone' ? <Phone size={16} /> : <MessageCircle size={16} />}
                      {method.label}
                    </button>
                  ))}
                </div>
              </div>

              <h4 className="text-sm font-semibold text-slate-800 mb-3">联系结果</h4>

              <div className="grid grid-cols-4 gap-2 mb-4">
                {FOLLOW_UP_RESULTS.map((result) => (
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

              {(selectedResult === 'connected' || selectedResult === 'booked') && (
                <div className="space-y-4 animate-slide-down">
                  <h5 className="text-sm font-medium text-slate-700">患者反馈 {selectedResult === 'booked' && (
                    <span className="text-danger-500 font-normal text-xs ml-1">* 均为必填项</span>
                  )}</h5>

                  <div>
                    <p className="text-xs text-slate-500 mb-2">刷牙出血情况</p>
                    <div className="grid grid-cols-2 gap-2">
                      <label
                        onClick={() => setFeedback({ ...feedback, bleedingImproved: true })}
                        className={cn(
                          'flex items-center justify-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition-all text-sm font-medium',
                          feedback.bleedingImproved === true
                            ? 'border-green-500 bg-green-50 text-green-700'
                            : 'border-slate-200 bg-white text-slate-600 hover:border-green-300'
                        )}
                      >
                        <CheckCircle2 size={16} />
                        已缓解
                      </label>
                      <label
                        onClick={() => setFeedback({ ...feedback, bleedingImproved: false })}
                        className={cn(
                          'flex items-center justify-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition-all text-sm font-medium',
                          feedback.bleedingImproved === false
                            ? 'border-danger-500 bg-danger-50 text-danger-700'
                            : 'border-slate-200 bg-white text-slate-600 hover:border-danger-300'
                        )}
                      >
                        <XCircle size={16} />
                        未缓解
                      </label>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-slate-500 mb-2">牙线使用情况</p>
                    <div className="grid grid-cols-2 gap-2">
                      <label
                        onClick={() => setFeedback({ ...feedback, flossUsing: true })}
                        className={cn(
                          'flex items-center justify-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition-all text-sm font-medium',
                          feedback.flossUsing === true
                            ? 'border-green-500 bg-green-50 text-green-700'
                            : 'border-slate-200 bg-white text-slate-600 hover:border-green-300'
                        )}
                      >
                        <CheckCircle2 size={16} />
                        使用牙线
                      </label>
                      <label
                        onClick={() => setFeedback({ ...feedback, flossUsing: false })}
                        className={cn(
                          'flex items-center justify-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition-all text-sm font-medium',
                          feedback.flossUsing === false
                            ? 'border-warning-500 bg-warning-50 text-warning-700'
                            : 'border-slate-200 bg-white text-slate-600 hover:border-warning-300'
                        )}
                      >
                        <XCircle size={16} />
                        未使用
                      </label>
                    </div>
                  </div>

                  <TextArea
                    label="其他反馈"
                    placeholder="请输入患者的其他反馈或备注..."
                    value={feedback.otherComments || ''}
                    onChange={(e) =>
                      setFeedback({ ...feedback, otherComments: e.target.value })
                    }
                    rows={2}
                  />

                  {selectedResult === 'booked' && (
                    <TextArea
                      label="联系备注"
                      placeholder="请输入本次联系的备注..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={2}
                    />
                  )}
                </div>
              )}

              {selectedResult === 'connected' && (
                <div className="mt-4 animate-slide-down">
                  <Input
                    label="下次回访日期"
                    type="date"
                    value={nextFollowUpDate}
                    onChange={(e) => setNextFollowUpDate(e.target.value)}
                  />
                </div>
              )}

              {(selectedResult === 'refused' || selectedResult === 'noAnswer') && (
                <div className="space-y-4 animate-slide-down mt-4">
                  <TextArea
                    label="备注说明"
                    placeholder={
                      selectedResult === 'refused'
                        ? '请记录患者拒绝的原因...'
                        : '请记录未接通的情况...'
                    }
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={2}
                  />
                  {selectedResult === 'noAnswer' && (
                    <p className="text-xs text-info-600 bg-info-50 px-3 py-2 rounded-lg">
                      未接通将自动进入明日待办，同时记录本次联系。
                    </p>
                  )}
                </div>
              )}

              {selectedResult === 'booked' && !showScheduler && (
                <div className="mt-4 animate-slide-down">
                  <Button
                    variant="primary"
                    fullWidth
                    onClick={() => setShowScheduler(true)}
                    disabled={!feedbackFilled}
                    className="gap-2"
                  >
                    <Calendar size={16} />
                    填写完反馈，选择复查时段
                    <ArrowRight size={16} />
                  </Button>
                  {!feedbackFilled && (
                    <div className="text-xs text-danger-500 mt-2 text-center space-y-0.5">
                      <p>请完成：</p>
                      <p>
                        {feedback.bleedingImproved === undefined && '刷牙出血情况 · '}
                        {feedback.flossUsing === undefined && '牙线使用情况 · '}
                        {!notes.trim() && '填写联系备注'}
                      </p>
                    </div>
                  )}
                </div>
              )}

              <div className="flex justify-end gap-3 mt-5">
                <Button variant="secondary" onClick={onClose}>
                  关闭
                </Button>
                {selectedResult && selectedResult !== 'booked' && (
                  <Button variant="primary" onClick={handleSave}>
                    <Check size={16} />
                    保存结果
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}

interface TimelineItemProps {
  log: ContactLog;
  index: number;
  renderFeedbackChips: (fb?: PatientFeedback) => React.ReactNode;
  getResultBadgeVariant: (r: FollowUpResult) => string;
}

function TimelineItem({ log, index, renderFeedbackChips, getResultBadgeVariant }: TimelineItemProps) {
  const resultInfo = FOLLOW_UP_RESULTS.find((r) => r.key === log.result);
  return (
    <div className="relative pl-10 animate-slide-up">
      <div className="absolute left-1.5 top-1 w-7 h-7 rounded-full bg-white border-2 border-slate-200 flex items-center justify-center text-xs font-bold text-slate-500 shadow-sm">
        {index}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Badge variant={getResultBadgeVariant(log.result) as any}>
              {log.contactMethod === 'phone' ? '📞 电话' : '💬 微信'} · {resultInfo?.label}
            </Badge>
            <span className="text-xs text-slate-500">{log.contactTime}</span>
          </div>
          <span className="text-xs text-slate-500">{log.operatorName}</span>
        </div>

        {renderFeedbackChips(log.patientFeedback)}

        {log.appointmentId && (
          <div className="mt-2 flex items-center gap-1.5 text-xs text-info-600 bg-info-50 px-2 py-1 rounded inline-block">
            <CalendarCheck size={12} />
            已生成复查预约
          </div>
        )}

        {log.notes && (
          <p className="text-sm text-slate-600 mt-2 pt-2 border-t border-slate-100 leading-relaxed">
            {log.notes}
          </p>
        )}
      </div>
    </div>
  );
}
