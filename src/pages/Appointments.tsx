import { useState, useMemo } from 'react';
import { Calendar, Clock, User, ChevronLeft, ChevronRight, Users, Stethoscope } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { AppointmentDetailModal } from '@/components/board/AppointmentDetailModal';
import { useAppointmentStore } from '@/store/useAppointmentStore';
import { usePatientStore } from '@/store/usePatientStore';
import { useAuthStore } from '@/store/useAuthStore';
import type { Appointment, User as UserType, Patient } from '@/types';
import { cn, addDays, getToday, formatDateCN, formatDateShort, TIME_SLOTS } from '@/utils';

type ViewMode = 'byDoctor' | 'allDoctors';

export default function Appointments() {
  const appointments = useAppointmentStore(state => state.appointments);
  const getPatientById = usePatientStore(state => state.getPatientById);
  const users = useAuthStore(state => state.users);

  const [currentWeekStart, setCurrentWeekStart] = useState(getToday());
  const [selectedDoctor, setSelectedDoctor] = useState<string>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('byDoctor');
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const doctors = users.filter(u => u.role === 'doctor');

  const weekDates = [];
  for (let i = 0; i < 7; i++) {
    weekDates.push(addDays(currentWeekStart, i));
  }

  const weekDays = ['日', '一', '二', '三', '四', '五', '六'];

  const nonCancelledAppointments = useMemo(() =>
    appointments.filter(a => a.status !== 'cancelled'),
    [appointments]
  );

  const getAppointmentsForCell = (date: string, doctorId: string, timeSlot?: string) => {
    return nonCancelledAppointments.filter(a =>
      a.date === date &&
      a.doctorId === doctorId &&
      (timeSlot ? a.timeSlot === timeSlot : true)
    );
  };

  const handlePrevWeek = () => setCurrentWeekStart(addDays(currentWeekStart, -7));
  const handleNextWeek = () => setCurrentWeekStart(addDays(currentWeekStart, 7));
  const isToday = (date: string) => date === getToday();

  const handleAppointmentClick = (apt: Appointment) => {
    setSelectedAppointment(apt);
    setIsDetailOpen(true);
  };

  const displayDoctors = useMemo(() => {
    if (viewMode === 'byDoctor' && selectedDoctor !== 'all') {
      return doctors.filter(d => d.id === selectedDoctor);
    }
    return doctors;
  }, [viewMode, selectedDoctor, doctors]);

  const weekStats = useMemo(() => {
    const stats: Record<string, { total: number; byDoctor: Record<string, number> }> = {};
    for (const date of weekDates) {
      const dayAppts = nonCancelledAppointments.filter(a => a.date === date);
      const byDoctor: Record<string, number> = {};
      for (const d of doctors) {
        byDoctor[d.id] = dayAppts.filter(a => a.doctorId === d.id).length;
      }
      stats[date] = { total: dayAppts.length, byDoctor };
    }
    return stats;
  }, [weekDates, nonCancelledAppointments, doctors]);

  const statusConfig: Record<string, { label: string; variant: string }> = {
    pending: { label: '待确认', variant: 'warning' },
    confirmed: { label: '已确认', variant: 'success' },
    cancelled: { label: '已取消', variant: 'danger' },
    completed: { label: '已完成', variant: 'default' },
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">预约管理</h1>
          <p className="text-sm text-slate-500 mt-1">
            {formatDateCN(currentWeekStart)} 起一周 · 共 {Object.values(weekStats).reduce((s, d) => s + d.total, 0)} 个预约
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-slate-100 rounded-lg p-0.5">
            <button
              onClick={() => setViewMode('byDoctor')}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all',
                viewMode === 'byDoctor'
                  ? 'bg-white text-primary-600 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              )}
            >
              <Stethoscope size={14} />
              按医生
            </button>
            <button
              onClick={() => setViewMode('allDoctors')}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all',
                viewMode === 'allDoctors'
                  ? 'bg-white text-primary-600 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              )}
            >
              <Users size={14} />
              全部医生总览
            </button>
          </div>

          {viewMode === 'byDoctor' && (
            <select
              value={selectedDoctor}
              onChange={(e) => setSelectedDoctor(e.target.value)}
              className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">全部医生</option>
              {doctors.map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      <Card>
        <Card.Header>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={handlePrevWeek} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                <ChevronLeft size={20} className="text-slate-600" />
              </button>
              <h3 className="font-semibold text-slate-800">
                {formatDateShort(weekDates[0])} - {formatDateShort(weekDates[6])}
              </h3>
              <button onClick={handleNextWeek} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                <ChevronRight size={20} className="text-slate-600" />
              </button>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setCurrentWeekStart(getToday())}>
              今天
            </Button>
          </div>
        </Card.Header>
        <Card.Body>
          <div className="overflow-x-auto -mx-4 px-4">
            <div className="min-w-[900px]">
              {viewMode === 'byDoctor' && displayDoctors.length === 1 ? (
                <SingleDoctorSchedule
                  doctor={displayDoctors[0]}
                  weekDates={weekDates}
                  weekDays={weekDays}
                  getAppointmentsForCell={getAppointmentsForCell}
                  getPatientById={getPatientById}
                  onAppointmentClick={handleAppointmentClick}
                  isToday={isToday}
                  statusConfig={statusConfig}
                />
              ) : (
                <AllDoctorsMatrix
                  doctors={displayDoctors}
                  weekDates={weekDates}
                  weekDays={weekDays}
                  getAppointmentsForCell={getAppointmentsForCell}
                  getPatientById={getPatientById}
                  onAppointmentClick={handleAppointmentClick}
                  isToday={isToday}
                  statusConfig={statusConfig}
                />
              )}
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-slate-100">
            <h4 className="text-sm font-semibold text-slate-700 mb-4">本周预约统计</h4>
            <div className="grid grid-cols-7 gap-2">
              {weekDates.map(date => {
                const stat = weekStats[date];
                return (
                  <div key={date} className={cn(
                    'p-3 rounded-xl text-center',
                    isToday(date) ? 'bg-primary-50 border border-primary-100' : 'bg-slate-50'
                  )}>
                    <p className={cn(
                      'text-xs font-medium mb-1',
                      isToday(date) ? 'text-primary-600' : 'text-slate-500'
                    )}>
                      {formatDateShort(date)} {isToday(date) && '(今)'}
                    </p>
                    <p className={cn(
                      'text-2xl font-bold',
                      isToday(date) ? 'text-primary-600' : 'text-slate-800'
                    )}>
                      {stat.total}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1 justify-center">
                      {doctors.map(d => (
                        stat.byDoctor[d.id] > 0 && (
                          <span key={d.id} className="text-[10px] px-1.5 py-0.5 bg-white rounded text-slate-500">
                            {d.name.slice(0, 1)} {stat.byDoctor[d.id]}
                          </span>
                        )
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </Card.Body>
      </Card>

      <AppointmentDetailModal
        isOpen={isDetailOpen}
        onClose={() => { setIsDetailOpen(false); setSelectedAppointment(null); }}
        appointment={selectedAppointment}
      />
    </div>
  );
}

interface ScheduleProps {
  weekDates: string[];
  weekDays: string[];
  getAppointmentsForCell: (date: string, doctorId: string, timeSlot?: string) => Appointment[];
  getPatientById: (id: string) => Patient | undefined;
  onAppointmentClick: (apt: Appointment) => void;
  isToday: (date: string) => boolean;
  statusConfig: Record<string, { label: string; variant: string }>;
}

interface SingleDoctorScheduleProps extends ScheduleProps {
  doctor: UserType;
}

function SingleDoctorSchedule({
  doctor,
  weekDates,
  weekDays,
  getAppointmentsForCell,
  getPatientById,
  onAppointmentClick,
  isToday,
  statusConfig,
}: SingleDoctorScheduleProps) {
  return (
    <div>
      <div className="flex items-center gap-3 mb-4 p-3 bg-slate-50 rounded-xl">
        <Avatar name={doctor.name} size="md" />
        <div>
          <p className="font-semibold text-slate-800">{doctor.name}</p>
          <p className="text-xs text-slate-500">{doctor.title || '执业医师'}</p>
        </div>
      </div>

      <div className="grid grid-cols-[80px_1fr] gap-px bg-slate-200 rounded-xl overflow-hidden border border-slate-200">
        <div className="grid grid-cols-1 gap-px bg-slate-200">
          <div className="bg-slate-50 p-2 text-xs font-medium text-slate-500 text-center flex items-center justify-center">
            时段
          </div>
          {TIME_SLOTS.map(slot => (
            <div key={slot} className="bg-white p-2 text-xs font-medium text-slate-500 text-center flex items-center justify-center">
              {slot}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-px bg-slate-200">
          {weekDates.map(date => (
            <div key={date} className="contents">
              <div className={cn(
                'bg-slate-50 p-2 text-center',
                isToday(date) && 'bg-primary-50'
              )}>
                <p className={cn(
                  'text-xs font-medium',
                  isToday(date) ? 'text-primary-600' : 'text-slate-500'
                )}>
                  {weekDays[new Date(date).getDay()]}
                </p>
                <p className={cn(
                  'text-sm font-bold',
                  isToday(date) ? 'text-primary-600' : 'text-slate-800'
                )}>
                  {new Date(date).getDate()}
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  {getAppointmentsForCell(date, doctor.id).length}个
                </p>
              </div>
            </div>
          ))}

          {TIME_SLOTS.map(slot => (
            weekDates.map(date => {
              const apts = getAppointmentsForCell(date, doctor.id, slot);
              return (
                <div key={`${date}-${slot}`} className="bg-white p-1 min-h-[50px]">
                  {apts.length > 0 ? (
                    apts.map(apt => {
                      const patient = getPatientById(apt.patientId);
                      return (
                        <button
                          key={apt.id}
                          onClick={() => onAppointmentClick(apt)}
                          className={cn(
                            'w-full text-left p-1.5 rounded-lg border transition-all text-xs',
                            apt.status === 'confirmed'
                              ? 'bg-info-50 border-info-200 text-info-700 hover:bg-info-100'
                              : apt.status === 'completed'
                                ? 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100'
                                : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                          )}
                        >
                          <p className="font-medium truncate">{patient?.name}</p>
                          <p className="text-[10px] opacity-75 truncate">{apt.type}</p>
                        </button>
                      );
                    })
                  ) : (
                    <div className="h-full flex items-center justify-center">
                      <span className="text-[10px] text-slate-300">—</span>
                    </div>
                  )}
                </div>
              );
            })
          ))}
        </div>
      </div>
    </div>
  );
}

interface AllDoctorsMatrixProps extends ScheduleProps {
  doctors: UserType[];
}

function AllDoctorsMatrix({
  doctors,
  weekDates,
  weekDays,
  getAppointmentsForCell,
  getPatientById,
  onAppointmentClick,
  isToday,
}: AllDoctorsMatrixProps) {
  return (
    <div>
      <div className="grid gap-px bg-slate-200 rounded-xl overflow-hidden border border-slate-200"
        style={{ gridTemplateColumns: `120px repeat(${weekDates.length}, 1fr)` }}>
        <div className="bg-slate-50 p-3 text-xs font-medium text-slate-500 text-center">
          医生 / 日期
        </div>
        {weekDates.map(date => (
          <div key={date} className={cn(
            'bg-slate-50 p-2 text-center',
            isToday(date) && 'bg-primary-50'
          )}>
            <p className={cn(
              'text-xs font-medium',
              isToday(date) ? 'text-primary-600' : 'text-slate-500'
            )}>
              {weekDays[new Date(date).getDay()]} {new Date(date).getDate()}
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5">
              {doctors.reduce((s, d) => s + getAppointmentsForCell(date, d.id).length, 0)}个
            </p>
          </div>
        ))}

        {doctors.map(doctor => (
          <div key={doctor.id} className="contents">
            <div className="bg-white p-2 flex items-center gap-2 border-r border-slate-100">
              <Avatar name={doctor.name} size="sm" />
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-800 truncate">{doctor.name}</p>
                <p className="text-[10px] text-slate-400 truncate">{doctor.title || '医师'}</p>
              </div>
            </div>

            {weekDates.map(date => {
              const apts = getAppointmentsForCell(date, doctor.id);
              return (
                <div key={`${doctor.id}-${date}`} className={cn(
                  'bg-white p-1.5 min-h-[60px]',
                  isToday(date) && 'bg-primary-50/30'
                )}>
                  {apts.length > 0 ? (
                    <div className="space-y-1">
                      {apts.slice(0, 3).map(apt => {
                        const patient = getPatientById(apt.patientId);
                        return (
                          <button
                            key={apt.id}
                            onClick={() => onAppointmentClick(apt)}
                            className={cn(
                              'w-full text-left px-1.5 py-1 rounded border transition-all text-[11px] flex items-center gap-1',
                              apt.status === 'confirmed'
                                ? 'bg-info-50 border-info-200 text-info-700 hover:bg-info-100'
                                : apt.status === 'completed'
                                  ? 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100'
                                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                            )}
                          >
                            <Clock size={10} />
                            <span className="tabular-nums">{apt.timeSlot}</span>
                            <span className="font-medium truncate ml-1">{patient?.name}</span>
                          </button>
                        );
                      })}
                      {apts.length > 3 && (
                        <p className="text-[10px] text-slate-400 pl-1">+{apts.length - 3} 个</p>
                      )}
                    </div>
                  ) : (
                    <div className="h-full flex items-center justify-center">
                      <span className="text-[10px] text-slate-300">无预约</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
