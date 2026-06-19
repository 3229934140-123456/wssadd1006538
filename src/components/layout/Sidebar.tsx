import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  FileText,
  BarChart3,
  Settings,
  LogOut,
  CalendarDays,
} from 'lucide-react';
import { cn } from '@/utils';
import { useAuthStore } from '@/store/useAuthStore';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';

const roleLabels: Record<string, string> = {
  doctor: '医生',
  reception: '前台',
  admin: '管理员',
};

export function Sidebar() {
  const { currentUser, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/board', label: '随访看板', icon: LayoutDashboard },
    { path: '/patients', label: '患者档案', icon: Users },
    { path: '/appointments', label: '预约管理', icon: CalendarDays },
    { path: '/statistics', label: '数据统计', icon: BarChart3 },
  ];

  return (
    <aside className="w-60 bg-white border-r border-slate-200 flex flex-col h-screen shrink-0">
      <div className="h-16 flex items-center px-6 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
            <FileText className="text-white" size={20} />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900">随访看板</h1>
            <p className="text-xs text-slate-400">口腔诊所管理</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 py-4 px-3 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-primary-50 text-primary-600'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              )
            }
          >
            <item.icon size={18} />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="p-3 border-t border-slate-100">
        <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 mb-2">
          <Avatar name={currentUser?.name} size="md" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-900 truncate">
              {currentUser?.name}
            </p>
            <Badge variant="info" className="mt-0.5">
              {roleLabels[currentUser?.role || '']}
            </Badge>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-500 hover:text-danger-600 hover:bg-danger-50 rounded-lg transition-colors"
        >
          <LogOut size={16} />
          退出登录
        </button>
      </div>
    </aside>
  );
}
