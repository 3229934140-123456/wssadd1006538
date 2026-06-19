import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, UserPlus, Filter, Phone, User } from 'lucide-react';
import { usePatientStore } from '@/store/usePatientStore';
import { useAuthStore } from '@/store/useAuthStore';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Tag } from '@/components/ui/Tag';
import { Input } from '@/components/ui/Input';
import { formatDateShort } from '@/utils';
import { PROBLEM_TAGS } from '@/types';
import { ProblemTag } from '@/types';
import type { Patient } from '@/types';

export default function PatientList() {
  const navigate = useNavigate();
  const { currentUser } = useAuthStore();
  const { patients, searchPatients, getPatientsByDoctor } = usePatientStore();
  const [searchKeyword, setSearchKeyword] = useState('');
  const [filterDoctor, setFilterDoctor] = useState<string>('all');

  const filteredPatients = (() => {
    let result = patients;
    if (searchKeyword) {
      result = searchPatients(searchKeyword);
    }
    if (filterDoctor !== 'all') {
      result = result.filter(p => p.doctorId === filterDoctor);
    }
    return result.sort((a, b) => a.name.localeCompare(b.name, 'zh'));
  })();

  const handlePatientClick = (patient: Patient) => {
    navigate(`/patient/${patient.id}`);
  };

  const doctors = [
    { id: 'all', name: '全部医生' },
    { id: 'doctor1', name: '张明医生' },
    { id: 'doctor2', name: '李华医生' },
    { id: 'doctor3', name: '王芳医生' },
  ];

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">患者档案</h1>
          <p className="text-sm text-slate-500 mt-1">
            共 {filteredPatients.length} 位患者
          </p>
        </div>
        <Button variant="primary">
          <UserPlus size={16} />
          新增患者
        </Button>
      </div>

      <div className="flex items-center gap-4 mb-6 bg-white rounded-xl p-3 shadow-card border border-slate-100">
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
            value={filterDoctor}
            onChange={(e) => setFilterDoctor(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            {doctors.map(d => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredPatients.map((patient, index) => {
          const doctor = useAuthStore.getState().users.find(u => u.id === patient.doctorId);

          return (
            <Card
              key={patient.id}
              hover
              className="p-4 cursor-pointer animate-slide-up"
              style={{ animationDelay: `${index * 20}ms` }}
              onClick={() => handlePatientClick(patient)}
            >
              <div className="flex items-start gap-3">
                <Avatar name={patient.name} size="lg" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-slate-900 truncate">{patient.name}</h4>
                    <Badge variant="info" className="text-xs">
                      {patient.archiveNo}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                    <span>{patient.gender === 'male' ? '男' : '女'}</span>
                    <span>·</span>
                    <span>{patient.age}岁</span>
                  </div>

                  <div className="flex items-center gap-1 mt-2 text-xs text-slate-500">
                    <Phone size={12} />
                    <span>{patient.phone}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1 text-slate-500">
                    <User size={12} />
                    <span>{doctor?.name || '未分配'}</span>
                  </div>
                  <span className="text-slate-400">
                    初诊 {formatDateShort(patient.firstVisitDate)}
                  </span>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {filteredPatients.length === 0 && (
        <div className="text-center py-16">
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <Search size={24} className="text-slate-400" />
          </div>
          <p className="text-slate-500">暂无匹配的患者</p>
          <p className="text-sm text-slate-400 mt-1">尝试其他关键词搜索</p>
        </div>
      )}
    </div>
  );
}
