import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getSyncStatus, startRepositorySync } from "../services/syncApi";
import { parseGitHubUrl } from "../utils/github";

const Home = () => {
  const navigate = useNavigate();

  const [repoUrl, setRepoUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<
    "idle" | "pending" | "running" | "completed" | "failed"
  >("idle");
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    setError(null);

    if (!repoUrl.trim()) {
      setError("Please enter a GitHub repository URL.");
      return;
    }

    const parsedRepo = parseGitHubUrl(repoUrl);

    if (!parsedRepo) {
      setError("Please enter a valid GitHub repository URL.");
      return;
    }

    try {
      setLoading(true);
      setProgress(0);
      setStatus("pending");

      const response = await startRepositorySync(repoUrl);
      const jobId = response.data.jobId;

      await pollSyncStatus(jobId, parsedRepo.owner, parsedRepo.repo);
    } catch (error: any) {
      console.error(error);
      setStatus("failed");
      const errorMessage =
        error.response?.data?.message || "Failed to start repository analysis.";
      setError(errorMessage);
      setLoading(false);
    }
  };

  const pollSyncStatus = async (
    jobId: string,
    owner: string,
    repo: string
  ) => {
    const maxAttempts = 60;
    let attempts = 0;

    const checkStatus = async (): Promise<void> => {
      if (attempts >= maxAttempts) {
        setStatus("failed");
        setError("Repository analysis timed out.");
        setLoading(false);
        return;
      }

      attempts++;
      const response = await getSyncStatus(jobId);
      const job = response.data;

      setProgress(job.progress ?? 0);
      setStatus(job.status);

      if (job.status === "completed") {
        setProgress(100);
        setLoading(false);
        navigate(
          `/dashboard/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`
        );
        return;
      }

      if (job.status === "failed") {
        setError(job.error_message ?? "Repository analysis failed.");
        setLoading(false);
        return;
      }

      await new Promise((resolve) => setTimeout(resolve, 1000));
      await checkStatus();
    };

    await checkStatus();
  };

  return (
    <div className="relative min-h-screen bg-[#020617] text-white selection:bg-blue-500/30 overflow-x-hidden font-sans flex flex-col">
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          opacity: 0;
        }
      `}</style>

      {/* Decorative Background Elements */}
      <div className="fixed top-[-20%] left-[-10%] w-[1000px] h-[1000px] bg-blue-900/10 blur-[150px] rounded-full pointer-events-none mix-blend-screen" />
      <div className="fixed bottom-[-20%] right-[-10%] w-[800px] h-[800px] bg-indigo-900/10 blur-[150px] rounded-full pointer-events-none mix-blend-screen" />
      <div className="fixed inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wMykiLz48L3N2Zz4=')] [mask-image:radial-gradient(ellipse_at_center,black_50%,transparent_100%)] pointer-events-none" />

      {/* Header */}
      <header className="absolute top-0 w-full z-50 border-b border-white/5 bg-slate-950/40 backdrop-blur-lg">
        <div className="w-full px-4 sm:px-6 lg:px-10 xl:px-16 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <SparklesIcon className="w-5 h-5 text-blue-500" />
            <span className="font-semibold text-white tracking-wide text-sm sm:text-base">Lost Context Recovery</span>
          </div>
          <div className="flex items-center gap-4 text-sm font-medium text-slate-400">
            <a href="https://github.com" target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-md p-1">
              <GitHubIcon className="w-4 h-4" />
              <span className="hidden sm:inline">GitHub Source</span>
            </a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col pt-32 sm:pt-40 pb-24 relative z-10 w-full">
        
        {/* Hero Section */}
        <section className="w-full px-4 sm:px-6 lg:px-10 xl:px-16 flex flex-col items-center text-center animate-fade-in-up" style={{ animationDelay: '0ms' }}>
          <h1 className="text-4xl sm:text-5xl md:text-6xl xl:text-7xl font-extrabold tracking-tight text-white mb-6 leading-tight max-w-[1400px]">
            Understand Any <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300">GitHub Project</span>
          </h1>
          <p className="mx-auto max-w-3xl text-lg sm:text-xl xl:text-2xl text-slate-400 mb-12 lg:mb-16 leading-relaxed font-light px-2">
            Enter a GitHub repository URL and instantly recover its documentation, trace dependencies, and explore the context with a powerful AI engine.
          </p>

          {/* Analyzer Card */}
          <div className="w-full max-w-[1200px] mx-auto bg-slate-900/60 backdrop-blur-2xl border border-slate-800/80 rounded-3xl p-5 sm:p-8 xl:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.4)] transition-all duration-300 focus-within:border-blue-500/50 focus-within:ring-4 focus-within:ring-blue-500/10 text-left">
            <label htmlFor="repoUrlInput" className="block text-sm sm:text-base font-medium text-slate-300 mb-4 ml-1">
              GitHub Repository URL
            </label>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1 group">
                <div className="absolute inset-y-0 left-0 pl-4 sm:pl-5 flex items-center pointer-events-none text-slate-500 group-focus-within:text-blue-400 transition-colors duration-300">
                  <GitHubIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <input
                  id="repoUrlInput"
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  disabled={loading}
                  type="url"
                  placeholder="https://github.com/owner/repository"
                  className="w-full pl-12 sm:pl-14 pr-4 py-4 sm:py-5 text-base sm:text-lg bg-slate-950/50 border border-slate-700/80 rounded-2xl text-white placeholder-slate-500 outline-none transition-all duration-300 focus:bg-slate-900 focus:border-blue-500/80 disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>

              <button
                onClick={handleAnalyze}
                disabled={loading || !repoUrl.trim()}
                className="group relative flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed text-white font-semibold text-base sm:text-lg py-4 sm:py-5 px-8 sm:px-10 rounded-2xl transition-all duration-300 overflow-hidden shrink-0 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-500/50 w-full md:w-auto"
              >
                {loading ? (
                  <>
                    <SpinnerIcon className="w-6 h-6 animate-spin" />
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <span>Analyze</span>
                    <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </div>

            {error && (
              <div className="mt-6 flex items-start gap-3 p-4 sm:p-5 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-left transition-all duration-300 animate-fade-in-up" style={{ animationDelay: '0ms' }}>
                <AlertIcon className="w-5 h-5 shrink-0 mt-0.5" />
                <p className="text-sm sm:text-base leading-relaxed">{error}</p>
              </div>
            )}

            {loading && (
              <div className="mt-8 pt-6 sm:pt-8 border-t border-slate-800/50 text-left transition-all duration-300 animate-fade-in-up" style={{ animationDelay: '0ms' }}>
                <div className="flex items-center justify-between text-sm sm:text-base mb-4 px-1">
                  <span className="text-slate-300 font-medium">
                    {status === "pending" ? "Preparing analysis engine..." : "Processing repository contents..."}
                  </span>
                  <span className="text-blue-400 font-bold tracking-wide">{progress}%</span>
                </div>
                
                <div className="h-3 w-full bg-slate-950/80 rounded-full overflow-hidden relative border border-slate-800/80">
                  <div
                    className="h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-full transition-all duration-700 ease-out relative"
                    style={{ width: `${progress}%` }}
                  >
                    <div className="absolute top-0 right-0 bottom-0 w-20 bg-gradient-to-r from-transparent to-white/30 blur-[2px] animate-pulse" />
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 text-xs sm:text-sm font-medium text-slate-500">
                  <ProgressStage label="Repository" active={progress >= 10} />
                  <ProgressStage label="Commits" active={progress >= 30} />
                  <ProgressStage label="Issues" active={progress >= 50} />
                  <ProgressStage label="Pull Requests" active={progress >= 60} />
                  <ProgressStage label="Source Code" active={progress >= 80} />
                  <ProgressStage label="AI Analysis" active={progress >= 95} />
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Workflow Section */}
        <section className="w-full px-4 sm:px-6 lg:px-10 xl:px-16 mt-24 sm:mt-32 mb-16 animate-fade-in-up" style={{ animationDelay: '150ms' }}>
          <div className="max-w-[1600px] mx-auto w-full">
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 lg:gap-8 relative">
              <div className="hidden xl:block absolute top-[40%] left-[10%] w-[80%] h-[2px] bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 -z-10" />
              
              <WorkflowStep icon={<GitHubIcon className="w-6 h-6"/>} title="1. Connect" desc="Paste any public repo URL" />
              <WorkflowStep icon={<SearchIcon className="w-6 h-6"/>} title="2. Analyze" desc="Deep static code parsing" />
              <WorkflowStep icon={<DatabaseIcon className="w-6 h-6"/>} title="3. Context" desc="Sync commits, issues, PRs" />
              <WorkflowStep icon={<BotIcon className="w-6 h-6 text-blue-400"/>} title="4. Ask AI" desc="Explore the architecture" highlight={true} />
            </div>
          </div>
        </section>

        {/* Feature Section */}
        <section className="w-full px-4 sm:px-6 lg:px-10 xl:px-16 mt-16 sm:mt-24 mb-12 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
          <div className="max-w-[1600px] mx-auto w-full">
            <div className="text-center mb-12 sm:mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Powerful Features</h2>
              <p className="text-slate-400 max-w-2xl mx-auto">Everything you need to understand, document, and master any open-source or private codebase instantly.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-8">
              <FeatureCard
                icon={<BrainIcon className="w-7 h-7" />}
                title="Repository Intelligence"
                description="Deep static analysis of your source code, tracking imports, exports, and complex API call chains automatically."
              />
              <FeatureCard
                icon={<BarChartIcon className="w-7 h-7" />}
                title="Project Analytics"
                description="Unified dashboard visualizing commits, issues, PRs, and rich repository statistics in one responsive interface."
              />
              <FeatureCard
                icon={<BotIcon className="w-7 h-7" />}
                title="AI Project Assistant"
                description="Ask anything about the codebase. Trace feature flows securely across UI components and backend routes."
              />
            </div>
          </div>
        </section>

      </main>
    </div>
  );
};

const ProgressStage = ({ label, active }: { label: string, active: boolean }) => (
  <div className={`flex items-center gap-2 p-2 rounded-lg transition-colors duration-500 ${active ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'bg-slate-900/30 border border-transparent'}`}>
    <div className={`w-2 h-2 rounded-full ${active ? 'bg-blue-500 animate-pulse' : 'bg-slate-700'}`} />
    <span className="truncate">{label}</span>
  </div>
);

const WorkflowStep = ({ icon, title, desc, highlight = false }: { icon: React.ReactNode, title: string, desc: string, highlight?: boolean }) => (
  <div className={`flex flex-col items-center text-center p-6 sm:p-8 rounded-3xl backdrop-blur-sm border transition-all duration-300 hover:-translate-y-1 ${highlight ? 'bg-blue-900/10 border-blue-500/20 shadow-[0_0_30px_rgba(59,130,246,0.1)]' : 'bg-slate-900/40 border-slate-800/60 hover:bg-slate-800/50'}`}>
    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-inner ${highlight ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-slate-800 text-slate-300 border border-slate-700'}`}>
      {icon}
    </div>
    <h3 className={`text-lg font-bold mb-2 ${highlight ? 'text-white' : 'text-slate-200'}`}>{title}</h3>
    <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
  </div>
);

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => (
  <div className="group rounded-3xl border border-slate-800/80 bg-slate-900/40 backdrop-blur-md p-8 sm:p-10 transition-all duration-300 hover:bg-slate-800/80 hover:border-slate-700 hover:-translate-y-2 hover:shadow-2xl hover:shadow-blue-500/5 flex flex-col h-full">
    <div className="mb-6 inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/20 transition-transform duration-300 group-hover:scale-110 group-hover:bg-blue-500/20 shadow-inner">
      {icon}
    </div>
    <h3 className="text-xl font-bold text-white mb-4 group-hover:text-blue-400 transition-colors duration-300">
      {title}
    </h3>
    <p className="text-slate-400 text-base leading-relaxed flex-1">
      {description}
    </p>
  </div>
);

// Icons
const GitHubIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>
);

const SparklesIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
);

const ArrowRightIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
);

const SpinnerIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
);

const AlertIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
);

const BrainIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z"/><path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z"/><path d="M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4"/><path d="M17.599 6.5a3 3 0 0 0 .399-1.375"/><path d="M6.003 5.125A3 3 0 0 0 6.401 6.5"/><path d="M3.477 10.896a4 4 0 0 1 .585-.396"/><path d="M19.938 10.5a4 4 0 0 1 .585.396"/><path d="M6 18a4 4 0 0 1-1.967-.516"/><path d="M19.967 17.484A4 4 0 0 1 18 18"/></svg>
);

const BarChartIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><line x1="12" x2="12" y1="20" y2="10"/><line x1="18" x2="18" y1="20" y2="4"/><line x1="6" x2="6" y1="20" y2="16"/></svg>
);

const BotIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg>
);

const SearchIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
);

const DatabaseIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5V19A9 3 0 0 0 21 19V5"/><path d="M3 12A9 3 0 0 0 21 12"/></svg>
);

export default Home;