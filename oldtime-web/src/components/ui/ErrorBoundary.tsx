import { Component, type ReactNode } from 'react'
import { Button } from './Button'

interface Props { children: ReactNode }
interface State { hasError: boolean }

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) { super(props); this.state = { hasError: false } }
  static getDerivedStateFromError(): State { return { hasError: true } }
  componentDidCatch(error: Error, info: any) { console.error('[ErrorBoundary]', error, info) }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center px-6">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#FFF1F0] flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FF4D4F" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            </div>
            <h3 className="text-[16px] font-medium text-[#1A1A1A] mb-2">出了点小问题</h3>
            <p className="text-[14px] text-[#999] mb-6">别担心，刷新页面就能恢复。</p>
            <Button variant="primary" onClick={() => window.location.reload()}>刷新页面</Button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
