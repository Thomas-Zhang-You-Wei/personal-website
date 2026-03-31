import { useState } from 'react'
import { Circuitry, Flask, Network, Handshake, Trophy, Broadcast, Dna, Rocket, Robot, FolderOpen } from '@phosphor-icons/react'
import profilePhoto from './assets/profile.png'
import runspaceImg from './assets/runspace.jpg'

/* ── Translations ──────────────────────────────────────────── */
const T = {
  en: {
    tabs: ['About', 'Projects', 'Achievements', 'Experiments'],
    hero: {
      subtitle: "Master's Student · Researcher · Innovator",
      institution: 'Dept. of Electrical Engineering, National Taiwan University',
    },
    about: {
      sectionSkills: 'Skills',
      sectionInterests: 'Interests',
      bio: [
        <>I am a first-year master's student in the Department of Electrical Engineering at National Taiwan University. My research focuses on <b>ratchetless satellite handover</b>, simulated using the <b>OpenAirInterface (OAI)</b> platform.</>,
        <>I intern at <b>TWBIO</b>, where I configure the Pioreactor system and develop plug-in modules to optimise yeast cultivation for astaxanthin yield and production efficiency.</>,
        <>I also work on the commercialisation of <b>space enzyme–protein scaffolding</b>, exploring the enzymatic degradation of PET in space environments to produce feedstock for 3D printing.</>,
      ],
    },
    skills: [
      { label: 'Raspberry Pi Development',       desc: 'Embedded systems, IoT, and hardware prototyping' },
      { label: 'Aseptic Microbial Techniques',   desc: 'Sterile handling and microbial cultivation protocols' },
      { label: 'Remote Network Configuration',   desc: 'Network infrastructure setup and management' },
      { label: 'Business Development',           desc: 'Partnership building and cross-domain collaboration' },
    ],
    interests: [
      'Satellite Communication',
      'Bio-manufacturing',
      'Space Materials',
      'AI in Science',
    ],
    projects: {
      placeholder: 'Details coming soon…',
      items: [
        { title: 'Ratchetless Satellite Handover',  tag: 'Research',    desc: 'Simulating seamless satellite handover using the OpenAirInterface (OAI) platform.' },
        { title: 'Pioreactor Plugin Development',   tag: 'Engineering', desc: 'Developing automation modules to optimise yeast cultivation and maximise astaxanthin yield.' },
        { title: 'Space Enzyme–Protein Scaffold',   tag: 'BizDev',      desc: 'Commercialising enzymatic PET degradation in space environments for 3D-printing feedstock.' },
      ],
    },
    achievements: {
      rank:       '1st Place',
      name:       'RunSpace Competition 2025',
      division:   'Implementation & Enterprise Innovation Division',
      team:       'Team',
      teamName:   'Asta-sense',
      champion:   'Champion',
      placeholder:'More achievements coming soon…',
    },
    experiments: {
      tag:        'Microgravity Simulation',
      title:      'Dual-Axis Clinostat',
      body: [
        <>A <b>dual-axis clinostat</b> (3D clinostat) is a microgravity simulation device that rotates biological samples simultaneously around two perpendicular axes. By continuously randomising the orientation of the gravitational vector, it produces a time-averaged near-weightless environment — enabling researchers to study the effects of microgravity without leaving Earth.</>,
        <>This technology is used in space biology, plant gravitropism studies, and the development of bioprocesses for future space missions. The dual-axis design provides more isotropic compensation than a single-axis clinostat, making it suitable for long-duration biological experiments.</>,
      ],
      placeholder: 'More experiments coming soon…',
    },
    footer: '"Fake it, until you make it."',
    emailSubject: 'Hello Thomas',
    emailBody: 'Hi Thomas,\n\n',
  },

  zh: {
    tabs: ['關於我', '專案', '獲獎', '實驗'],
    hero: {
      subtitle: '碩士研究生 · 研究員 · 創新者',
      institution: '國立臺灣大學電機工程學系研究所',
    },
    about: {
      sectionSkills: '技能',
      sectionInterests: '興趣',
      bio: [
        <>我目前就讀國立臺灣大學電機工程學系碩士班一年級，研究方向為<b>衛星無棘輪換手（Ratchetless Handover）</b>，使用 <b>OpenAirInterface（OAI）</b>平台進行系統模擬。</>,
        <>同時在 <b>TWBIO</b> 擔任實習生，負責 Pioreactor 生物反應器的系統配置與外掛模組開發，以優化酵母菌培養條件、提升蝦紅素產量與製程效率。</>,
        <>此外，我也參與<b>太空酵素蛋白質支架</b>的商業化推進工作，探索在太空環境中以酵素降解 PET 材料，將其轉化為可供 3D 列印使用的原料。</>,
      ],
    },
    skills: [
      { label: 'Raspberry Pi 開發',   desc: '嵌入式系統、IoT 與硬體原型開發' },
      { label: '無菌微生物操作',       desc: '無菌技術與微生物培養流程' },
      { label: '遠端網路配置與管理',   desc: '網路基礎架構建置與維運' },
      { label: '商業合作與開發',       desc: '跨域夥伴關係建立與推進' },
    ],
    interests: [
      '衛星通訊系統',
      '生物製造自動化',
      '太空材料研究',
      'AI 科學應用',
    ],
    projects: {
      placeholder: '詳細內容待補充…',
      items: [
        { title: '衛星無棘輪換手',      tag: '研究',    desc: '以 OpenAirInterface (OAI) 平台模擬衛星無縫換手機制。' },
        { title: 'Pioreactor 外掛開發', tag: '工程',    desc: '開發自動化模組，優化酵母菌培養條件，提升蝦紅素產量。' },
        { title: '太空酵素蛋白質支架',  tag: '商業開發', desc: '研究在太空環境中以酵素降解 PET，推動相關材料的商業應用。' },
      ],
    },
    achievements: {
      rank:       '第一名',
      name:       'RunSpace 競賽 2025',
      division:   '實作與企業創新組',
      team:       '團隊',
      teamName:   'Asta-sense',
      champion:   '冠軍',
      placeholder:'更多獲獎紀錄持續更新…',
    },
    experiments: {
      tag:        '微重力模擬',
      title:      '雙軸迴轉儀',
      body: [
        <>雙軸迴轉儀（3D Clinostat）是一種微重力模擬裝置，透過同時繞兩個垂直軸旋轉生物樣本，持續隨機化重力向量的方向，在時間平均下製造近似無重力的環境，讓研究人員無需進行太空飛行，即可在地面研究微重力對生物體的影響。</>,
        <>這項技術廣泛應用於太空生物學、植物向重力性研究，以及為未來太空任務設計的生物製程開發。相較於單軸設計，雙軸架構提供更完整的等向性補償，適合長時間生物實驗使用。</>,
      ],
      placeholder: '更多實驗內容持續更新…',
    },
    footer: '"Fake it, until you make it."',
    emailSubject: '您好，Thomas',
    emailBody: 'Thomas 您好，\n\n',
  },
}

/* ── Shared components ─────────────────────────────────────── */
const Rule = () => <div style={{ height: '1px', background: '#d6cfc4' }} />

const Tag = ({ children }) => (
  <span className="text-[11px] font-medium tracking-widest uppercase px-2 py-0.5 border border-[#d6cfc4] text-[#78716c] whitespace-nowrap">
    {children}
  </span>
)

const iconList = [Circuitry, Flask, Network, Handshake]
const interestIcons = [Broadcast, Dna, Rocket, Robot]

/* ── About ──────────────────────────────────────────────────── */
function AboutTab({ lang }) {
  const t = T[lang]
  return (
    <div className="animate-tab space-y-10">
      <div className="border border-[#d6cfc4] bg-white p-6 sm:p-8 space-y-4 text-[15px] leading-[1.8] text-[#44403c]">
        {t.about.bio.map((para, i) => <p key={i}>{para}</p>)}
      </div>

      <div>
        <p className="text-[11px] font-medium tracking-[0.2em] uppercase text-[#78716c] mb-4">{t.about.sectionSkills}</p>
        <div className="grid grid-cols-1 gap-px bg-[#d6cfc4] border border-[#d6cfc4] stagger sm:grid-cols-2">
          {t.skills.map(({ label, desc }, i) => {
            const Icon = iconList[i]
            return (
              <div key={label}
                className="animate-fade-up bg-white p-5 flex items-start gap-4
                           hover:bg-[#faf8f4] transition-colors duration-200 group">
                <div className="w-9 h-9 border border-[#d6cfc4] flex items-center justify-center
                                text-[#9a3412] group-hover:border-[#9a3412] transition-colors flex-shrink-0">
                  <Icon size={20} weight="duotone" />
                </div>
                <div>
                  <p className="text-sm font-medium text-[#1c1917] mb-0.5">{label}</p>
                  <p className="text-xs text-[#a8a29e] leading-relaxed">{desc}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div>
        <p className="text-[11px] font-medium tracking-[0.2em] uppercase text-[#78716c] mb-4">{t.about.sectionInterests}</p>
        <div className="grid grid-cols-2 gap-px bg-[#d6cfc4] border border-[#d6cfc4] stagger sm:grid-cols-4">
          {t.interests.map((label, i) => {
            const Icon = interestIcons[i]
            return (
              <div key={label}
                className="animate-fade-up bg-white p-5 text-center
                           hover:bg-[#faf8f4] transition-colors duration-200 group">
                <div className="w-10 h-10 border border-[#d6cfc4] flex items-center justify-center
                                text-[#9a3412] mx-auto mb-3 group-hover:border-[#9a3412] transition-colors">
                  <Icon size={22} weight="duotone" />
                </div>
                <p className="text-xs text-[#78716c] leading-snug">{label}</p>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

/* ── Projects ───────────────────────────────────────────────── */
function ProjectsTab({ lang }) {
  const t = T[lang]
  return (
    <div className="animate-tab border border-[#d6cfc4] divide-y divide-[#d6cfc4]">
      {t.projects.items.map((p, i) => (
        <div key={i} className="bg-white p-5 sm:p-7 flex items-start gap-4 sm:gap-6 hover:bg-[#faf8f4] transition-colors group">
          <span className="text-xs text-[#a8a29e] font-mono pt-0.5 flex-shrink-0 w-5">
            {String(i + 1).padStart(2, '0')}
          </span>
          <div className="flex-1 min-w-0">
            <div className="flex items-start gap-2 mb-2 flex-wrap">
              <h3 className="text-[15px] font-semibold text-[#1c1917]" style={{fontFamily:'var(--font-serif)'}}>{p.title}</h3>
              <Tag>{p.tag}</Tag>
            </div>
            <p className="text-sm text-[#78716c] leading-relaxed">{p.desc}</p>
            <p className="text-xs text-[#c4bdb5] italic mt-3">{t.projects.placeholder}</p>
          </div>
          <FolderOpen size={18} weight="duotone" className="text-[#c4bdb5] group-hover:text-[#9a3412] transition-colors flex-shrink-0 mt-1" />
        </div>
      ))}
    </div>
  )
}

/* ── Achievements ───────────────────────────────────────────── */
function AchievementsTab({ lang }) {
  const t = T[lang].achievements
  return (
    <div className="animate-tab space-y-4">
      <div className="bg-white border border-[#d6cfc4] overflow-hidden">
        <div className="relative">
          <a href="https://www.linkedin.com/posts/runspace-innovation-challenge_spacecanary-biosensor-biomanufacturing-activity-7394222414127304705-WTf_?utm_source=share&utm_medium=member_desktop&rcm=ACoAAFaqx0AB_B-Y7q2tMhlFpFVOUg9tUVs4UfM"
             target="_blank" rel="noreferrer" className="block">
            <img src={runspaceImg} alt={t.name}
              className="w-full object-cover hover:opacity-90 transition-opacity duration-200"
              style={{ maxHeight: '280px', objectPosition: 'center' }} />
            <div className="absolute top-4 left-4 bg-[#1c1917]/80 backdrop-blur-sm px-3 py-1.5 flex items-center gap-2">
              <Trophy size={14} weight="fill" className="text-[#d4a017]" />
              <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-[#d4a017]">{t.rank}</span>
            </div>
          </a>
        </div>
        <div className="p-6 sm:p-8">
          <div className="flex items-start gap-5 mb-5">
            <div className="flex-shrink-0 relative">
              <div className="absolute inset-0 opacity-30" style={{ boxShadow: '0 0 20px 4px #d4a017' }} />
              <div className="w-16 h-16 sm:w-20 sm:h-20 border-2 border-[#d4a017] flex items-center justify-center bg-[#fdf8f0] relative">
                <Trophy size={32} weight="duotone" className="text-[#d4a017] sm:hidden" />
                <Trophy size={40} weight="duotone" className="text-[#d4a017] hidden sm:block" />
              </div>
            </div>
            <div>
              <p className="text-[10px] font-bold tracking-[0.25em] uppercase text-[#9a3412] mb-1">{t.name}</p>
              <h3 className="text-2xl sm:text-3xl text-[#1c1917] leading-tight"
                  style={{fontFamily:'var(--font-serif)', fontWeight:700}}>{t.rank}</h3>
              <p className="text-sm text-[#78716c] mt-1">{t.division}</p>
            </div>
          </div>
          <Rule />
          <div className="mt-4 flex items-center justify-between flex-wrap gap-2">
            <p className="text-sm text-[#78716c]">
              {t.team} — <span className="font-semibold text-[#1c1917]">{t.teamName}</span>
            </p>
            <span className="text-[11px] font-medium tracking-widest uppercase px-2 py-0.5 border border-[#d4a017] text-[#d4a017]">
              {t.champion}
            </span>
          </div>
        </div>
      </div>
      <div className="border border-dashed border-[#d6cfc4] p-7 text-center">
        <p className="text-sm text-[#c4bdb5] italic">{t.placeholder}</p>
      </div>
    </div>
  )
}

/* ── Experiments ────────────────────────────────────────────── */
function ExperimentsTab({ lang }) {
  const t = T[lang].experiments
  return (
    <div className="animate-tab space-y-6">
      <div className="bg-white border border-[#d6cfc4] overflow-hidden">
        <div className="bg-black p-3 sm:p-4">
          <video className="w-full block" style={{ maxHeight: '460px', objectFit: 'contain' }}
            src={`${import.meta.env.BASE_URL}clinostat.mp4`}
            autoPlay loop muted playsInline />
        </div>
        <div className="p-6 sm:p-8">
          <div className="flex items-start gap-3 mb-4 flex-wrap">
            <h3 className="text-xl text-[#1c1917]" style={{fontFamily:'var(--font-serif)'}}>{t.title}</h3>
            <Tag>{t.tag}</Tag>
          </div>
          <Rule />
          <div className="mt-5 space-y-3 text-[15px] leading-[1.8] text-[#44403c]">
            {t.body.map((para, i) => <p key={i}>{para}</p>)}
          </div>
        </div>
      </div>
      <div className="border border-dashed border-[#d6cfc4] p-7 text-center">
        <p className="text-sm text-[#c4bdb5] italic">{t.placeholder}</p>
      </div>
    </div>
  )
}

/* ── Root ───────────────────────────────────────────────────── */
export default function App() {
  const [lang, setLang] = useState('en')
  const [activeTab, setActiveTab] = useState(0)
  const [animKey, setAnimKey] = useState(0)
  const t = T[lang]

  const handleTabChange = (i) => {
    if (i === activeTab) return
    setActiveTab(i)
    setAnimKey((k) => k + 1)
  }

  const toggleLang = () => {
    setLang(l => l === 'en' ? 'zh' : 'en')
    setAnimKey(k => k + 1)
  }

  const emailHref = `mailto:aaathomas920411@gmail.com?subject=${encodeURIComponent(t.emailSubject)}&body=${encodeURIComponent(t.emailBody)}`

  return (
    <div className="min-h-screen bg-[#f7f3ed]" style={{fontFamily:'var(--font-sans)'}}>
      <div className="max-w-[820px] mx-auto border-x border-[#d6cfc4] min-h-screen flex flex-col bg-[#f7f3ed]">

        {/* ── Hero ── */}
        <header className="animate-hero relative px-4 pt-10 pb-8 border-b border-[#d6cfc4] sm:px-10 sm:pt-14 sm:pb-10">

          {/* Language toggle — top right */}
          <button onClick={toggleLang}
            className="absolute top-4 right-4 text-[11px] font-medium tracking-widest uppercase
                       px-3 py-1.5 border border-[#d6cfc4] text-[#78716c]
                       hover:border-[#9a3412] hover:text-[#9a3412] transition-colors duration-200
                       sm:top-6 sm:right-8">
            {lang === 'en' ? '中文' : 'EN'}
          </button>

          <div className="flex flex-col items-center text-center gap-5 sm:flex-row sm:items-center sm:text-left sm:gap-8">
            <img src={profilePhoto} alt="Thomas Chang"
              className="w-20 h-20 rounded-full object-cover object-top flex-shrink-0
                         border-2 border-[#d6cfc4] sm:w-24 sm:h-24" />
            <div className="flex-1 min-w-0">
              <h1 className="text-[30px] leading-tight text-[#1c1917] mb-1 sm:text-[36px]"
                  style={{fontFamily:'var(--font-serif)', fontWeight:600}}>
                Thomas Chang
                <span className="block text-[18px] font-normal italic text-[#78716c] sm:text-[22px]">張祐瑋</span>
              </h1>
              <p className="text-[10px] tracking-[0.2em] uppercase text-[#78716c] mt-2 mb-3 sm:text-[11px] sm:mt-3 sm:mb-4">
                {t.hero.subtitle}
              </p>
              <p className="text-xs text-[#a8a29e] mb-4 sm:mb-5">{t.hero.institution}</p>
              <div className="flex gap-2 flex-wrap justify-center sm:justify-start items-center">
                <a href="https://github.com/Thomas-Zhang-You-Wei" target="_blank" rel="noreferrer"
                   className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium tracking-wide
                              border border-[#1c1917] text-[#1c1917] hover:bg-[#1c1917] hover:text-white transition-colors duration-200">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
                  </svg>
                  GitHub
                </a>
                <a href="https://www.linkedin.com/in/yuwei-thomas/" target="_blank" rel="noreferrer"
                   className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium tracking-wide
                              border border-[#9a3412] text-[#9a3412] hover:bg-[#9a3412] hover:text-white transition-colors duration-200">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                  LinkedIn
                </a>
                <a href={emailHref}
                   className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium tracking-wide
                              border border-[#78716c] text-[#78716c] hover:bg-[#78716c] hover:text-white transition-colors duration-200">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="20" height="16" x="2" y="4" rx="2"/>
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                  </svg>
                  Email
                </a>
              </div>
            </div>
          </div>
        </header>

        {/* ── Tab Nav ── */}
        <nav className="sticky top-0 z-10 border-b border-[#d6cfc4] bg-[#f7f3ed]/90 backdrop-blur-sm px-2 sm:px-10 overflow-x-auto">
          <div className="flex min-w-max">
            {t.tabs.map((tab, i) => (
              <button key={tab} onClick={() => handleTabChange(i)}
                className={`relative px-3 py-4 text-[11px] font-medium tracking-[0.12em] uppercase
                            transition-colors duration-150 cursor-pointer whitespace-nowrap
                            sm:px-4 sm:text-xs sm:tracking-[0.15em]
                            ${activeTab === i ? 'text-[#1c1917]' : 'text-[#a8a29e] hover:text-[#78716c]'}`}>
                {tab}
                {activeTab === i && <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#9a3412]" />}
              </button>
            ))}
          </div>
        </nav>

        {/* ── Content ── */}
        <main className="flex-1 px-4 py-8 sm:px-10 sm:py-10" key={animKey}>
          {activeTab === 0 && <AboutTab lang={lang} />}
          {activeTab === 1 && <ProjectsTab lang={lang} />}
          {activeTab === 2 && <AchievementsTab lang={lang} />}
          {activeTab === 3 && <ExperimentsTab lang={lang} />}
        </main>

        {/* ── Footer ── */}
        <footer className="px-4 py-6 border-t border-[#d6cfc4] text-center sm:px-10">
          <p className="text-xs text-[#a8a29e] italic" style={{fontFamily:'var(--font-serif)'}}>{t.footer}</p>
        </footer>

      </div>
    </div>
  )
}
