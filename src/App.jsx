import { useState } from 'react'
import {
  Cpu, FlaskConical, Network, Users,
  Trophy, Satellite, Microscope, Rocket, Bot, FolderOpen,
} from 'lucide-react'

const GithubIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
  </svg>
)

const LinkedinIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
)
import profilePhoto from './assets/profile.png'

const TABS = ['About', 'Projects', 'Achievements', 'Experiments']

const skills = [
  { icon: Cpu,          label: 'Raspberry Pi Development',        desc: 'Embedded systems, IoT & hardware prototyping' },
  { icon: FlaskConical, label: 'Aseptic Microbial Transfer',      desc: 'Sterile lab techniques & cultivation protocols' },
  { icon: Network,      label: 'Remote Network Configuration',    desc: 'Infrastructure setup & management' },
  { icon: Users,        label: 'Business Development',            desc: 'Strategic partnerships & collaborative innovation' },
]

const interests = [
  { icon: Satellite,   label: 'Satellite Communication Systems' },
  { icon: Microscope,  label: 'Bio-manufacturing Automation' },
  { icon: Rocket,      label: 'Space Materials Research' },
  { icon: Bot,         label: 'AI-driven Scientific Applications' },
]

const projects = [
  { title: 'Satellite Rachless Handover',       tag: 'Research',     desc: 'Simulating seamless satellite handover using the OpenAirInterface (OAI) platform.' },
  { title: 'Pioreactor Plugin Development',     tag: 'Engineering',  desc: 'Optimizing yeast cultivation for astaxanthin production via automated bioreactor modules.' },
  { title: 'Space Enzyme–Protein Scaffold',     tag: 'BizDev',       desc: 'Business development for PET biodegradation in space using enzyme-protein scaffolding.' },
]

/* ── Tab: About ────────────────────────────────── */
function AboutTab() {
  return (
    <div className="space-y-10 animate-tab">
      {/* Bio */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 space-y-4 text-[15px] leading-relaxed text-zinc-400">
        <p>
          I am a first-year master's student at the Department of Electrical Engineering,
          National Taiwan University. My current research focuses on{' '}
          <span className="text-zinc-200 font-medium">satellite rachless handover</span>,
          simulated using the{' '}
          <span className="text-zinc-200 font-medium">OpenAirInterface (OAI)</span> platform.
        </p>
        <p>
          I am also interning at{' '}
          <span className="text-zinc-200 font-medium">TWBIO</span> where I configure the
          Pioreactor system and develop plug-in modules to optimize yeast cultivation for
          maximum astaxanthin yield and economic efficiency.
        </p>
        <p>
          Additionally, I am engaged in the{' '}
          <span className="text-zinc-200 font-medium">
            business development of space enzyme–protein scaffolding
          </span>
          , aiming to biodegrade PET in space environments to produce materials for 3D printing.
        </p>
      </div>

      {/* Skills */}
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-widest text-zinc-600 mb-4">
          Skills
        </h3>
        <div className="grid grid-cols-2 gap-3 stagger sm:grid-cols-1">
          {skills.map(({ icon: Icon, label, desc }) => (
            <div
              key={label}
              className="animate-fade-up group bg-zinc-900 border border-zinc-800 rounded-xl p-5
                         hover:border-indigo-500/50 hover:bg-zinc-800/60 transition-all duration-300 hover:-translate-y-0.5"
            >
              <div className="flex items-start gap-4">
                <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 group-hover:bg-indigo-500/20 transition-colors flex-shrink-0">
                  <Icon size={18} />
                </div>
                <div>
                  <p className="text-sm font-medium text-zinc-200">{label}</p>
                  <p className="text-xs text-zinc-500 mt-0.5">{desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Interests */}
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-widest text-zinc-600 mb-4">
          Interests
        </h3>
        <div className="grid grid-cols-4 gap-3 stagger sm:grid-cols-2">
          {interests.map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="animate-fade-up group bg-zinc-900 border border-zinc-800 rounded-xl p-5
                         text-center hover:border-indigo-500/50 hover:bg-zinc-800/60 transition-all duration-300 hover:-translate-y-1"
            >
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center
                              mx-auto mb-3 text-indigo-400 group-hover:bg-indigo-500/20 transition-colors">
                <Icon size={20} />
              </div>
              <p className="text-xs text-zinc-400 leading-snug">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ── Tab: Projects ─────────────────────────────── */
function ProjectsTab() {
  return (
    <div className="space-y-4 animate-tab">
      {projects.map((p) => (
        <div
          key={p.title}
          className="group bg-zinc-900 border border-zinc-800 rounded-2xl p-6
                     hover:border-indigo-500/40 hover:bg-zinc-800/40 transition-all duration-300"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="mb-2">
                <span className="text-xs px-2.5 py-1 rounded-full bg-indigo-500/10
                                  text-indigo-400 border border-indigo-500/20">
                  {p.tag}
                </span>
              </div>
              <h3 className="text-base font-semibold text-zinc-200 mb-1">{p.title}</h3>
              <p className="text-sm text-zinc-500">{p.desc}</p>
            </div>
            <FolderOpen
              size={20}
              className="text-zinc-700 group-hover:text-indigo-400 transition-colors flex-shrink-0 mt-1"
            />
          </div>
          <div className="mt-4 pt-4 border-t border-zinc-800/80">
            <span className="text-xs text-zinc-700 italic">Details coming soon…</span>
          </div>
        </div>
      ))}
    </div>
  )
}

/* ── Tab: Achievements ─────────────────────────── */
function AchievementsTab() {
  return (
    <div className="space-y-4 animate-tab">
      {/* RunSpace */}
      <div className="relative overflow-hidden bg-gradient-to-br from-amber-500/10 to-orange-500/5
                      border border-amber-500/25 rounded-2xl p-8">
        <Trophy size={100} className="absolute -right-4 -bottom-4 text-amber-500/8 rotate-12" />
        <div className="flex items-center gap-6 sm:flex-col sm:text-center">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/15 border border-amber-500/30
                          flex items-center justify-center flex-shrink-0">
            <Trophy size={30} className="text-amber-400" />
          </div>
          <div>
            <div className="text-xs font-bold uppercase tracking-widest text-amber-500 mb-1">
              1st Place
            </div>
            <h3 className="text-xl font-bold text-zinc-100 mb-1">RunSpace Competition 2025</h3>
            <p className="text-sm text-zinc-400">Implementation &amp; Enterprise Innovation Division</p>
            <p className="text-sm text-zinc-500 mt-1">
              Team: <span className="text-amber-400 font-medium">Asta-sense</span>
            </p>
          </div>
        </div>
      </div>

      {/* Placeholder */}
      <div className="bg-zinc-900 border border-zinc-800 border-dashed rounded-2xl p-8 text-center">
        <p className="text-sm text-zinc-700 italic">More achievements coming soon…</p>
      </div>
    </div>
  )
}

/* ── Tab: Experiments ──────────────────────────── */
function ExperimentsTab() {
  return (
    <div className="space-y-6 animate-tab">
      {/* Clinostat */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
        <video
          className="w-full aspect-video object-cover"
          src={`${import.meta.env.BASE_URL}clinostat.mp4`}
          autoPlay
          loop
          muted
          playsInline
        />
        <div className="p-8">
          <div className="mb-3">
            <span className="text-xs px-2.5 py-1 rounded-full bg-indigo-500/10
                              text-indigo-400 border border-indigo-500/20">
              Microgravity Simulation
            </span>
          </div>
          <h3 className="text-xl font-bold text-zinc-100 mb-4">Dual-Axis Clinostat</h3>
          <div className="space-y-3 text-[15px] leading-relaxed text-zinc-400">
            <p>
              A <span className="text-zinc-200 font-medium">dual-axis clinostat</span> (3D clinostat)
              is a microgravity simulation device that rotates biological samples simultaneously
              around two perpendicular axes. By continuously randomizing the gravitational vector
              orientation relative to the specimen, it produces a time-averaged zero-gravity
              environment — allowing researchers to study microgravity effects on living organisms
              without leaving Earth.
            </p>
            <p>
              This technology is widely applied in space biology, plant gravitropism research,
              single-cell morphology studies, and the development of biotechnology pipelines
              designed for future space missions. The dual-axis configuration provides significantly
              more isotropic compensation than a single-axis design, making it the preferred
              platform for long-duration biological experiments.
            </p>
          </div>
        </div>
      </div>

      {/* Placeholder */}
      <div className="bg-zinc-900 border border-zinc-800 border-dashed rounded-2xl p-8 text-center">
        <p className="text-sm text-zinc-700 italic">More experiments coming soon…</p>
      </div>
    </div>
  )
}

/* ── Root ──────────────────────────────────────── */
export default function App() {
  const [activeTab, setActiveTab] = useState('About')
  const [animKey, setAnimKey] = useState(0)

  const handleTabChange = (tab) => {
    if (tab === activeTab) return
    setActiveTab(tab)
    setAnimKey((k) => k + 1)
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans">
      <div className="max-w-[860px] mx-auto">

        {/* ── Hero ── */}
        <header className="px-6 pt-16 pb-12 text-center animate-hero">
          {/* Avatar */}
          <div className="relative inline-block mb-6">
            <img
              src={profilePhoto}
              alt="Thomas Chang"
              className="w-28 h-28 rounded-full object-cover object-top
                         ring-2 ring-zinc-700 ring-offset-4 ring-offset-zinc-950"
            />
            <span className="absolute inset-0 rounded-full animate-pulse-ring pointer-events-none" />
          </div>

          {/* Name */}
          <h1 className="text-4xl font-bold tracking-tight mb-2">
            <span className="bg-gradient-to-r from-white via-zinc-200 to-indigo-300
                             bg-clip-text text-transparent">
              Thomas Chang 張祐瑋
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-xs tracking-widest text-zinc-500 uppercase mb-2">
            Master's Student · Researcher · Innovator
          </p>
          <p className="text-sm text-zinc-600 mb-8">
            Dept. of Electrical Engineering, National Taiwan University
          </p>

          {/* Buttons */}
          <div className="flex gap-3 justify-center flex-wrap">
            <a
              href="https://github.com/Thomas-Zhang-You-Wei"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg
                         bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 hover:border-zinc-600
                         text-sm font-medium transition-all duration-200 hover:-translate-y-0.5"
            >
              <GithubIcon />
              GitHub
            </a>
            <a
              href="https://www.linkedin.com/in/yuwei-thomas/"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg
                         bg-indigo-600 hover:bg-indigo-500
                         text-sm font-medium transition-all duration-200 hover:-translate-y-0.5"
            >
              <LinkedinIcon />
              LinkedIn
            </a>
          </div>
        </header>

        {/* ── Tab Nav ── */}
        <div className="sticky top-0 z-10 bg-zinc-950/80 backdrop-blur-md border-y border-zinc-800 px-6">
          <div className="flex">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => handleTabChange(tab)}
                className={`relative px-5 py-4 text-sm font-medium transition-colors duration-200 cursor-pointer
                  ${activeTab === tab ? 'text-zinc-100' : 'text-zinc-500 hover:text-zinc-300'}`}
              >
                {tab}
                {activeTab === tab && (
                  <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-indigo-500 rounded-full" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* ── Content ── */}
        <main className="px-6 py-10" key={animKey}>
          {activeTab === 'About'        && <AboutTab />}
          {activeTab === 'Projects'     && <ProjectsTab />}
          {activeTab === 'Achievements' && <AchievementsTab />}
          {activeTab === 'Experiments'  && <ExperimentsTab />}
        </main>

        {/* ── Footer ── */}
        <footer className="px-6 py-6 text-center text-xs text-zinc-700 border-t border-zinc-900">
          © 2025 Thomas Chang 張祐瑋 · Built with React + Vite · Deployed on GitHub Pages
        </footer>

      </div>
    </div>
  )
}
