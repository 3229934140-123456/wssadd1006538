import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Lock,
  UserCircle,
  Stethoscope,
  PhoneCall,
  Shield,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuthStore } from '@/store/useAuthStore';
import type { UserRole } from '@/types';
import { cn } from '@/utils';

const roles: { key: UserRole; label: string; icon: React.ReactNode; desc: string }[] = [
  { key: 'doctor', label: '洁治医生', icon: <Stethoscope size={20} />, desc: '录入洁治记录、设置回访计划' },
  { key: 'reception', label: '前台人员', icon: <PhoneCall size={20} />, desc: '随访跟进、预约管理' },
  { key: 'admin', label: '管理员', icon: <Shield size={20} />, desc: '数据统计、系统管理' },
];

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [selectedRole, setSelectedRole] = useState<UserRole>('reception');
  const [username, setUsername] = useState('前台小林');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    setTimeout(() => {
      const success = login(username, selectedRole);
      if (success) {
        navigate('/board');
      } else {
        setError('用户名或角色不匹配，请重试');
      }
      setLoading(false);
    }, 500);
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-500 via-primary-600 to-teal-700 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 rounded-full bg-white blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 rounded-full bg-teal-300 blur-3xl" />
        </div>

        <div className="relative z-10 flex flex-col justify-center p-16 text-white">
          <div className="flex items-center gap-4 mb-12">
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Sparkles size={28} />
            </div>
            <div>
              <h1 className="text-3xl font-bold">口腔随访看板</h1>
              <p className="text-primary-100 text-sm mt-1">数字化随访管理系统</p>
            </div>
          </div>

          <h2 className="text-4xl font-bold mb-6 leading-tight">
            让每一次回访
            <br />
            都更有温度
          </h2>
          <p className="text-lg text-primary-100 leading-relaxed mb-12 max-w-md">
            从纸质登记到数字化待办，提升随访效率，提高患者复诊率，
            让洁治后的关怀真正触达每一位患者。
          </p>

          <div className="space-y-4">
            {[
              '三栏式看板，今日需联系一目了然',
              '标准化话术，前台沟通更专业',
              '一键预约，复诊转化更高效',
              '数据统计，随访效果可量化',
            ].map((item, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-primary-50">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8 bg-slate-50">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center justify-center gap-3 mb-10">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
              <Sparkles className="text-white" size={20} />
            </div>
            <h1 className="text-xl font-bold text-slate-800">口腔随访看板</h1>
          </div>

          <div className="bg-white rounded-2xl shadow-card p-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">欢迎登录</h2>
            <p className="text-slate-500 text-sm mb-8">请选择您的角色并登录系统</p>

            <div className="grid grid-cols-3 gap-2 mb-6">
              {roles.map(role => (
                <button
                  key={role.key}
                  onClick={() => setSelectedRole(role.key)}
                  className={cn(
                    'flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all duration-200',
                    selectedRole === role.key
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-slate-200 hover:border-slate-300 text-slate-500 hover:text-slate-700'
                  )}
                >
                  {role.icon}
                  <span className="text-xs font-medium">{role.label}</span>
                </button>
              ))}
            </div>
            <p className="text-xs text-slate-400 mb-6 text-center">
              {roles.find(r => r.key === selectedRole)?.desc}
            </p>

            <form onSubmit={handleLogin} className="space-y-4">
              <Input
                label="用户名"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="请输入用户名"
                leftIcon={<User size={18} />}
                autoFocus
              />

              <Input
                label="密码"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="请输入密码（演示账号可留空）"
                leftIcon={<Lock size={18} />}
              />

              {error && (
                <div className="p-3 bg-danger-50 text-danger-600 text-sm rounded-lg">
                  {error}
                </div>
              )}

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 text-slate-600 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 rounded text-primary-600 focus:ring-primary-500" />
                  记住登录状态
                </label>
                <button type="button" className="text-primary-600 hover:text-primary-700">
                  忘记密码？
                </button>
              </div>

              <Button type="submit" fullWidth size="lg" loading={loading}>
                登录系统
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t border-slate-100">
              <p className="text-xs text-slate-400 text-center mb-3">
                演示账号（选择对应角色后直接登录）
              </p>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <button
                  onClick={() => { setUsername('张明医生'); setSelectedRole('doctor'); }}
                  className="p-2 bg-slate-50 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  张明医生
                </button>
                <button
                  onClick={() => { setUsername('前台小林'); setSelectedRole('reception'); }}
                  className="p-2 bg-slate-50 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  前台小林
                </button>
                <button
                  onClick={() => { setUsername('管理员'); setSelectedRole('admin'); }}
                  className="p-2 bg-slate-50 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  管理员
                </button>
              </div>
            </div>
          </div>

          <p className="text-center text-xs text-slate-400 mt-8">
            © 2024 口腔随访看板系统 · 让随访更高效
          </p>
        </div>
      </div>
    </div>
  );
}
