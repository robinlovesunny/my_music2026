import { useState } from 'react'
import LyricMeta from '../Lyrics/LyricMeta'
import LyricDisplay from '../Lyrics/LyricDisplay'
import AIInsightTab from './AIInsightTab'
import RecommendTab from './RecommendTab'
import LibraryTab from './LibraryTab'
import { Sparkles } from 'lucide-react'

type TabKey = 'lyrics' | 'library' | 'ai-insight' | 'recommend'

const tabs: { key: TabKey; label: string; icon?: boolean }[] = [
  { key: 'lyrics', label: '歌词' },
  { key: 'library', label: '曲库' },
  { key: 'ai-insight', label: 'AI解读', icon: true },
  { key: 'recommend', label: '相似推荐' },
]

export default function TabContainer() {
  const [activeTab, setActiveTab] = useState<TabKey>('lyrics')

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Tab 导航 */}
      <div className="flex items-center gap-1 px-3 py-2 border-b border-white/5">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-3 py-1.5 text-sm rounded-md transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === tab.key
                ? 'text-primary bg-primary/10 font-medium'
                : 'text-text-muted hover:text-text-primary hover:bg-white/5'
            }`}
          >
            {tab.icon && <Sparkles size={12} className={activeTab === tab.key ? 'text-primary' : ''} />}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 内容区 */}
      <div className="flex-1 flex flex-col min-h-0">
        {activeTab === 'lyrics' && (
          <>
            <LyricMeta />
            <LyricDisplay />
          </>
        )}
        {activeTab === 'library' && <LibraryTab />}
        {activeTab === 'ai-insight' && <AIInsightTab />}
        {activeTab === 'recommend' && <RecommendTab />}
      </div>
    </div>
  )
}
