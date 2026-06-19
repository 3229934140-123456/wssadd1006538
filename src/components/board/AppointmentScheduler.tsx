import { useState } from 'react';
import { Calendar as CalendarIcon, Clock, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import type { Patient, User } from '@/types';
import { Button } from '../ui/Button';
import { Avatar } from '../ui/Avatar';
import { cn, formatDateCN, getToday, addDays } from '@/utils';
import { useAppointmentStore } from '@/store/useAppointmentStore';

interface AppointmentSchedulerProps {
  patient: Patient;
  doctor: User;
  onConfirm: (date: string, timeSlot: string) => void;
  onCancel: () => void;
}

export function AppointmentScheduler({ patient, doctor, onConfirm, onCancel }: AppointmentSchedulerProps) {
  const [selectedDate, setSelectedDate] = useState<string>(addDays(getToday(), 1));
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [currentWeekStart, setCurrentWeekStart] = useState<string>(getToday());

  const getAvailableSlots = useAppointmentStore(state => state.getAvailableSlots);

  const weekDates = [];
  for (let i = 0; i < 7; i++) {
    weekDates.push(addDays(currentWeekStart, i));
  }

  const availableSlots = getAvailableSlots(selectedDate, doctor.id);

  const weekDays = ['日', '一', '二', '三', '四', '五', '六'];

  const handlePrevWeek = () => {
    setCurrentWeekStart(addDays(currentWeekStart, -7));
  };

  const handleNextWeek = () => {
    setCurrentWeekStart(addDays(currentWeekStart, 7));
  };

  const isToday = (date: string) => date === getToday();
  const isPast = (date: string) => date < getToday();

  const handleConfirm = () => {
    if (selectedDate && selectedSlot) {
      onConfirm(selectedDate, selectedSlot);
    }
  };

  return (
    <div className="p-6 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">预约复查</h3>
          <p className="text-sm text-slate-500 mt-1">
            为 {patient.name} 预约 {doctor.name} 的复查时间
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Avatar name={patient.name} size="md" />
        </div>
      </div>

      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={handlePrevWeek}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-600"
          >
            <ChevronLeft size={20} />
          </button>
          <div className="text-sm font-medium text-slate-700">
            {formatDateCN(weekDates[0])} - {formatDateCN(weekDates[6])}
          </div>
          <button
            onClick={handleNextWeek}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-600"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-2">
          {weekDates.map((date, index) => {
            const past = isPast(date);
            const today = isToday(date);
            const selected = selectedDate === date;

            return (
              <button
                key={date}
                onClick={() => !past && setSelectedDate(date)}
                disabled={past}
                className={cn(
                  'flex flex-col items-center py-3 rounded-xl transition-all duration-200',
                  past && 'opacity-40 cursor-not-allowed',
                  !past && 'hover:bg-primary-50 cursor-pointer',
                  selected && 'bg-primary-500 text-white hover:bg-primary-600',
                  !selected && !past && 'text-slate-700'
                )}
              >
                <span className="text-xs mb-1 opacity-70">{weekDays[new Date(date).getDay()]}</span>
                <span className="text-lg font-semibold">{new Date(date).getDate()}</span>
                {today && (
                  <span className={cn(
                    'text-xs mt-1 px-1.5 py-0.5 rounded-full',
                    selected ? 'bg-white/20' : 'bg-primary-100 text-primary-600'
                  )}>
                    今天
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mb-6">
        <h4 className="text-sm font-medium text-slate-700 mb-3 flex items-center gap-2">
          <Clock size={16} className="text-primary-500" />
          可选时段
        </h4>
        <div className="grid grid-cols-4 gap-2">
          {availableSlots.length > 0 ? (
            availableSlots.map(slot => (
              <button
                key={slot}
                onClick={() => setSelectedSlot(slot)}
                className={cn(
                  'py-2.5 px-3 rounded-lg text-sm font-medium transition-all duration-200 border-2',
                  selectedSlot === slot
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-primary-300 hover:bg-primary-50'
                )}
              >
                {slot}
              </button>
            ))
          ) : (
            <div className="col-span-4 py-8 text-center text-slate-400 text-sm">
              当日暂无可用时段
            </div>
          )}
        </div>
      </div>

      {selectedSlot && (
        <div className="mb-6 p-4 bg-primary-50 rounded-xl animate-slide-up">
          <h4 className="text-sm font-medium text-primary-800 mb-2">预约信息确认</h4>
          <div className="space-y-1 text-sm text-primary-700">
            <p>患者：{patient.name}</p>
            <p>医生：{doctor.name}</p>
            <p>日期：{formatDateCN(selectedDate)}</p>
            <p>时间：{selectedSlot}</p>
            <p>类型：洁治后复查</p>
          </div>
        </div>
      )}

      <div className="flex justify-end gap-3">
        <Button variant="secondary" onClick={onCancel}>
          返回
        </Button>
        <Button
          variant="primary"
          onClick={handleConfirm}
          disabled={!selectedSlot}
        >
          <Check size={16} />
          确认预约
        </Button>
      </div>
    </div>
  );
}
