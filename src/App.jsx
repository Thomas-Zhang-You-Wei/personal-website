function App() {
  return (
    <div className="max-w-[1126px] mx-auto border-x border-zinc-200 min-h-screen flex flex-col bg-white">

      {/* Hero */}
      <header className="border-b border-zinc-200 px-6 py-16 text-center">
        <div className="max-w-xl mx-auto">
          <div className="w-20 h-20 rounded-full bg-zinc-900 flex items-center justify-center text-white text-2xl font-bold mx-auto mb-6 ring-4 ring-zinc-100">
            TZ
          </div>
          <h1 className="text-5xl font-bold tracking-tight text-zinc-900 mb-3 sm:text-4xl">
            張祐瑋 <span className="text-amber-600">Thomas</span>
          </h1>
          <p className="text-sm tracking-widest text-zinc-400 uppercase mb-2">
            Master's Student · Researcher · Innovator
          </p>
          <p className="text-sm text-zinc-400 mb-8">
            Department of Electrical Engineering, National Taiwan University
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <a
              href="https://github.com/Thomas-Zhang-You-Wei"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md text-sm font-medium border border-zinc-900 text-zinc-900 hover:bg-zinc-900 hover:text-white transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
              </svg>
              GitHub
            </a>
            <a
              href="https://www.linkedin.com/in/yuwei-thomas/"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md text-sm font-medium bg-zinc-900 text-white hover:bg-zinc-700 transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
              LinkedIn
            </a>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-6 pb-16">

        {/* About Me */}
        <section className="mt-14">
          <h2 className="text-xl font-semibold text-zinc-900 mb-5 pb-3 border-b border-zinc-200">
            About Me
          </h2>
          <div className="bg-white border border-zinc-200 rounded-xl px-8 py-7 flex flex-col gap-4 text-[15px] leading-relaxed text-zinc-600 text-left">
            <p>
              I am a first-year master's student at the Department of Electrical Engineering,
              National Taiwan University. My current research focuses on{' '}
              <strong className="font-semibold text-zinc-800">satellite rachless handover</strong>,
              simulated using the{' '}
              <strong className="font-semibold text-zinc-800">OpenAirInterface (OAI)</strong> platform.
            </p>
            <p>
              I am also interning at{' '}
              <strong className="font-semibold text-zinc-800">TWBIO</strong> where I configure the
              Pioreactor system and develop plug-in modules to optimize yeast cultivation for maximum
              astaxanthin yield and economic efficiency.
            </p>
            <p>
              Additionally, I am engaged in the{' '}
              <strong className="font-semibold text-zinc-800">
                business development of space enzyme–protein scaffolding
              </strong>
              , aiming to biodegrade PET in space environments to produce materials for 3D printing.
            </p>
          </div>
        </section>

        {/* Skills */}
        <section className="mt-14">
          <h2 className="text-xl font-semibold text-zinc-900 mb-5 pb-3 border-b border-zinc-200">
            Skills
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-1">
            {[
              { icon: '🔧', label: 'Raspberry Pi Development' },
              { icon: '🧫', label: 'Aseptic Microbial Transfer Techniques' },
              { icon: '🌐', label: 'Remote Network Configuration & Management' },
              { icon: '🤝', label: 'Business Collaboration & Partnership Development' },
            ].map((skill) => (
              <div
                key={skill.label}
                className="flex items-center gap-3 bg-white border border-zinc-200 rounded-lg px-5 py-4 text-[15px] text-zinc-700 text-left hover:-translate-y-0.5 hover:border-zinc-300 transition-transform"
              >
                <span className="text-2xl flex-shrink-0">{skill.icon}</span>
                <span>{skill.label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Achievements */}
        <section className="mt-14">
          <h2 className="text-xl font-semibold text-zinc-900 mb-5 pb-3 border-b border-zinc-200">
            Achievements
          </h2>
          <div className="bg-white border border-zinc-200 rounded-xl px-8 py-7 flex items-center gap-6 text-left [border-left-width:4px] [border-left-color:theme(colors.amber.500)] sm:flex-col sm:text-center">
            <div className="text-5xl flex-shrink-0">🏆</div>
            <div>
              <div className="text-xs font-bold uppercase tracking-widest text-amber-600 mb-1">
                1st Place
              </div>
              <div className="text-lg font-semibold text-zinc-900 mb-1">
                RunSpace Competition 2025
              </div>
              <div className="text-sm text-zinc-400 mb-2">
                Implementation &amp; Enterprise Innovation Division
              </div>
              <div className="text-sm text-zinc-500">
                Team: <span className="font-medium text-amber-600">Asta-sense</span>
              </div>
            </div>
          </div>
        </section>

        {/* Interests */}
        <section className="mt-14">
          <h2 className="text-xl font-semibold text-zinc-900 mb-5 pb-3 border-b border-zinc-200">
            Interests
          </h2>
          <div className="grid grid-cols-4 gap-3 sm:grid-cols-2">
            {[
              { icon: '🛰️', label: 'Satellite Communication Systems' },
              { icon: '🧬', label: 'Bio-manufacturing Automation' },
              { icon: '🚀', label: 'Space Materials Research' },
              { icon: '🤖', label: 'AI-driven Scientific Applications' },
            ].map((item) => (
              <div
                key={item.label}
                className="bg-white border border-zinc-200 rounded-xl px-4 py-6 text-center hover:-translate-y-0.5 hover:border-zinc-300 transition-transform"
              >
                <div className="text-3xl mb-3">{item.icon}</div>
                <p className="text-xs leading-snug text-zinc-500">{item.label}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="text-center px-6 py-6 text-xs text-zinc-400 border-t border-zinc-200">
        © 2025 張祐瑋 Thomas · Built with React + Vite · Deployed on GitHub Pages
      </footer>
    </div>
  )
}

export default App
