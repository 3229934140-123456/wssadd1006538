import { useState, useMemo } from 'react';
import { Calendar, Clock, User, ChevronLeft, ChevronRight, Check, X, Phone, Filter } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { AppointmentDetailModal } from '@/components/board/AppointmentDetailModal';
import { useAppointmentStore } from '@/store/useAppointmentStore';
import { usePatientStore } from '@/store/usePatientStore';
import { useAuthStore } from '@/store/useAuthStore';
import type { Appointment } from '@/types';
import { cn, addDays, getToday, formatDateCN, formatDateShort, TIME_SLOTS } from '@/utils';

export default function Appointments() {
  const appointments = useAppointmentStore(state => state.appointments);
  const getPatientById = usePatientStore(state => state.getPatientById);
  const users = useAuthStore(state => state.users);

  const [currentWeekStart, setCurrentWeekStart] = useState(getToday());
  const [selectedDate, setSelectedDate] = useState(getToday());
  const [selectedDoctor, setSelectedDoctor] = useState<string>('all');
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const doctors = users.filter(u => u.role === 'doctor');

  const weekDates = [];
  for (let i = 0; i < 7; i++) {
    weekDates.push(addDays(currentWeekStart, i));
  }

  const weekDays = ['日', '一', '二', '三', '四', '五', '六'];

  const filteredAppointments = useMemo(() => {
    let result = appointments;
    if (selectedDoctor !== 'all') {
      result = result.filter(a => a.doctorId === selectedDoctor);
    }
    return result;
  }, [appointments, selectedDoctor]);

  const weekAppointmentsByDate = useMemo(() => {
    const map: Record<string, Appointment[]> = {};
    for (const date of weekDates) {
      map[date] = filteredAppointments
        .filter(a => a.date === date && a.status !== 'cancelled')
        .sort((a, b) => a.timeSlot.localeCompare(b.timeSlot));
    }
    return map;
  }, [weekDates, filteredAppointments]);

  const dayAppointments = weekAppointmentsByDate[selectedDate] || [];

  const handlePrevWeek = () => setCurrentWeekStart(addDays(currentWeekStart, -7));
  const handleNextWeek = () => setCurrentWeekStart(addDays(currentWeekStart, 7));
  const isToday = (date: string) => date === getToday();

  const handleAppointmentClick = (apt: Appointment) => {
    setSelectedAppointment(apt);
    setIsDetailOpen(true);
  };

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
            {formatDateCN(selectedDate)} · 共 {dayAppointments.length} 个预约
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-slate-400" />
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
          </div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-6">
        <div className="col-span-3">
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
                <Button variant="ghost" size="sm" onClick={() => { setCurrentWeekStart(getToday()); setSelectedDate(getToday()); }}>
                  今天
                </Button>
              </div>
            </Card.Header>
            <Card.Body>
              <div className="grid grid-cols-7 gap-2 mb-6">
                {weekDates.map((date) => {
                  const dayAppts = weekAppointmentsByDate[date] || [];
                  const selected = selectedDate === date;
                  const today = isToday(date);

                  return (
                    <button
                      key={date}
                      onClick={() => setSelectedDate(date)}
                      className={cn(
                        'flex flex-col items-center py-3 rounded-xl transition-all duration-200 relative',
                        selected ? 'bg-primary-500 text-white' : 'hover:bg-slate-50 text-slate-700'
                      )}
                    >
                      <span className={cn('text-xs mb-1', selected ? 'text-primary-100' : 'text-slate-400')}>
                        {weekDays[new Date(date).getDay()]}
                      </span>
                      <span className="text-lg font-semibold">{new Date(date).getDate()}</span>
                      {today && !selected && (
                        <span className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-primary-500" />
                      )}
                      {dayAppts.length > 0 && (
                        <span className={cn(
                          'text-xs mt-1 px-1.5 py-0.5 rounded-full',
                          selected ? 'bg-white/20 text-white' : 'bg-primary-100 text-primary-600'
                        )}>
                          {dayAppts.length}个
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {selectedDoctor !== 'all' && (
                <div className="mb-6">
                  <div className="grid grid-cols-1 gap-px bg-slate-200 rounded-xl overflow-hidden border border-slate-200">
                    <div className="grid grid-cols-[60px_1fr] bg-slate-50">
                      <div className="p-2 text-xs font-medium text-slate-500 text-center border-r border-slate-200">
                        时段
                      </div>
                      <div className="p-2 text-xs font-medium text-slate-500 text-center">
                        {doctors.find(d => d.id === selectedDoctor)?.name}
                      </div>
                    </div>
                    {TIME_SLOTS.map(slot => {
                      const apt = dayAppointments.find(a => a.timeSlot === slot);
                      return (
                        <div key={slot} className="grid grid-cols-[60px_1fr] bg-white">
                          <div className="p-2 text-xs font-medium text-slate-500 text-center border-r border-slate-200 flex items-center justify-center">
                            {slot}
                          </div>
                          <div className="p-1.5 min-h-[40px]">
                            {apt ? (
                              <button
                                onClick={() => handleAppointmentClick(apt)}
                                className="w-full text-left p-1.5 rounded-lg bg-primary-50 border border-primary-100 hover:bg-primary-100 transition-colors"
                              >
                                <p className="text-xs font-medium text-primary-800 truncate">
                                  {getPatientById(apt.patientId)?.name}
                                </p>
                                <p className="text-xs text-primary-600">{apt.type}</p>
                              </button>
                            ) : (
                              <div className="h-full flex items-center justify-center">
                                <span className="text-xs text-slate-300">空闲</span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="space-y-3">
                {dayAppointments.length === 0 ? (
                  <div className="text-center py-12">
                    <Calendar size={40} className="mx-auto text-slate-300 mb-3" />
                    <p className="text-slate-400">当日暂无预约</p>
                  </div>
                ) : (
                  dayAppointments.map((appt, index) => {
                    const patient = getPatientById(appt.patientId);
                    const doctor = users.find(u => u.id === appt.doctorId);

                    return (
                      <div
                        key={appt.id}
                        onClick={() => handleAppointmentClick(appt)}
                        className={cn(
                          'flex items-center gap-4 p-4 rounded-xl border transition-all duration-200 animate-slide-up cursor-pointer',
                          'bg-white border-slate-200 hover:border-primary-300 hover:shadow-md'
                        )}
                        style={{ animationDelay: `${index * 30}ms` }}
                      >
                        <div className="w-16 text-center">
                          <p className="text-lg font-bold text-primary-600">{appt.timeSlot}</p>
                        </div>

                        <div className="w-px h-12 bg-slate-200" />

                        <Avatar name={patient?.name} size="lg" />

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-slate-900">{patient?.name}</h4>
                            <Badge variant={statusConfig[appt.status]?.variant as any}>
                              {statusConfig[appt.status]?.label}
                            </Badge>
                          </div>
                          <p className="text-sm text-slate-500 mt-0.5">
                            {patient?.gender === 'male' ? '男' : '女'} · {patient?.age}岁 · {patient?.phone}
                          </p>
                          <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                            <span className="flex items-center gap-1">
                              <User size={12} />
                              {doctor?.name}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar size={12} />
                              {appt.type}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </Card.Body>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <Card.Header>
              <h3 className="font-semibold text-slate-800">本周概览</h3>
            </Card.Header>
            <Card.Body className="space-y-3">
              {weekDates.map(date => {
                const dayAppts = weekAppointmentsByDate[date] || [];
                if (dayAppts.length === 0) return null;
                return (
                  <div key={date} className={cn(
                    'flex items-center justify-between p-2.5 rounded-lg text-sm',
                    isToday(date) ? 'bg-primary-50' : 'bg-slate-50'
                  )}>
                    <span className={cn(
                      'text-xs font-medium',
                      isToday(date) ? 'text-primary-700' : 'text-slate-600'
                    )}>
                      {formatDateShort(date)} {isToday(date) && '(今)'}
                    </span>
                    <span className={cn(
                      'text-sm font-bold',
                      isToday(date) ? 'text-primary-600' : 'text-slate-700'
                    )}>
                      {dayAppts.length} 个
                    </span>
                  </div>
                );
              })}
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg mt-2">
                <span className="text-sm text-green-700">本周合计</span>
                <span className="text-xl font-bold text-green-600">
                  {Object.values(weekAppointmentsByDate).reduce((s, a) => s + a.length, 0)}
                </span>
              </div>
            </Card.Body>
          </Card>

          <Card>
            <Card.Header>
              <h3 className="font-semibold text-slate-800">即将到来</h3>
            </Card.Header>
            <Card.Body>
              <div className="space-y-3">
                {filteredAppointments
                  .filter(a => a.date >= getToday() && a.status !== 'cancelled')
                  .sort((a, b) => a.date.localeCompare(b.date) || a.timeSlot.localeCompare(b.timeSlot))
                  .slice(0, 5)
                  .map(appt => {
                    const patient = getPatientById(appt.patientId);
                    return (
                      <button
                        key={appt.id}
                        onClick={() => handleAppointmentClick(appt)}
                        className="w-full flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg transition-colors text-left"
                      >
                        <Avatar name={patient?.name} size="sm" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-800 truncate">{patient?.name}</p>
                          <p className="text-xs text-slate-500">
                            {formatDateShort(appt.date)} {appt.timeSlot}
                          </p>
                        </div>
                        <Badge variant={statusConfig[appt.status]?.variant as any} className="text-xs">
                          {statusConfig[appt.status]?.label}
                        </Badge>
                      </button>
                    );
                  })}
              </div>
            </Card.Body>
          </Card>
        </div>
      </div>

      <AppointmentDetailModal
        isOpen={isDetailOpen}
        onClose={() => { setIsDetailOpen(false); setSelectedAppointment(null); }}
        appointment={selectedAppointment}
      />
    </div>
  );
}
