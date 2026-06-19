import { useState } from 'react';
import { Calendar, Clock, User, ChevronLeft, ChevronRight, Check, X, Phone } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { useAppointmentStore } from '@/store/useAppointmentStore';
import { usePatientStore } from '@/store/usePatientStore';
import { useAuthStore } from '@/store/useAuthStore';
import { cn, addDays, getToday, formatDateCN, formatDateShort } from '@/utils';

export default function Appointments() {
  const appointments = useAppointmentStore(state => state.appointments);
  const getPatientById = usePatientStore(state => state.getPatientById);
  const users = useAuthStore(state => state.users);

  const [currentWeekStart, setCurrentWeekStart] = useState(getToday());
  const [selectedDate, setSelectedDate] = useState(getToday());

  const weekDates = [];
  for (let i = 0; i < 7; i++) {
    weekDates.push(addDays(currentWeekStart, i));
  }

  const weekDays = ['日', '一', '二', '三', '四', '五', '六'];

  const dayAppointments = appointments
    .filter(a => a.date === selectedDate && a.status !== 'cancelled')
    .sort((a, b) => a.timeSlot.localeCompare(b.timeSlot));

  const handlePrevWeek = () => {
    setCurrentWeekStart(addDays(currentWeekStart, -7));
  };

  const handleNextWeek = () => {
    setCurrentWeekStart(addDays(currentWeekStart, 7));
  };

  const isToday = (date: string) => date === getToday();

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
        <Button variant="primary">
          <Calendar size={16} />
          新增预约
        </Button>
      </div>

      <div className="grid grid-cols-4 gap-6">
        <div className="col-span-3">
          <Card>
            <Card.Header>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button
                    onClick={handlePrevWeek}
                    className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    <ChevronLeft size={20} className="text-slate-600" />
                  </button>
                  <h3 className="font-semibold text-slate-800">
                    {formatDateShort(weekDates[0])} - {formatDateShort(weekDates[6])}
                  </h3>
                  <button
                    onClick={handleNextWeek}
                    className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    <ChevronRight size={20} className="text-slate-600" />
                  </button>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setCurrentWeekStart(getToday())}>
                  今天
                </Button>
              </div>
            </Card.Header>
            <Card.Body>
              <div className="grid grid-cols-7 gap-2 mb-4">
                {weekDates.map((date, index) => {
                  const dayApptCount = appointments.filter(
                    a => a.date === date && a.status !== 'cancelled'
                  ).length;
                  const selected = selectedDate === date;
                  const today = isToday(date);

                  return (
                    <button
                      key={date}
                      onClick={() => setSelectedDate(date)}
                      className={cn(
                        'flex flex-col items-center py-3 rounded-xl transition-all duration-200 relative',
                        selected
                          ? 'bg-primary-500 text-white'
                          : 'hover:bg-slate-50 text-slate-700'
                      )}
                    >
                      <span className={cn(
                        'text-xs mb-1',
                        selected ? 'text-primary-100' : 'text-slate-400'
                      )}>
                        {weekDays[new Date(date).getDay()]}
                      </span>
                      <span className="text-lg font-semibold">{new Date(date).getDate()}</span>
                      {today && !selected && (
                        <span className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-primary-500" />
                      )}
                      {dayApptCount > 0 && (
                        <span className={cn(
                          'text-xs mt-1 px-1.5 py-0.5 rounded-full',
                          selected ? 'bg-white/20 text-white' : 'bg-primary-100 text-primary-600'
                        )}>
                          {dayApptCount}个
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="space-y-3 mt-6">
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
                        className={cn(
                          'flex items-center gap-4 p-4 rounded-xl border transition-all duration-200 animate-slide-up',
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

                        <div className="flex items-center gap-2">
                          <button className="p-2 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                            <Phone size={18} />
                          </button>
                          <button className="p-2 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                            <Check size={18} />
                          </button>
                          <button className="p-2 text-slate-400 hover:text-danger-600 hover:bg-danger-50 rounded-lg transition-colors">
                            <X size={18} />
                          </button>
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
              <h3 className="font-semibold text-slate-800">今日概览</h3>
            </Card.Header>
            <Card.Body className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-primary-50 rounded-lg">
                <span className="text-sm text-primary-700">今日预约</span>
                <span className="text-xl font-bold text-primary-600">
                  {appointments.filter(a => a.date === getToday() && a.status !== 'cancelled').length}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <span className="text-sm text-green-700">已确认</span>
                <span className="text-xl font-bold text-green-600">
                  {appointments.filter(a => a.date === getToday() && a.status === 'confirmed').length}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-warning-50 rounded-lg">
                <span className="text-sm text-warning-700">待确认</span>
                <span className="text-xl font-bold text-warning-600">
                  {appointments.filter(a => a.date === getToday() && a.status === 'pending').length}
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
                {appointments
                  .filter(a => a.date >= getToday() && a.status !== 'cancelled')
                  .sort((a, b) => a.date.localeCompare(b.date) || a.timeSlot.localeCompare(b.timeSlot))
                  .slice(0, 5)
                  .map(appt => {
                    const patient = getPatientById(appt.patientId);
                    return (
                      <div key={appt.id} className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg transition-colors">
                        <Avatar name={patient?.name} size="sm" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-800 truncate">{patient?.name}</p>
                          <p className="text-xs text-slate-500">
                            {formatDateShort(appt.date)} {appt.timeSlot}
                          </p>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </Card.Body>
          </Card>
        </div>
      </div>
    </div>
  );
}
