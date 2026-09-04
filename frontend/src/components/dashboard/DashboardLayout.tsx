import React, { useState, useEffect } from "react";
import { Link, useParams, useLocation } from "react-router-dom";

const MenuIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
);

const CloseIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
);

export const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const { owner, repo } = useParams<{ owner: string; repo: string }>();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  const navLinks = [
    { name: "Overview", path: `/dashboard/${owner}/${repo}` },
    { name: "Timeline", path: `/dashboard/${owner}/${repo}/timeline` },
    { name: "Commits", path: `/dashboard/${owner}/${repo}/commits` },
    { name: "Issues", path: `/dashboard/${owner}/${repo}/issues` },
    { name: "Pull Requests", path: `/dashboard/${owner}/${repo}/pull-requests` },
    { name: "README", path: `/dashboard/${owner}/${repo}/readme` },
    { name: "Ask Project", path: `/dashboard/${owner}/${repo}/ask` },
    { name: "Sync History", path: `/dashboard/${owner}/${repo}/sync-history` },
  ];

  const SidebarContent = () => (
    <>
      <div className="mb-8 px-2">
        <h1 className="text-xl font-bold text-white">Lost Context</h1>
        <p className="mt-1 text-sm text-slate-400">Project Recovery System</p>
      </div>
      <nav className="space-y-1">
        {navLinks.map((link) => {
          const isActive = location.pathname === link.path;
          return (
            <Link
              key={link.name}
              to={link.path}
              onClick={() => setMobileMenuOpen(false)}
              className={`block w-full rounded-lg px-4 py-3 text-sm transition-all duration-200 ${
                isActive
                  ? "bg-blue-600/10 text-blue-400 font-medium border border-blue-500/20"
                  : "text-slate-400 border border-transparent hover:bg-slate-800/50 hover:text-white"
              }`}
            >
              {link.name}
            </Link>
          );
        })}
      </nav>
    </>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col lg:flex-row">
      {/* Mobile Header */}
      <header className="lg:hidden sticky top-0 z-40 flex items-center justify-between border-b border-slate-800 bg-slate-900/90 backdrop-blur-md px-4 py-3 shadow-md">
        <div className="flex items-center gap-3 overflow-hidden">
          <button
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open navigation menu"
            className="p-2 -ml-2 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 transition-colors"
          >
            <MenuIcon className="w-6 h-6" />
          </button>
          <div className="truncate flex flex-col">
            <h1 className="text-sm font-bold text-white truncate leading-tight">Lost Context Recovery</h1>
            <p className="text-xs text-slate-400 truncate leading-tight">{owner}/{repo}</p>
          </div>
        </div>
      </header>

      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm lg:hidden transition-opacity duration-300"
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile Sidebar Drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-[280px] sm:w-[320px] transform border-r border-slate-800 bg-slate-900 p-6 transition-transform duration-300 ease-in-out lg:hidden ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="absolute top-4 right-4">
          <button
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Close navigation menu"
            className="p-2 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 transition-colors"
          >
            <CloseIcon className="w-5 h-5" />
          </button>
        </div>
        <div className="mt-4">
          <SidebarContent />
        </div>
      </aside>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 shrink-0 border-r border-slate-800 bg-slate-900 p-6 h-screen sticky top-0 overflow-y-auto">
        <SidebarContent />
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-full overflow-x-hidden p-4 sm:p-6 lg:p-10 pb-20">
        {children}
      </main>
    </div>
  );
};
