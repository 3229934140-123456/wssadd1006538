import { useMemo } from 'react';
import {
  TrendingUp,
  Users,
  CheckCircle,
  CalendarDays,
  BarChart3,
  PieChart,
  ArrowUp,
  ArrowDown,
  Award,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { useFollowUpStore } from '@/store/useFollowUpStore';
import { usePatientStore } from '@/store/usePatientStore';
import { useAppointmentStore } from '@/store/useAppointmentStore';
import { useAuthStore } from '@/store/useAuthStore';
import { cn, getToday, addDays, formatDateShort } from '@/utils';

export default function Statistics() {
  const followUps = useFollowUpStore(state => state.followUps);
  const patients = usePatientStore(state => state.patients);
  const appointments = useAppointmentStore(state => state.appointments);
  const users = useAuthStore(state => state.users);

  const stats = useMemo(() => {
    const today = getToday();
    const thisMonthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const thisMonthStr = thisMonthStart.toISOString().split('T')[0];

    const thisMonthFollowUps = followUps.filter(f => f.createdAt >= thisMonthStr);
    const completedCount = thisMonthFollowUps.filter(f => f.status === 'completed').length;
    const totalCount = thisMonthFollowUps.length;
    const completionRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    const bookedCount = followUps.filter(f => f.result === 'booked').length;
    const conversionRate = totalCount > 0 ? Math.round((bookedCount / totalCount) * 100) : 0;

    const pendingToday = followUps.filter(f =>
      f.status === 'pending' && f.plannedDate === today
    ).length;

    const overdueCount = followUps.filter(f => {
      if (f.status !== 'pending') return false;
      return f.plannedDate < today;
    }).length;

    return {
      totalPatients: patients.length,
      thisMonthFollowUps: totalCount,
      completionRate,
      conversionRate,
      pendingToday,
      overdueCount,
      totalAppointments: appointments.length,
    };
  }, [followUps, patients, appointments]);

  const doctorStats = useMemo(() => {
    const doctors = users.filter(u => u.role === 'doctor');

    return doctors.map(doctor => {
      const doctorFollowUps = followUps.filter(f => f.assignedDoctorId === doctor.id);
      const completed = doctorFollowUps.filter(f => f.status === 'completed').length;
      const total = doctorFollowUps.length;
      const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
      const booked = doctorFollowUps.filter(f => f.result === 'booked').length;
      const conversionRate = total > 0 ? Math.round((booked / total) * 100) : 0;

      return {
        doctor,
        total,
        completed,
        rate,
        booked,
        conversionRate,
      };
    }).sort((a, b) => b.completed - a.completed);
  }, [followUps, users]);

  const weeklyData = useMemo(() => {
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const date = addDays(getToday(), -i);
      const dayFollowUps = followUps.filter(f => f.updatedAt === date);
      const completed = dayFollowUps.filter(f => f.status === 'completed').length;
      const total = followUps.filter(f => f.createdAt <= date).length;
      data.push({
        date,
        label: formatDateShort(date),
        completed,
        total: dayFollowUps.length,
      });
    }
    return data;
  }, [followUps]);

  const maxValue = Math.max(...weeklyData.map(d => d.total), 1);

  const statCards = [
    {
      title: '本月随访总数',
      value: stats.thisMonthFollowUps,
      icon: <Users size={24} />,
      color: 'primary',
      trend: '+12%',
      trendUp: true,
      bgColor: 'bg-primary-50',
      iconColor: 'text-primary-500',
    },
    {
      title: '随访完成率',
      value: `${stats.completionRate}%`,
      icon: <CheckCircle size={24} />,
      color: 'success',
      trend: '+5%',
      trendUp: true,
      bgColor: 'bg-green-50',
      iconColor: 'text-green-500',
    },
    {
      title: '复诊转化率',
      value: `${stats.conversionRate}%`,
      icon: <TrendingUp size={24} />,
      color: 'info',
      trend: '+3%',
      trendUp: true,
      bgColor: 'bg-info-50',
      iconColor: 'text-info-500',
    },
    {
      title: '待联系患者',
      value: stats.pendingToday + stats.overdueCount,
      icon: <CalendarDays size={24} />,
      color: 'warning',
      trend: '-2%',
      trendUp: false,
      bgColor: 'bg-warning-50',
      iconColor: 'text-warning-500',
    },
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">数据统计</h1>
        <p className="text-sm text-slate-500 mt-1">
          实时了解诊所随访工作进展和效果
        </p>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        {statCards.map((card, index) => (
          <Card key={card.title} className="p-5 animate-slide-up" style={{ animationDelay: `${index * 50}ms` }}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-500">{card.title}</p>
                <p className="text-3xl font-bold text-slate-900 mt-2">{card.value}</p>
                <div className={cn(
                  'flex items-center gap-1 mt-2 text-xs font-medium',
                  card.trendUp ? 'text-green-600' : 'text-danger-600'
                )}>
                  {card.trendUp ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
                  <span>较上月</span>
                </div>
              </div>
              <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center', card.bgColor, card.iconColor)}>
                {card.icon}
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-6">
        <Card className="col-span-2">
          <Card.Header>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-slate-800">本周随访趋势</h3>
                <p className="text-sm text-slate-500 mt-0.5">近7天随访完成情况</p>
              </div>
              <BarChart3 size={20} className="text-slate-400" />
            </div>
          </Card.Header>
          <Card.Body>
            <div className="flex items-end justify-between gap-2 h-48">
              {weeklyData.map((day, index) => (
                <div key={day.date} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full flex flex-col items-center justify-end h-40 gap-1">
                    {day.total > 0 && (
                      <>
                        <div
                          className="w-full bg-primary-200 rounded-t-md transition-all duration-500"
                          style={{ height: `${(day.total / maxValue) * 100}%` }}
                        />
                        <div
                          className="w-full bg-primary-500 rounded-t-md transition-all duration-500"
                          style={{ height: `${(day.completed / maxValue) * 100}%` }}
                        />
                      </>
                    )}
                  </div>
                  <span className="text-xs text-slate-500">{day.label}</span>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm bg-primary-500" />
                <span className="text-xs text-slate-600">已完成</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm bg-primary-200" />
                <span className="text-xs text-slate-600">新增随访</span>
              </div>
            </div>
          </Card.Body>
        </Card>

        <Card>
          <Card.Header>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-slate-800">结果分布</h3>
                <p className="text-sm text-slate-500 mt-0.5">本月随访结果占比</p>
              </div>
              <PieChart size={20} className="text-slate-400" />
            </div>
          </Card.Header>
          <Card.Body>
            <div className="flex items-center justify-center">
              <div className="relative w-40 h-40">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="#e2e8f0"
                    strokeWidth="12"
                  />
                  {(() => {
                    const results = [
                      { key: 'connected', color: '#22c55e', count: followUps.filter(f => f.result === 'connected').length },
                      { key: 'booked', color: '#38bdf8', count: followUps.filter(f => f.result === 'booked').length },
                      { key: 'noAnswer', color: '#94a3b8', count: followUps.filter(f => f.result === 'noAnswer').length },
                      { key: 'refused', color: '#ef4444', count: followUps.filter(f => f.result === 'refused').length },
                    ];
                    const total = results.reduce((sum, r) => sum + r.count, 0) || 1;
                    let offset = 0;
                    return results.map(r => {
                      const percentage = r.count / total;
                      const circumference = 2 * Math.PI * 40;
                      const dashArray = `${percentage * circumference} ${circumference}`;
                      const element = (
                        <circle
                          key={r.key}
                          cx="50"
                          cy="50"
                          r="40"
                          fill="none"
                          stroke={r.color}
                          strokeWidth="12"
                          strokeDasharray={dashArray}
                          strokeDashoffset={-offset * circumference}
                        />
                      );
                      offset += percentage;
                      return element;
                    });
                  })()}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold text-slate-900">{stats.thisMonthFollowUps}</span>
                  <span className="text-xs text-slate-500">总记录</span>
                </div>
              </div>
            </div>

            <div className="space-y-2 mt-4 pt-4 border-t border-slate-100">
              {[
                { label: '已接通', value: followUps.filter(f => f.result === 'connected').length, color: 'bg-green-500' },
                { label: '已预约', value: followUps.filter(f => f.result === 'booked').length, color: 'bg-info-500' },
                { label: '未接通', value: followUps.filter(f => f.result === 'noAnswer').length, color: 'bg-slate-400' },
                { label: '拒绝', value: followUps.filter(f => f.result === 'refused').length, color: 'bg-danger-500' },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className={cn('w-2 h-2 rounded-full', item.color)} />
                    <span className="text-slate-600">{item.label}</span>
                  </div>
                  <span className="font-medium text-slate-800">{item.value}</span>
                </div>
              ))}
            </div>
          </Card.Body>
        </Card>
      </div>

      <Card className="mt-6">
        <Card.Header>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-slate-800">医生排行榜</h3>
              <p className="text-sm text-slate-500 mt-0.5">按完成随访数量排序</p>
            </div>
            <Award size={20} className="text-warning-500" />
          </div>
        </Card.Header>
        <Card.Body>
          <div className="space-y-4">
            {doctorStats.map((stat, index) => (
              <div key={stat.doctor.id} className="flex items-center gap-4">
                <div className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold',
                  index === 0 ? 'bg-yellow-100 text-yellow-700' :
                  index === 1 ? 'bg-slate-100 text-slate-600' :
                  index === 2 ? 'bg-orange-100 text-orange-700' :
                  'bg-slate-50 text-slate-500'
                )}>
                  {index + 1}
                </div>

                <div className="flex items-center gap-3 w-40">
                  <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-medium">
                    {stat.doctor.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium text-slate-800">{stat.doctor.name}</p>
                    <p className="text-xs text-slate-500">共 {stat.total} 位患者</p>
                  </div>
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-slate-600">完成率</span>
                    <span className="font-medium text-slate-800">{stat.rate}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary-500 rounded-full transition-all duration-500"
                      style={{ width: `${stat.rate}%` }}
                    />
                  </div>
                </div>

                <div className="w-24 text-right">
                  <p className="font-bold text-info-600">{stat.booked}</p>
                  <p className="text-xs text-slate-500">复诊预约</p>
                </div>

                <div className="w-24 text-right">
                  <p className="font-bold text-green-600">{stat.conversionRate}%</p>
                  <p className="text-xs text-slate-500">转化率</p>
                </div>
              </div>
            ))}
          </div>
        </Card.Body>
      </Card>
    </div>
  );
}
