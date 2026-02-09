import { useState } from 'react'
import LyricMeta from '../Lyrics/LyricMeta'
import LyricDisplay from '../Lyrics/LyricDisplay'
import WikiTab from './WikiTab'
import RecommendTab from './RecommendTab'
import LibraryTab from './LibraryTab'

type TabKey = 'lyrics' | 'wiki' | 'recommend' | 'library'

const tabs: { key: TabKey; label: string }[] = [
  { key: 'lyrics', label: '歌词' },
  { key: 'library', label: '曲库' },
  { key: 'wiki', label: '百科' },
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
            className={`px-3 py-1.5 text-sm rounded-md transition-all ${
              activeTab === tab.key
                ? 'text-primary bg-primary/10 font-medium'
                : 'text-text-muted hover:text-text-primary hover:bg-white/5'
            }`}
          >
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
        {activeTab === 'wiki' && <WikiTab />}
        {activeTab === 'recommend' && <RecommendTab />}
      </div>
    </div>
  )
}
