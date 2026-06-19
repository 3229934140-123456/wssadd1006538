import { useState } from 'react';
import type { FollowUpWithDetails, FollowUpResult, ContactMethod } from '@/types';
import { FOLLOW_UP_RESULTS, CONTACT_METHODS } from '@/types';
import { Button } from '../ui/Button';
import { Avatar } from '../ui/Avatar';
import { Badge } from '../ui/Badge';
import { TextArea } from '../ui/TextArea';
import { cn, formatDateShort, getToday, addDays } from '@/utils';
import { useFollowUpStore } from '@/store/useFollowUpStore';
import { useAuthStore } from '@/store/useAuthStore';

interface BatchContactModalProps {
  selectedItems: FollowUpWithDetails[];
  onClose: () => void;
}

interface PatientRowState {
  result: FollowUpResult | '';
  notes: string;
}

export function BatchContactModal({ selectedItems, onClose }: BatchContactModalProps) {
  const [contactMethod, setContactMethod] = useState<ContactMethod>('phone');
  const [batchResult, setBatchResult] = useState<FollowUpResult | ''>('');
  const [batchNotes, setBatchNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [patientStates, setPatientStates] = useState<PatientRowState[]>(
    selectedItems.map(() => ({ result: '', notes: '' }))
  );

  const updateFollowUpResult = useFollowUpStore((s) => s.updateFollowUpResult);
  const { currentUser } = useAuthStore();

  const handleBatchFill = () => {
    if (!batchResult) return;
    setPatientStates((prev) =>
      prev.map((s) => ({
        ...s,
        result: batchResult,
        notes: batchNotes || s.notes,
      }))
    );
  };

  const updatePatientResult = (index: number, result: FollowUpResult | '') => {
    setPatientStates((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], result };
      return next;
    });
  };

  const updatePatientNotes = (index: number, notes: string) => {
    setPatientStates((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], notes };
      return next;
    });
  };

  const allResultsFilled = patientStates.every((s) => s.result !== '');

  const handleSaveAll = async () => {
    if (!currentUser || !allResultsFilled) return;
    setSaving(true);

    for (let i = 0; i < selectedItems.length; i++) {
      const item = selectedItems[i];
      const state = patientStates[i];
      const result = state.result as FollowUpResult;

      const nextFollowUpDate = result === 'connected' ? addDays(getToday(), 30) : undefined;

      updateFollowUpResult(
        item.id,
        result,
        contactMethod,
        currentUser.id,
        currentUser.name,
        undefined,
        state.notes || undefined,
        nextFollowUpDate,
        undefined
      );
    }

    setSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col mx-4">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-lg font-semibold text-slate-900">批量联系</h2>
          <span className="text-sm text-slate-500">已选 {selectedItems.length} 位患者</span>
        </div>

        <div className="px-6 py-4 border-b border-slate-100 space-y-4">
          <div>
            <h4 className="text-sm font-medium text-slate-700 mb-2">联系方式</h4>
            <div className="flex gap-2">
              {CONTACT_METHODS.map((method) => (
                <button
                  key={method.key}
                  onClick={() => setContactMethod(method.key)}
                  className={cn(
                    'px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all',
                    contactMethod === method.key
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                  )}
                >
                  {method.label}
                </button>
              ))}
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl space-y-3">
            <h4 className="text-sm font-medium text-slate-700">一键填充</h4>
            <div className="flex items-end gap-3">
              <div className="flex-1">
                <label className="block text-xs text-slate-500 mb-1">统一结果</label>
                <select
                  value={batchResult}
                  onChange={(e) => setBatchResult(e.target.value as FollowUpResult | '')}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">选择结果...</option>
                  {FOLLOW_UP_RESULTS.map((r) => (
                    <option key={r.key} value={r.key}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex-[2]">
                <label className="block text-xs text-slate-500 mb-1">统一备注</label>
                <input
                  type="text"
                  value={batchNotes}
                  onChange={(e) => setBatchNotes(e.target.value)}
                  placeholder="可选，填充到所有患者备注"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <Button variant="secondary" size="sm" onClick={handleBatchFill} disabled={!batchResult}>
                应用
              </Button>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-3">
          <div className="space-y-3">
            {selectedItems.map((item, index) => {
              const state = patientStates[index];
              const resultInfo = state.result
                ? FOLLOW_UP_RESULTS.find((r) => r.key === state.result)
                : null;

              return (
                <div
                  key={item.id}
                  className={cn(
                    'p-4 rounded-xl border transition-all',
                    state.result === 'noAnswer'
                      ? 'bg-slate-50 border-slate-200'
                      : state.result === 'connected'
                        ? 'bg-green-50 border-green-200'
                        : state.result === 'refused'
                          ? 'bg-red-50 border-red-200'
                          : state.result === 'booked'
                            ? 'bg-blue-50 border-blue-200'
                            : 'bg-white border-slate-200'
                  )}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <Avatar name={item.patient.name} size="sm" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-slate-900 truncate">
                          {item.patient.name}
                        </span>
                        {resultInfo && (
                          <Badge
                            variant={
                              state.result === 'connected'
                                ? 'success'
                                : state.result === 'noAnswer'
                                  ? 'default'
                                  : state.result === 'refused'
                                    ? 'danger'
                                    : 'info'
                            }
                          >
                            {resultInfo.label}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                        <span>{item.patient.phone}</span>
                        <span>计划: {formatDateShort(item.plannedDate)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-end gap-3">
                    <div className="w-36">
                      <label className="block text-xs text-slate-500 mb-1">联系结果</label>
                      <select
                        value={state.result}
                        onChange={(e) =>
                          updatePatientResult(index, e.target.value as FollowUpResult | '')
                        }
                        className={cn(
                          'w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500',
                          state.result === 'noAnswer'
                            ? 'border-slate-300 bg-white'
                            : state.result === 'connected'
                              ? 'border-green-300 bg-white'
                              : state.result === 'refused'
                                ? 'border-red-300 bg-white'
                                : state.result === 'booked'
                                  ? 'border-blue-300 bg-white'
                                  : 'border-slate-300 bg-white'
                        )}
                      >
                        <option value="">选择...</option>
                        {FOLLOW_UP_RESULTS.map((r) => (
                          <option key={r.key} value={r.key}>
                            {r.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex-1">
                      <TextArea
                        placeholder="备注..."
                        value={state.notes}
                        onChange={(e) => updatePatientNotes(index, e.target.value)}
                        rows={1}
                        className="!py-1.5"
                      />
                    </div>
                  </div>

                  {state.result === 'noAnswer' && (
                    <p className="text-xs text-info-600 bg-info-50 px-3 py-1.5 rounded-lg mt-2">
                      未接通将自动进入明日待办
                    </p>
                  )}
                  {state.result === 'booked' && (
                    <p className="text-xs text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg mt-2">
                      联系记录将保存，预约需另行安排
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/50 rounded-b-2xl">
          <span className="text-sm text-slate-500">
            {patientStates.filter((s) => s.result !== '').length} / {selectedItems.length} 已填写
          </span>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={onClose}>
              取消
            </Button>
            <Button variant="primary" onClick={handleSaveAll} disabled={!allResultsFilled || saving} loading={saving}>
              保存全部
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
