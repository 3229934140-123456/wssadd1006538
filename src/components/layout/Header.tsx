import { Search, Bell, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { Avatar } from '../ui/Avatar';
import { formatDateCN, getToday } from '@/utils';

export function Header() {
  const { currentUser } = useAuthStore();
  const [searchValue, setSearchValue] = useState('');

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0">
      <div className="flex items-center gap-4">
        <h2 className="text-lg font-semibold text-slate-800">随访看板</h2>
        <div className="text-sm text-slate-500">
          {formatDateCN(getToday())}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="搜索患者姓名/电话/档案号"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="w-72 pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
          />
        </div>

        <button className="relative p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-danger-500 rounded-full"></span>
        </button>

        <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
          <Avatar name={currentUser?.name} size="md" />
          <div className="flex items-center gap-1 text-sm text-slate-700">
            <span className="font-medium">{currentUser?.name}</span>
            <ChevronDown size={14} className="text-slate-400" />
          </div>
        </div>
      </div>
    </header>
  );
}
