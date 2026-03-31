import './App.css'

function App() {
  return (
    <div className="page">
      {/* Hero Section */}
      <header className="hero">
        <div className="hero-inner">
          <div className="avatar">TZ</div>
          <h1>張祐瑋 <span className="accent">Thomas</span></h1>
          <p className="subtitle">Master's Student · Researcher · Innovator</p>
          <p className="institution">
            Department of Electrical Engineering, National Taiwan University
          </p>
          <div className="hero-links">
            <a
              href="https://github.com/Thomas-Zhang-You-Wei"
              target="_blank"
              rel="noreferrer"
              className="btn btn-outline"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
              </svg>
              GitHub
            </a>
            <a
              href="https://www.linkedin.com/in/yuwei-thomas/"
              target="_blank"
              rel="noreferrer"
              className="btn btn-primary"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
              LinkedIn
            </a>
          </div>
        </div>
      </header>

      <main className="main">
        {/* About */}
        <section className="section">
          <h2 className="section-title">About Me</h2>
          <div className="card">
            <p>
              I am a first-year master's student at the Department of Electrical Engineering,
              National Taiwan University. My current research focuses on{' '}
              <strong>satellite rachless handover</strong>, simulated using the{' '}
              <strong>OpenAirInterface (OAI)</strong> platform.
            </p>
            <p>
              I am also interning at <strong>TWBIO</strong> where I configure the Pioreactor
              system and develop plug-in modules to optimize yeast cultivation for maximum
              astaxanthin yield and economic efficiency.
            </p>
            <p>
              Additionally, I am engaged in the{' '}
              <strong>business development of space enzyme–protein scaffolding</strong>,
              aiming to biodegrade PET in space environments to produce materials for 3D printing.
            </p>
          </div>
        </section>

        {/* Skills */}
        <section className="section">
          <h2 className="section-title">Skills</h2>
          <div className="grid-2">
            {[
              { icon: '🔧', label: 'Raspberry Pi Development' },
              { icon: '🧫', label: 'Aseptic Microbial Transfer Techniques' },
              { icon: '🌐', label: 'Remote Network Configuration & Management' },
              { icon: '🤝', label: 'Business Collaboration & Partnership Development' },
            ].map((skill) => (
              <div className="skill-card" key={skill.label}>
                <span className="skill-icon">{skill.icon}</span>
                <span>{skill.label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Achievement */}
        <section className="section">
          <h2 className="section-title">Achievements</h2>
          <div className="achievement-card">
            <div className="trophy">🏆</div>
            <div>
              <div className="achievement-rank">1st Place</div>
              <div className="achievement-name">RunSpace Competition 2025</div>
              <div className="achievement-sub">Implementation & Enterprise Innovation Division</div>
              <div className="achievement-team">Team: <span className="accent">Asta-sense</span></div>
            </div>
          </div>
        </section>

        {/* Interests */}
        <section className="section">
          <h2 className="section-title">Interests</h2>
          <div className="grid-4">
            {[
              { icon: '🛰️', label: 'Satellite Communication Systems' },
              { icon: '🧬', label: 'Bio-manufacturing Automation' },
              { icon: '🚀', label: 'Space Materials Research' },
              { icon: '🤖', label: 'AI-driven Scientific Applications' },
            ].map((item) => (
              <div className="interest-card" key={item.label}>
                <div className="interest-icon">{item.icon}</div>
                <p>{item.label}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="footer">
        <p>© 2025 張祐瑋 Thomas · Built with React + Vite · Deployed on GitHub Pages</p>
      </footer>
    </div>
  )
}

export default App
