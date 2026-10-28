import {useEffect, useState} from 'react';
import {sakuraApi} from '../services/sakuraApiService';
import type {FacultyDefaultProfileDTO} from '../types/api';
import {useModalFocus} from './useModalFocus';

export function SqlApiArchitectureModal({open,onClose}: {open:boolean;onClose:()=>void;showToast:(message:string)=>void}) {
  const ref=useModalFocus(open,onClose);
  const [profile,setProfile]=useState<FacultyDefaultProfileDTO|null>(null);
  const [error,setError]=useState('');
  useEffect(()=>{
    if(!open)return;
    let active=true;setProfile(null);setError('');
    void sakuraApi.auth.getDefaultProfile().then(result=>{
      if(!active)return;
      if(result.success&&result.data)setProfile(result.data);else setError('无法读取当前登录状态');
    }).catch(()=>{if(active)setError('无法读取当前登录状态');});
    return ()=>{active=false;};
  },[open]);
  if(!open)return null;
  return <div className="fixed inset-0 z-[220] bg-black/30 p-3 sm:p-6 flex items-center justify-center">
    <div ref={ref} tabIndex={-1} role="dialog" aria-modal="true" aria-label="个人功能" className="w-full max-w-xl max-h-[90vh] overflow-y-auto bg-background text-on-surface rounded-xl border border-outline-variant p-6 space-y-5">
      <header className="flex items-center justify-between gap-3"><h2 className="text-xl font-bold">个人功能</h2><button className="sakura-btn sakura-btn-secondary" onClick={onClose}>关闭</button></header>
      <p className="text-sm text-on-surface-variant">查看当前账号信息，并从工作台使用已授权的教学功能。</p>
      {error ? <p role="alert">{error}</p> : profile ? <dl className="space-y-3 text-sm"><div><dt className="font-semibold">当前账号</dt><dd>{profile.facultyCode}</dd></div><div><dt className="font-semibold">显示名称</dt><dd>{profile.fullName}</dd></div><div><dt className="font-semibold">默认工作台</dt><dd>{profile.defaultTab}</dd></div></dl> : <p role="status">正在读取账号信息…</p>}
      <p className="text-sm text-on-surface-variant">账号设置、教学记录和通知可在工作台中查看。</p>
    </div>
  </div>;
}
