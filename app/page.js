export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">

      {/* Navbar */}
      <nav className="flex items-center justify-between border-b border-slate-800 px-8 py-5">
        <h1 className="text-2xl font-bold text-cyan-400">
          DigitalDost
        </h1>

        <button className="rounded-lg bg-cyan-500 px-5 py-2 font-semibold text-slate-950">
          Login
        </button>
      </nav>

      {/* Hero */}
      <section className="px-8 py-20 text-center">
        <p className="mb-4 text-cyan-400">
          Your Personal Digital Assistant
        </p>

        <h2 className="mx-auto max-w-3xl text-5xl font-bold leading-tight">
          Your Digital Life,
          <span className="text-cyan-400"> Simplified.</span>
        </h2>

        <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-400">
          Manage your tasks, reminders, notes and documents
          with the help of your personal digital assistant.
        </p>

        <button className="mt-8 rounded-xl bg-cyan-500 px-8 py-3 font-semibold text-slate-950 hover:bg-cyan-400">
          Get Started
        </button>
      </section>

      {/* Features */}
      <section className="mx-auto grid max-w-6xl gap-6 px-8 pb-20 md:grid-cols-4">

        <Feature
          icon="🤖"
          title="AI Assistant"
          description="Ask questions and get help with your daily digital tasks."
        />

        <Feature
          icon="✅"
          title="Tasks"
          description="Create, manage and complete your daily tasks."
        />

        <Feature
          icon="⏰"
          title="Reminders"
          description="Never forget your important activities and deadlines."
        />

        <Feature
          icon="📝"
          title="Smart Notes"
          description="Save and organize your important notes in one place."
        />

      </section>

    </main>
  );
}


function Feature({ icon, title, description }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 transition hover:-translate-y-1 hover:border-cyan-500">

      <div className="mb-4 text-4xl">
        {icon}
      </div>

      <h3 className="mb-2 text-xl font-semibold">
        {title}
      </h3>

      <p className="text-sm leading-6 text-slate-400">
        {description}
      </p>

    </div>
  );
}