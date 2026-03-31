import { useState } from 'react'
import { Circuitry, Flask, Network, Handshake, Trophy, Broadcast, Dna, Rocket, Robot, FolderOpen } from '@phosphor-icons/react'
import profilePhoto from './assets/profile.png'
import runspaceImg from './assets/runspace.jpg'

const TABS = ['About', 'Projects', 'Achievements', 'Experiments']

const skills = [
  { icon: Circuitry, label: 'Raspberry Pi Development',     desc: 'Embedded systems, IoT & hardware prototyping' },
  { icon: Flask,     label: 'Aseptic Microbial Transfer',   desc: 'Sterile lab techniques & cultivation protocols' },
  { icon: Network,   label: 'Remote Network Configuration', desc: 'Infrastructure setup & management' },
  { icon: Handshake, label: 'Business Development',         desc: 'Strategic partnerships & collaborative innovation' },
]

const interests = [
  { icon: Broadcast, label: 'Satellite Communication' },
  { icon: Dna,       label: 'Bio-manufacturing' },
  { icon: Rocket,    label: 'Space Materials' },
  { icon: Robot,     label: 'AI-driven Science' },
]

const projects = [
  { title: 'Satellite Rachless Handover',   tag: 'Research',    desc: 'Simulating seamless satellite handover using the OpenAirInterface (OAI) platform.' },
  { title: 'Pioreactor Plugin Development', tag: 'Engineering', desc: 'Optimizing yeast cultivation for astaxanthin production via automated bioreactor modules.' },
  { title: 'Space Enzyme–Protein Scaffold', tag: 'BizDev',      desc: 'Business development for PET biodegradation in space using enzyme-protein scaffolding.' },
]

const Rule = () => (
  <div style={{ height: '1px', background: '#d6cfc4' }} />
)

const Tag = ({ children }) => (
  <span className="text-[11px] font-medium tracking-widest uppercase px-2 py-0.5 border border-[#d6cfc4] text-[#78716c] whitespace-nowrap">
    {children}
  </span>
)

/* ── About ──────────────────────────────────── */
function AboutTab() {
  return (
    <div className="animate-tab space-y-10">
      <div className="border border-[#d6cfc4] bg-white p-6 sm:p-8 space-y-4 text-[15px] leading-[1.8] text-[#44403c]">
        <p>
          I am a first-year master's student at the Department of Electrical Engineering,
          National Taiwan University. My current research focuses on{' '}
          <em className="not-italic font-medium text-[#1c1917]">satellite rachless handover</em>,
          simulated using the <em className="not-italic font-medium text-[#1c1917]">OpenAirInterface (OAI)</em> platform.
        </p>
        <p>
          I am also interning at <em className="not-italic font-medium text-[#1c1917]">TWBIO</em> where I
          configure the Pioreactor system and develop plug-in modules to optimize yeast cultivation
          for maximum astaxanthin yield and economic efficiency.
        </p>
        <p>
          Additionally, I am engaged in the{' '}
          <em className="not-italic font-medium text-[#1c1917]">business development of space enzyme–protein scaffolding</em>,
          aiming to biodegrade PET in space environments to produce materials for 3D printing.
        </p>
      </div>

      <div>
        <p className="text-[11px] font-medium tracking-[0.2em] uppercase text-[#78716c] mb-4">Skills</p>
        <div className="grid grid-cols-1 gap-px bg-[#d6cfc4] border border-[#d6cfc4] stagger sm:grid-cols-2">
          {skills.map(({ icon: Icon, label, desc }) => (
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
          ))}
        </div>
      </div>

      <div>
        <p className="text-[11px] font-medium tracking-[0.2em] uppercase text-[#78716c] mb-4">Interests</p>
        <div className="grid grid-cols-2 gap-px bg-[#d6cfc4] border border-[#d6cfc4] stagger sm:grid-cols-4">
          {interests.map(({ icon: Icon, label }) => (
            <div key={label}
              className="animate-fade-up bg-white p-5 text-center
                         hover:bg-[#faf8f4] transition-colors duration-200 group">
              <div className="w-10 h-10 border border-[#d6cfc4] flex items-center justify-center
                              text-[#9a3412] mx-auto mb-3 group-hover:border-[#9a3412] transition-colors">
                <Icon size={22} weight="duotone" />
              </div>
              <p className="text-xs text-[#78716c] leading-snug">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ── Projects ───────────────────────────────── */
function ProjectsTab() {
  return (
    <div className="animate-tab border border-[#d6cfc4] divide-y divide-[#d6cfc4]">
      {projects.map((p, i) => (
        <div key={p.title} className="bg-white p-5 sm:p-7 flex items-start gap-4 sm:gap-6 hover:bg-[#faf8f4] transition-colors group">
          <span className="text-xs text-[#a8a29e] font-mono pt-0.5 flex-shrink-0 w-5">
            {String(i + 1).padStart(2, '0')}
          </span>
          <div className="flex-1 min-w-0">
            <div className="flex items-start gap-2 mb-2 flex-wrap">
              <h3 className="text-[15px] font-semibold text-[#1c1917]" style={{fontFamily:'var(--font-serif)'}}>{p.title}</h3>
              <Tag>{p.tag}</Tag>
            </div>
            <p className="text-sm text-[#78716c] leading-relaxed">{p.desc}</p>
            <p className="text-xs text-[#c4bdb5] italic mt-3">Details coming soon…</p>
          </div>
          <FolderOpen size={18} weight="duotone" className="text-[#c4bdb5] group-hover:text-[#9a3412] transition-colors flex-shrink-0 mt-1" />
        </div>
      ))}
    </div>
  )
}

/* ── Achievements ───────────────────────────── */
function AchievementsTab() {
  return (
    <div className="animate-tab space-y-4">
      <div className="bg-white border border-[#d6cfc4] overflow-hidden">

        {/* Photo banner */}
        <div className="relative">
          <img
            src={runspaceImg}
            alt="RunSpace Competition 2025"
            className="w-full object-cover"
            style={{ maxHeight: '280px', objectPosition: 'center' }}
          />
          {/* Gold overlay badge */}
          <div className="absolute top-4 left-4 bg-[#1c1917]/80 backdrop-blur-sm px-3 py-1.5 flex items-center gap-2">
            <Trophy size={14} weight="fill" className="text-[#d4a017]" />
            <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-[#d4a017]">1st Place</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-8">
          {/* Big trophy + title row */}
          <div className="flex items-start gap-5 mb-5">
            <div className="flex-shrink-0 relative">
              {/* Glow ring */}
              <div className="absolute inset-0 rounded-none opacity-30"
                   style={{ boxShadow: '0 0 20px 4px #d4a017' }} />
              <div className="w-16 h-16 sm:w-20 sm:h-20 border-2 border-[#d4a017] flex items-center justify-center bg-[#fdf8f0] relative">
                <Trophy size={32} weight="duotone" className="text-[#d4a017] sm:hidden" />
                <Trophy size={40} weight="duotone" className="text-[#d4a017] hidden sm:block" />
              </div>
            </div>
            <div>
              <p className="text-[10px] font-bold tracking-[0.25em] uppercase text-[#9a3412] mb-1">
                RunSpace Competition 2025
              </p>
              <h3 className="text-2xl sm:text-3xl text-[#1c1917] leading-tight"
                  style={{fontFamily:'var(--font-serif)', fontWeight:700}}>
                1st Place
              </h3>
              <p className="text-sm text-[#78716c] mt-1">
                Implementation &amp; Enterprise Innovation Division
              </p>
            </div>
          </div>

          <Rule />

          <div className="mt-4 flex items-center justify-between flex-wrap gap-2">
            <p className="text-sm text-[#78716c]">
              Team — <span className="font-semibold text-[#1c1917]">Asta-sense</span>
            </p>
            <span className="text-[11px] font-medium tracking-widest uppercase px-2 py-0.5
                             border border-[#d4a017] text-[#d4a017]">
              Champion
            </span>
          </div>
        </div>
      </div>

      <div className="border border-dashed border-[#d6cfc4] p-7 text-center">
        <p className="text-sm text-[#c4bdb5] italic">More achievements coming soon…</p>
      </div>
    </div>
  )
}

/* ── Experiments ────────────────────────────── */
function ExperimentsTab() {
  return (
    <div className="animate-tab space-y-6">
      <div className="bg-white border border-[#d6cfc4] overflow-hidden">
        <div className="bg-black p-3 sm:p-4">
          <video
            className="w-full block"
            style={{ maxHeight: '460px', objectFit: 'contain' }}
            src={`${import.meta.env.BASE_URL}clinostat.mp4`}
            autoPlay loop muted playsInline
          />
        </div>
        <div className="p-6 sm:p-8">
          <div className="flex items-start gap-3 mb-4 flex-wrap">
            <h3 className="text-xl text-[#1c1917]" style={{fontFamily:'var(--font-serif)'}}>Dual-Axis Clinostat</h3>
            <Tag>Microgravity Simulation</Tag>
          </div>
          <Rule />
          <div className="mt-5 space-y-3 text-[15px] leading-[1.8] text-[#44403c]">
            <p>
              A <em className="not-italic font-medium text-[#1c1917]">dual-axis clinostat</em> (3D clinostat)
              is a microgravity simulation device that rotates biological samples simultaneously
              around two perpendicular axes. By continuously randomizing the gravitational vector
              orientation, it produces a time-averaged zero-gravity environment — enabling
              researchers to study microgravity effects on living organisms without leaving Earth.
            </p>
            <p>
              This technology is applied in space biology, plant gravitropism research,
              single-cell morphology studies, and the development of biotechnology pipelines
              for future space missions. The dual-axis configuration provides significantly
              more isotropic compensation than a single-axis design.
            </p>
          </div>
        </div>
      </div>
      <div className="border border-dashed border-[#d6cfc4] p-7 text-center">
        <p className="text-sm text-[#c4bdb5] italic">More experiments coming soon…</p>
      </div>
    </div>
  )
}

/* ── Root ───────────────────────────────────── */
export default function App() {
  const [activeTab, setActiveTab] = useState('About')
  const [animKey, setAnimKey] = useState(0)

  const handleTabChange = (tab) => {
    if (tab === activeTab) return
    setActiveTab(tab)
    setAnimKey((k) => k + 1)
  }

  return (
    <div className="min-h-screen bg-[#f7f3ed]" style={{fontFamily:'var(--font-sans)'}}>
      <div className="max-w-[820px] mx-auto border-x border-[#d6cfc4] min-h-screen flex flex-col bg-[#f7f3ed]">

        {/* ── Hero ── */}
        <header className="animate-hero px-4 pt-10 pb-8 border-b border-[#d6cfc4] sm:px-10 sm:pt-14 sm:pb-10">
          <div className="flex flex-col items-center text-center gap-5 sm:flex-row sm:items-center sm:text-left sm:gap-8">
            <img
              src={profilePhoto}
              alt="Thomas Chang"
              className="w-20 h-20 rounded-full object-cover object-top flex-shrink-0
                         border-2 border-[#d6cfc4] sm:w-24 sm:h-24"
            />
            <div className="flex-1 min-w-0">
              <h1 className="text-[30px] leading-tight text-[#1c1917] mb-1 sm:text-[36px]"
                  style={{fontFamily:'var(--font-serif)', fontWeight:600}}>
                Thomas Chang
                <span className="block text-[18px] font-normal italic text-[#78716c] sm:text-[22px]">張祐瑋</span>
              </h1>
              <p className="text-[10px] tracking-[0.2em] uppercase text-[#78716c] mt-2 mb-3 sm:text-[11px] sm:mt-3 sm:mb-4">
                Master's Student · Researcher · Innovator
              </p>
              <p className="text-xs text-[#a8a29e] mb-4 sm:mb-5">
                Dept. of Electrical Engineering, National Taiwan University
              </p>
              <div className="flex gap-2 flex-wrap justify-center sm:justify-start">
                <a href="https://github.com/Thomas-Zhang-You-Wei" target="_blank" rel="noreferrer"
                   className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium tracking-wide
                              border border-[#1c1917] text-[#1c1917] hover:bg-[#1c1917] hover:text-white
                              transition-colors duration-200">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
                  </svg>
                  GitHub
                </a>
                <a href="https://www.linkedin.com/in/yuwei-thomas/" target="_blank" rel="noreferrer"
                   className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium tracking-wide
                              border border-[#9a3412] text-[#9a3412] hover:bg-[#9a3412] hover:text-white
                              transition-colors duration-200">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                  LinkedIn
                </a>
              </div>
            </div>
          </div>
        </header>

        {/* ── Tab Nav ── */}
        <nav className="sticky top-0 z-10 border-b border-[#d6cfc4] bg-[#f7f3ed]/90 backdrop-blur-sm px-2 sm:px-10 overflow-x-auto">
          <div className="flex min-w-max">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => handleTabChange(tab)}
                className={`relative px-3 py-4 text-[11px] font-medium tracking-[0.12em] uppercase
                            transition-colors duration-150 cursor-pointer whitespace-nowrap
                            sm:px-4 sm:text-xs sm:tracking-[0.15em]
                            ${activeTab === tab ? 'text-[#1c1917]' : 'text-[#a8a29e] hover:text-[#78716c]'}`}
              >
                {tab}
                {activeTab === tab && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#9a3412]" />
                )}
              </button>
            ))}
          </div>
        </nav>

        {/* ── Content ── */}
        <main className="flex-1 px-4 py-8 sm:px-10 sm:py-10" key={animKey}>
          {activeTab === 'About'        && <AboutTab />}
          {activeTab === 'Projects'     && <ProjectsTab />}
          {activeTab === 'Achievements' && <AchievementsTab />}
          {activeTab === 'Experiments'  && <ExperimentsTab />}
        </main>

        {/* ── Footer ── */}
        <footer className="px-4 py-6 border-t border-[#d6cfc4] text-center sm:px-10">
          <p className="text-xs text-[#a8a29e] italic" style={{fontFamily:'var(--font-serif)'}}>
            "Fake it, until you make it."
          </p>
        </footer>

      </div>
    </div>
  )
}
