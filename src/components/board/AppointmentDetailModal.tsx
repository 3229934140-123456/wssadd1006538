import {
  Phone,
  Calendar,
  FileText,
  User,
  Clock,
  XCircle,
  CheckCircle2,
  History,
} from 'lucide-react';
import type { Appointment, FollowUp, ContactLog, FollowUpResult } from '@/types';
import { FOLLOW_UP_RESULTS, CONTACT_METHODS, PROBLEM_TAGS } from '@/types';
import type { ProblemTag } from '@/types';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Avatar } from '../ui/Avatar';
import { Badge } from '../ui/Badge';
import { Tag } from '../ui/Tag';
import { cn, formatDateCN, formatDateShort, getToday } from '@/utils';
import { useAppointmentStore } from '@/store/useAppointmentStore';
import { useFollowUpStore } from '@/store/useFollowUpStore';
import { usePatientStore } from '@/store/usePatientStore';
import { useAuthStore } from '@/store/useAuthStore';

interface AppointmentDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: Appointment | null;
}

const statusBadgeVariant: Record<string, 'info' | 'success' | 'danger' | 'warning'> = {
  confirmed: 'info',
  completed: 'success',
  cancelled: 'danger',
  pending: 'warning',
};

const statusLabels: Record<string, string> = {
  pending: '待确认',
  confirmed: '已确认',
  completed: '已完成',
  cancelled: '已取消',
};

export function AppointmentDetailModal({ isOpen, onClose, appointment }: AppointmentDetailModalProps) {
  const cancelAppointment = useAppointmentStore((s) => s.cancelAppointment);
  const updateAppointment = useAppointmentStore((s) => s.updateAppointment);
  const getFollowUpById = useFollowUpStore((s) => s.getFollowUpById);
  const updateFollowUp = useFollowUpStore((s) => s.updateFollowUp);
  const getPatientById = usePatientStore((s) => s.getPatientById);
  const getCleaningRecordsByPatient = usePatientStore((s) => s.getCleaningRecordsByPatient);
  const users = useAuthStore((s) => s.users);

  if (!appointment) return null;

  const patient = getPatientById(appointment.patientId);
  const followUp = appointment.followUpId ? getFollowUpById(appointment.followUpId) : undefined;
  const cleaningRecord = followUp
    ? getCleaningRecordsByPatient(appointment.patientId).find(
        (r) => r.id === followUp.cleaningRecordId
      )
    : undefined;
  const contactLogs: ContactLog[] = followUp?.contactLogs || [];
  const doctor = users.find((u) => u.id === appointment.doctorId);

  const handleCancel = () => {
    cancelAppointment(appointment.id);
    if (followUp) {
      updateFollowUp(followUp.id, { status: 'pending', result: undefined });
    }
    onClose();
  };

  const handleComplete = () => {
    updateAppointment(appointment.id, { status: 'completed' });
    if (followUp) {
      updateFollowUp(followUp.id, { status: 'completed', result: 'booked' });
    }
    onClose();
  };

  const getTagColor = (tagKey: ProblemTag) => {
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

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg" title="预约详情">
      <div className="p-6 space-y-6">
        <div className="flex items-start gap-5">
          <Avatar name={patient?.name} size="xl" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-semibold text-slate-900">{patient?.name}</h3>
              <Badge variant={statusBadgeVariant[appointment.status]}>
                {statusLabels[appointment.status]}
              </Badge>
            </div>
            <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm text-slate-600">
              {patient && (
                <>
                  <span className="flex items-center gap-1.5">
                    <Phone size={14} className="text-slate-400" />
                    {patient.phone}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <FileText size={14} className="text-slate-400" />
                    档案号: {patient.archiveNo}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="bg-slate-50 rounded-xl p-4 space-y-3">
          <h4 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
            <Calendar size={16} className="text-primary-500" />
            预约信息
          </h4>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-slate-500">日期</span>
              <p className="font-medium text-slate-800">{formatDateCN(appointment.date)}</p>
            </div>
            <div>
              <span className="text-slate-500">时段</span>
              <p className="font-medium text-slate-800">{appointment.timeSlot}</p>
            </div>
            <div>
              <span className="text-slate-500">类型</span>
              <p className="font-medium text-slate-800">{appointment.type}</p>
            </div>
            <div>
              <span className="text-slate-500">医生</span>
              <p className="font-medium text-slate-800">{doctor?.name || '-'}</p>
            </div>
            <div>
              <span className="text-slate-500">状态</span>
              <p className="font-medium text-slate-800">{statusLabels[appointment.status]}</p>
            </div>
            {appointment.notes && (
              <div className="col-span-2">
                <span className="text-slate-500">备注</span>
                <p className="font-medium text-slate-800">{appointment.notes}</p>
              </div>
            )}
          </div>
        </div>

        {followUp && cleaningRecord && (
          <div className="border border-slate-200 rounded-xl p-4 space-y-4">
            <h4 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
              <FileText size={16} className="text-primary-500" />
              来源随访 - 洁治记录
            </h4>

            {cleaningRecord.problemTags.length > 0 && (
              <div>
                <span className="text-xs text-slate-500">问题标签</span>
                <div className="flex flex-wrap gap-2 mt-1">
                  {cleaningRecord.problemTags.map((tag) => (
                    <Tag key={tag} color={getTagColor(tag)}>
                      {PROBLEM_TAGS.find((t) => t.key === tag)?.label}
                    </Tag>
                  ))}
                </div>
              </div>
            )}

            <div>
              <span className="text-xs text-slate-500">洁治项目</span>
              <div className="flex flex-wrap gap-2 mt-1">
                {cleaningRecord.items.map((item) => (
                  <span key={item} className="px-2.5 py-0.5 bg-slate-100 rounded text-xs text-slate-700">
                    {item}
                  </span>
                ))}
              </div>
            </div>

            {cleaningRecord.doctorNotes && (
              <div>
                <span className="text-xs text-slate-500">医生交代事项</span>
                <p className="text-sm text-slate-700 mt-1 p-3 bg-primary-50 rounded-lg">
                  {cleaningRecord.doctorNotes}
                </p>
              </div>
            )}

            {cleaningRecord.suggestions && (
              <div>
                <span className="text-xs text-slate-500">建议话术</span>
                <p className="text-sm text-slate-700 mt-1 p-3 bg-info-50 rounded-lg border border-info-100">
                  &ldquo;{cleaningRecord.suggestions}&rdquo;
                </p>
              </div>
            )}
          </div>
        )}

        {followUp && contactLogs.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
              <History size={16} className="text-primary-500" />
              联系记录 ({contactLogs.length})
            </h4>
            <div className="relative">
              <div className="absolute left-3.5 top-2 bottom-2 w-px bg-slate-200" />
              <div className="space-y-4">
                {contactLogs
                  .slice()
                  .reverse()
                  .map((log, idx) => {
                    const resultInfo = FOLLOW_UP_RESULTS.find((r) => r.key === log.result);
                    return (
                      <div key={log.id} className="relative pl-9">
                        <div className="absolute left-1 top-1 w-5 h-5 rounded-full bg-white border-2 border-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-500 shadow-sm">
                          {contactLogs.length - idx}
                        </div>
                        <div className="bg-white rounded-lg border border-slate-200 p-3">
                          <div className="flex items-center justify-between flex-wrap gap-2">
                            <div className="flex items-center gap-2">
                              <Badge variant={getResultBadgeVariant(log.result) as any}>
                                {log.contactMethod === 'phone' ? '📞 电话' : '💬 微信'} · {resultInfo?.label}
                              </Badge>
                              <span className="text-xs text-slate-500">{log.contactTime}</span>
                            </div>
                            <span className="text-xs text-slate-500">{log.operatorName}</span>
                          </div>
                          {log.notes && (
                            <p className="text-sm text-slate-600 mt-2 pt-2 border-t border-slate-100 leading-relaxed">
                              {log.notes}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        )}

        {appointment.status === 'confirmed' && (
          <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
            <Button variant="danger" onClick={handleCancel} className="gap-1.5">
              <XCircle size={16} />
              取消预约
            </Button>
            <Button variant="primary" onClick={handleComplete} className="gap-1.5">
              <CheckCircle2 size={16} />
              完成预约
            </Button>
          </div>
        )}
      </div>
    </Modal>
  );
}
