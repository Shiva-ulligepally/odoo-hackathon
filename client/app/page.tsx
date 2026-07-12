import AppLayout from '@/components/layout/AppLayout';

export default function Home() {
  return (
    <AppLayout>
      <div className="flex flex-col gap-6 py-6">
        <div className="space-y-2">
          <span className="text-xs font-semibold text-primary bg-primary/10 border border-primary/20 px-3 py-1 rounded-full uppercase tracking-wider">
            Architecture Verified
          </span>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-500 via-teal-500 to-sky-500 bg-clip-text text-transparent mt-3">
            EcoSphere AI – ESG Foundation Dashboard
          </h1>
        </div>
        
        <p className="text-muted-foreground text-base max-w-2xl leading-relaxed">
          Welcome to the Autonomous ESG Operating System. The core SaaS architecture is successfully established. 
          All reusable providers (React Query, Theme context), layout shells (Sidebar, Navbar), charts (ECharts), 
          Axios services, formatters, and TypeScript types have been set up and are production-ready.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          <div className="border border-border rounded-xl p-5 bg-card/50">
            <h3 className="font-bold text-sm text-emerald-500">Environmental (E)</h3>
            <p className="text-xs text-muted-foreground mt-2">Carbon accounting services, emissions tracking datasets, and ECharts line visualizers are configured.</p>
          </div>
          <div className="border border-border rounded-xl p-5 bg-card/50">
            <h3 className="font-bold text-sm text-sky-500">Social (S)</h3>
            <p className="text-xs text-muted-foreground mt-2">Social equity indexes, demographic metrics, and human resources data shapes are typed.</p>
          </div>
          <div className="border border-border rounded-xl p-5 bg-card/50">
            <h3 className="font-bold text-sm text-purple-500">Governance (G)</h3>
            <p className="text-xs text-muted-foreground mt-2">Board representation records, ethics audit trail shapes, and compliance metrics are established.</p>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
