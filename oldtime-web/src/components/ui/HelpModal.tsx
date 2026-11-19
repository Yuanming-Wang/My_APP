import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Button } from './Button'
import { draftsApi } from '../../lib/api'
import { uploadDraftMedia } from '../../lib/media'
import { useStore } from '../../hooks/useStore'

interface Child {
  id: string
  name: string
  phone: string
}

const CONTACTS_KEY = 'oldtime-children'

function getSavedChildren(): Child[] {
  try {
    const data = localStorage.getItem(CONTACTS_KEY)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

function saveChildren(children: Child[]) {
  localStorage.setItem(CONTACTS_KEY, JSON.stringify(children))
}

interface HelpModalProps {
  open: boolean
  onClose: () => void
}

export function HelpModal({ open, onClose }: HelpModalProps) {
  const [step, setStep] = useState<'list' | 'add'>('list')
  const [children, setChildren] = useState<Child[]>([])
  const [newName, setNewName] = useState('')
  const [newPhone, setNewPhone] = useState('')
  const [nameError, setNameError] = useState('')
  const [phoneError, setPhoneError] = useState('')
  const [creating, setCreating] = useState(false)

  const draftMedia = useStore((s) => s.draftMedia)
  const ownerName = useStore((s) => s.ownerName)

  useEffect(() => {
    if (open) {
      const saved = getSavedChildren()
      setChildren(saved)
      setStep(saved.length > 0 ? 'list' : 'add')
      setNewName('')
      setNewPhone('')
      setNameError('')
      setPhoneError('')
    }
  }, [open])

  if (!open) return null

  const handleAdd = () => {
    setNameError('')
    setPhoneError('')

    if (!newName.trim()) {
      setNameError('请输入孩子姓名')
      return
    }
    if (!newPhone.trim()) {
      setPhoneError('请输入手机号')
      return
    }
    if (!/^1[3-9]\d{9}$/.test(newPhone.trim())) {
      setPhoneError('手机号格式不正确，请输入11位手机号')
      return
    }
    if (children.some((c) => c.phone === newPhone.trim())) {
      setPhoneError('该手机号已添加过')
      return
    }

    const updated = [...children, { id: crypto.randomUUID(), name: newName.trim(), phone: newPhone.trim() }]
    saveChildren(updated)
    setChildren(updated)
    setNewName('')
    setNewPhone('')
    setStep('list')
  }

  const handleDelete = (id: string) => {
    const updated = children.filter((c) => c.id !== id)
    saveChildren(updated)
    setChildren(updated)
    if (updated.length === 0) setStep('add')
  }

  const handleCall = (child: Child) => {
    window.location.href = `tel:${child.phone}`
  }

  const createDraftAndShare = async (child: Child, shareMethod: 'sms' | 'copy') => {
    const photos = draftMedia.filter((media) => media.type === 'image')
    if (photos.length === 0) {
      alert('协作编辑目前仅支持照片，请先选择照片再求助孩子。')
      return
    }

    try {
      setCreating(true)

      const uploadedPhotos: Array<{ imageUrl: string; story: string }> = []
      for (const media of photos) {
        const uploaded = await uploadDraftMedia(media)
        uploadedPhotos.push({ imageUrl: uploaded.url, story: media.story })
      }

      const res = await draftsApi.create(ownerName || '家人', uploadedPhotos)

      const draftId = res.data.id
      const helpUrl = `${window.location.origin}${window.location.pathname}#/help/${draftId}`

      if (shareMethod === 'sms') {
        const msg = `我是${ownerName || '家人'}，我正在用"旧时光"做纪念册，需要你帮忙。请打开这个链接帮我一起完成：${helpUrl}`
        window.location.href = `sms:${child.phone}?body=${encodeURIComponent(msg)}`
      } else {
        await navigator.clipboard.writeText(helpUrl)
        alert(`协作链接已复制！发给${child.name}就可以了。\n\n孩子打开链接后，可以帮您写故事、完成纪念册。`)
      }
    } catch (err: any) {
      alert('创建协作链接失败：' + (err.message || '请确保后端服务已启动。'))
    } finally {
      setCreating(false)
    }
  }

  const handleClose = () => {
    setStep('list')
    onClose()
  }

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-end justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={handleClose} />
      <div className="relative w-full max-w-[480px] bg-white rounded-t-[16px] overflow-hidden max-h-[80vh] flex flex-col">
        {/* 头部 */}
        <div className="px-4 py-3 border-b border-[#E8E8E8] flex items-center justify-between flex-shrink-0">
          <h3 className="text-[16px] font-medium text-[#1A1A1A]">叫孩子帮忙</h3>
          <button onClick={handleClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#F5F5F5] transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>

        <div className="overflow-y-auto flex-1">
          {/* 孩子列表 */}
          {step === 'list' && (
            <div className="p-4 space-y-3">
              {/* 使用说明 */}
              <div className="flex items-start gap-2 p-3 bg-[#FFF8F0] rounded-[8px]">
                <span className="text-sm mt-0.5">💡</span>
                <div>
                  <p className="text-[12px] text-[#666] leading-relaxed">
                    点击 <span className="text-[#52C41A] font-medium">打电话</span> 直接拨号；
                    点击 <span className="text-[#1890FF] font-medium">发短信</span> 发送协作链接，孩子打开后能帮您写故事；
                    点击 <span className="text-[#FAAD14] font-medium">复制链接</span> 手动发给孩子。
                  </p>
                </div>
              </div>

              {children.map((child) => (
                <div key={child.id} className="flex items-center gap-3 p-3 bg-[#F5F5F5] rounded-[12px]">
                  <div className="w-10 h-10 rounded-full bg-[#8B4513] flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-[16px] font-medium">{child.name.charAt(0)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[15px] font-medium text-[#1A1A1A] truncate">{child.name}</p>
                    <p className="text-[13px] text-[#666]">{child.phone}</p>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button onClick={() => handleCall(child)} className="flex flex-col items-center gap-1 px-2 py-1 rounded-[8px] bg-[#F6FFED] hover:bg-[#D9F7BE] transition-colors active:scale-95">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#52C41A" strokeWidth="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>
                      <span className="text-[11px] text-[#52C41A]">打电话</span>
                    </button>
                    <button onClick={() => createDraftAndShare(child, 'sms')} disabled={creating} className="flex flex-col items-center gap-1 px-2 py-1 rounded-[8px] bg-[#E6F7FF] hover:bg-[#BAE7FF] transition-colors active:scale-95 disabled:opacity-40">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1890FF" strokeWidth="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
                      <span className="text-[11px] text-[#1890FF]">发短信</span>
                    </button>
                    <button onClick={() => createDraftAndShare(child, 'copy')} disabled={creating} className="flex flex-col items-center gap-1 px-2 py-1 rounded-[8px] bg-[#FFF7E6] hover:bg-[#FFE7BA] transition-colors active:scale-95 disabled:opacity-40">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FAAD14" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
                      <span className="text-[11px] text-[#FAAD14]">复制链接</span>
                    </button>
                    <button onClick={() => handleDelete(child.id)} className="flex flex-col items-center gap-1 px-2 py-1 rounded-[8px] bg-[#FFF1F0] hover:bg-[#FFCCC7] transition-colors active:scale-95">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FF4D4F" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
                      <span className="text-[11px] text-[#FF4D4F]">删除</span>
                    </button>
                  </div>
                </div>
              ))}

              <button onClick={() => setStep('add')} className="w-full flex items-center justify-center gap-2 p-3 border-2 border-dashed border-[#E8E8E8] rounded-[12px] text-[#999] hover:border-[#8B4513] hover:text-[#8B4513] transition-colors active:scale-[0.98]">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                <span className="text-[14px]">添加孩子</span>
              </button>
            </div>
          )}

          {/* 添加孩子 */}
          {step === 'add' && (
            <div className="p-4 space-y-4">
              <div className="flex items-start gap-3 p-3 bg-[#FFF8F0] rounded-[8px]">
                <span className="text-xl">💡</span>
                <div>
                  <p className="text-[14px] font-medium text-[#1A1A1A]">添加孩子的联系方式</p>
                  <p className="text-[13px] text-[#666] mt-1">添加后，下次直接一键求助。</p>
                </div>
              </div>

              <div>
                <label className="text-[13px] text-[#666] mb-2 block">孩子姓名</label>
                <input value={newName} onChange={(e) => { setNewName(e.target.value); setNameError('') }} placeholder="例如：小明" className="input" maxLength={20} />
                {nameError && <p className="text-[12px] text-[#FF4D4F] mt-1">{nameError}</p>}
              </div>

              <div>
                <label className="text-[13px] text-[#666] mb-2 block">手机号码</label>
                <input type="tel" value={newPhone} onChange={(e) => { setNewPhone(e.target.value.replace(/\D/g, '')); setPhoneError('') }} placeholder="请输入11位手机号" className="input" maxLength={11} />
                {phoneError && <p className="text-[12px] text-[#FF4D4F] mt-1">{phoneError}</p>}
              </div>

              <div className="flex gap-3">
                <Button variant="ghost" className="flex-1" onClick={() => children.length > 0 ? setStep('list') : handleClose()}>取消</Button>
                <Button variant="primary" className="flex-1" onClick={handleAdd} disabled={!newName.trim() || !newPhone.trim()}>保存</Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  )
}
