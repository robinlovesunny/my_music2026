import { useState, useCallback } from 'react'
import { useSettingsStore, getDecodedApiKey } from '../../store/settingsStore'
import {
  ArrowLeft,
  KeyRound,
  Eye,
  EyeOff,
  Shield,
  CheckCircle2,
  Settings,
  Lock,
  BarChart3,
  RefreshCw,
  LogOut,
  Save,
} from 'lucide-react'

interface AdminPageProps {
  onBack: () => void
}

export default function AdminPage({ onBack }: AdminPageProps) {
  const isAdminLoggedIn = useSettingsStore((s) => s.isAdminLoggedIn)
  const verifyAdminPassword = useSettingsStore((s) => s.verifyAdminPassword)
  const setAdminLoggedIn = useSettingsStore((s) => s.setAdminLoggedIn)
  const logout = useSettingsStore((s) => s.logout)

  if (!isAdminLoggedIn) {
    return <LoginForm onVerify={verifyAdminPassword} onSuccess={() => setAdminLoggedIn(true)} onBack={onBack} />
  }

  return <AdminDashboard onBack={onBack} onLogout={() => { logout(); onBack() }} />
}

/** 登录表单 */
function LoginForm({
  onVerify,
  onSuccess,
  onBack,
}: {
  onVerify: (pwd: string) => boolean
  onSuccess: () => void
  onBack: () => void
}) {
  const [password, setPassword] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [error, setError] = useState('')
  const [shaking, setShaking] = useState(false)

  const handleLogin = useCallback(() => {
    if (!password.trim()) {
      setError('请输入管理员密码')
      return
    }
    if (onVerify(password)) {
      onSuccess()
    } else {
      setError('密码错误，请重试')
      setShaking(true)
      setTimeout(() => setShaking(false), 500)
    }
  }, [password, onVerify, onSuccess])

  return (
    <div className="flex-1 flex items-center justify-center p-8 relative overflow-hidden">
      {/* 背景光晕 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/3 w-[400px] h-[400px] bg-primary/[0.04] rounded-full blur-[120px]" />
        <div className="absolute bottom-1/3 right-1/4 w-[300px] h-[300px] bg-cyan-500/[0.03] rounded-full blur-[100px]" />
      </div>

      <div className={`w-full max-w-sm relative z-10 modal-enter ${shaking ? 'animate-shake' : ''}`}>
        {/* 返回按钮 */}
        <button
          onClick={onBack}
          className="flex items-center gap-2 mb-8 text-text-dim hover:text-text-primary transition-colors cursor-pointer"
        >
          <ArrowLeft size={16} />
          <span className="text-sm">返回</span>
        </button>

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-primary/15 border border-primary/20 flex items-center justify-center mx-auto mb-4">
            <Shield size={28} className="text-primary" />
          </div>
          <h1 className="text-xl font-bold text-text-primary mb-1">管理员登录</h1>
          <p className="text-xs text-text-dim">请输入管理员密码以访问配置面板</p>
        </div>

        {/* 登录表单 */}
        <div className="space-y-4">
          <div className="relative">
            <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-dim" />
            <input
              type={showPwd ? 'text' : 'password'}
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError('') }}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              placeholder="请输入管理员密码"
              className="w-full pl-10 pr-10 py-3 rounded-xl bg-bg-secondary/80 border border-primary/15 text-sm text-text-primary placeholder:text-text-dim/50 focus:outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20 transition-all"
              autoFocus
            />
            <button
              onClick={() => setShowPwd(!showPwd)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-dim hover:text-text-muted transition-colors cursor-pointer"
            >
              {showPwd ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>

          {error && (
            <p className="text-xs text-red-400 text-center">{error}</p>
          )}

          <button
            onClick={handleLogin}
            className="w-full py-3 rounded-xl text-sm font-medium bg-primary/20 text-primary border border-primary/30 hover:bg-primary/30 transition-all cursor-pointer"
          >
            登录
          </button>
        </div>
      </div>
    </div>
  )
}

/** 管理员仪表板 */
function AdminDashboard({ onBack, onLogout }: { onBack: () => void; onLogout: () => void }) {
  const qwenApiKey = useSettingsStore((s) => s.qwenApiKey)
  const dailyCallCount = useSettingsStore((s) => s.dailyCallCount)
  const dailyLimit = useSettingsStore((s) => s.dailyLimit)
  const lastCallDate = useSettingsStore((s) => s.lastCallDate)
  const setQwenApiKey = useSettingsStore((s) => s.setQwenApiKey)
  const setDailyLimit = useSettingsStore((s) => s.setDailyLimit)
  const resetDailyCount = useSettingsStore((s) => s.resetDailyCount)
  const setAdminPassword = useSettingsStore((s) => s.setAdminPassword)

  const hasApiKey = !!qwenApiKey
  const decodedKey = hasApiKey ? getDecodedApiKey() : ''
  const maskedKey = decodedKey ? decodedKey.slice(0, 6) + '****' + decodedKey.slice(-4) : ''

  // API Key
  const [keyInput, setKeyInput] = useState('')
  const [showKeyInput, setShowKeyInput] = useState(false)
  const [keySaved, setKeySaved] = useState(false)

  // 每日限制
  const [limitInput, setLimitInput] = useState(String(dailyLimit))

  // 修改密码
  const [showPwdSection, setShowPwdSection] = useState(false)
  const [newPwd, setNewPwd] = useState('')
  const [confirmPwd, setConfirmPwd] = useState('')
  const [pwdError, setPwdError] = useState('')
  const [pwdSaved, setPwdSaved] = useState(false)

  const handleSaveKey = useCallback(() => {
    if (keyInput.trim()) {
      setQwenApiKey(keyInput.trim())
      setKeyInput('')
      setShowKeyInput(false)
      setKeySaved(true)
      setTimeout(() => setKeySaved(false), 2000)
    }
  }, [keyInput, setQwenApiKey])

  const handleSaveLimit = useCallback(() => {
    const num = parseInt(limitInput)
    if (!isNaN(num) && num > 0 && num <= 1000) {
      setDailyLimit(num)
    }
  }, [limitInput, setDailyLimit])

  const handleChangePwd = useCallback(() => {
    setPwdError('')
    if (!newPwd || newPwd.length < 4) {
      setPwdError('密码长度至少4位')
      return
    }
    if (newPwd !== confirmPwd) {
      setPwdError('两次输入的密码不一致')
      return
    }
    setAdminPassword(newPwd)
    setNewPwd('')
    setConfirmPwd('')
    setPwdSaved(true)
    setTimeout(() => { setPwdSaved(false); setShowPwdSection(false) }, 1500)
  }, [newPwd, confirmPwd, setAdminPassword])

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* 顶部栏 */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-primary/10">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-text-dim hover:text-text-primary hover:bg-white/5 transition-all cursor-pointer"
          >
            <ArrowLeft size={16} />
            <span className="text-sm">返回</span>
          </button>
          <div className="h-4 w-px bg-white/10" />
          <div className="flex items-center gap-2">
            <Settings size={16} className="text-primary" />
            <h1 className="text-base font-semibold text-text-primary">管理员控制台</h1>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-text-dim hover:text-red-400 hover:bg-red-400/10 transition-all cursor-pointer"
        >
          <LogOut size={14} />
          <span className="text-xs">退出登录</span>
        </button>
      </div>

      {/* 主内容 */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
        <div className="max-w-2xl mx-auto space-y-5 ai-insight-enter">

          {/* 统计卡片 */}
          <div className="grid grid-cols-3 gap-4">
            <StatCard
              icon={<KeyRound size={18} />}
              label="API Key"
              value={hasApiKey ? '已配置' : '未配置'}
              valueColor={hasApiKey ? 'text-primary' : 'text-amber-400'}
            />
            <StatCard
              icon={<BarChart3 size={18} />}
              label="今日调用"
              value={`${dailyCallCount} / ${dailyLimit}`}
              valueColor="text-primary"
            />
            <StatCard
              icon={<Shield size={18} />}
              label="上次调用"
              value={lastCallDate || '暂无'}
              valueColor="text-text-muted"
            />
          </div>

          {/* API Key 配置 */}
          <SettingSection
            icon={<KeyRound size={16} />}
            title="通义千问 API Key"
            description="配置后所有用户共享此密钥进行AI解读"
          >
            {hasApiKey && !showKeyInput && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-primary" />
                  <code className="text-xs text-text-muted font-mono bg-bg-main/60 px-2 py-1 rounded">{maskedKey}</code>
                </div>
                <button
                  onClick={() => setShowKeyInput(true)}
                  className="text-xs text-primary/70 hover:text-primary transition-colors cursor-pointer"
                >
                  修改
                </button>
              </div>
            )}

            {(!hasApiKey || showKeyInput) && (
              <div className="space-y-3">
                <input
                  type="text"
                  value={keyInput}
                  onChange={(e) => setKeyInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveKey()}
                  placeholder="请输入通义千问 API Key (sk-...)"
                  className="w-full px-4 py-2.5 rounded-xl bg-bg-main/60 border border-primary/15 text-sm text-text-primary placeholder:text-text-dim/50 focus:outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20 transition-all font-mono"
                />
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSaveKey}
                    disabled={!keyInput.trim()}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                      keySaved
                        ? 'bg-green-500/15 text-green-400 border border-green-500/20'
                        : keyInput.trim()
                        ? 'bg-primary/15 text-primary border border-primary/20 hover:bg-primary/25'
                        : 'bg-white/5 text-text-dim border border-white/10 cursor-not-allowed'
                    }`}
                  >
                    {keySaved ? <><CheckCircle2 size={12} /> 保存成功</> : <><Save size={12} /> 保存</>}
                  </button>
                  {showKeyInput && (
                    <button
                      onClick={() => { setShowKeyInput(false); setKeyInput('') }}
                      className="px-3 py-2 rounded-lg text-xs text-text-dim hover:text-text-muted hover:bg-white/5 transition-all cursor-pointer"
                    >
                      取消
                    </button>
                  )}
                </div>
                <p className="text-[11px] text-text-dim leading-relaxed">
                  前往
                  <a href="https://dashscope.console.aliyun.com/apiKey" target="_blank" rel="noopener noreferrer" className="text-primary mx-1 hover:underline">
                    阿里云控制台
                  </a>
                  获取 API Key，密钥将加密存储在浏览器本地。
                </p>
              </div>
            )}
          </SettingSection>

          {/* 调用限制 */}
          <SettingSection
            icon={<BarChart3 size={16} />}
            title="每日调用限制"
            description="限制每天的API调用次数，防止费用超支"
          >
            <div className="flex items-center gap-3">
              <input
                type="number"
                value={limitInput}
                onChange={(e) => setLimitInput(e.target.value)}
                min={1}
                max={1000}
                className="w-24 px-3 py-2 rounded-lg bg-bg-main/60 border border-primary/15 text-sm text-text-primary text-center focus:outline-none focus:border-primary/40 transition-all"
              />
              <span className="text-xs text-text-dim">次/天</span>
              <button
                onClick={handleSaveLimit}
                className="px-3 py-2 rounded-lg text-xs font-medium bg-primary/15 text-primary border border-primary/20 hover:bg-primary/25 transition-all cursor-pointer"
              >
                应用
              </button>
              <div className="flex-1" />
              <button
                onClick={resetDailyCount}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs text-text-dim hover:text-primary hover:bg-primary/10 transition-all cursor-pointer"
              >
                <RefreshCw size={12} />
                重置今日计数
              </button>
            </div>
          </SettingSection>

          {/* 修改密码 */}
          <SettingSection
            icon={<Lock size={16} />}
            title="修改管理员密码"
            description="修改管理员登录密码"
          >
            {!showPwdSection ? (
              <button
                onClick={() => setShowPwdSection(true)}
                className="text-xs text-primary/70 hover:text-primary transition-colors cursor-pointer"
              >
                点击修改密码
              </button>
            ) : (
              <div className="space-y-3">
                <input
                  type="password"
                  value={newPwd}
                  onChange={(e) => { setNewPwd(e.target.value); setPwdError('') }}
                  placeholder="输入新密码（至少4位）"
                  className="w-full px-4 py-2.5 rounded-xl bg-bg-main/60 border border-primary/15 text-sm text-text-primary placeholder:text-text-dim/50 focus:outline-none focus:border-primary/40 transition-all"
                />
                <input
                  type="password"
                  value={confirmPwd}
                  onChange={(e) => { setConfirmPwd(e.target.value); setPwdError('') }}
                  onKeyDown={(e) => e.key === 'Enter' && handleChangePwd()}
                  placeholder="再次输入新密码"
                  className="w-full px-4 py-2.5 rounded-xl bg-bg-main/60 border border-primary/15 text-sm text-text-primary placeholder:text-text-dim/50 focus:outline-none focus:border-primary/40 transition-all"
                />
                {pwdError && <p className="text-xs text-red-400">{pwdError}</p>}
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleChangePwd}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                      pwdSaved
                        ? 'bg-green-500/15 text-green-400 border border-green-500/20'
                        : 'bg-primary/15 text-primary border border-primary/20 hover:bg-primary/25'
                    }`}
                  >
                    {pwdSaved ? <><CheckCircle2 size={12} /> 密码已更新</> : <><Save size={12} /> 确认修改</>}
                  </button>
                  <button
                    onClick={() => { setShowPwdSection(false); setNewPwd(''); setConfirmPwd(''); setPwdError('') }}
                    className="px-3 py-2 rounded-lg text-xs text-text-dim hover:text-text-muted hover:bg-white/5 transition-all cursor-pointer"
                  >
                    取消
                  </button>
                </div>
              </div>
            )}
          </SettingSection>

        </div>
      </div>
    </div>
  )
}

/** 统计卡片 */
function StatCard({ icon, label, value, valueColor }: { icon: React.ReactNode; label: string; value: string; valueColor: string }) {
  return (
    <div className="rounded-xl bg-bg-card/60 backdrop-blur-sm border border-primary/10 p-4">
      <div className="flex items-center gap-2 mb-2 text-text-dim">
        {icon}
        <span className="text-[11px]">{label}</span>
      </div>
      <p className={`text-sm font-semibold ${valueColor}`}>{value}</p>
    </div>
  )
}

/** 设置区块 */
function SettingSection({ icon, title, description, children }: {
  icon: React.ReactNode
  title: string
  description: string
  children: React.ReactNode
}) {
  return (
    <div className="rounded-xl bg-bg-card/60 backdrop-blur-sm border border-primary/10 overflow-hidden">
      <div className="px-5 py-3.5 border-b border-primary/10">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-primary">{icon}</span>
          <h3 className="text-sm font-medium text-text-primary">{title}</h3>
        </div>
        <p className="text-[11px] text-text-dim">{description}</p>
      </div>
      <div className="px-5 py-4">
        {children}
      </div>
    </div>
  )
}
