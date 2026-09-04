import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getRepositoryReadme } from "../services/readmeApi";
import { DashboardLayout } from "../components/dashboard/DashboardLayout";

type ReadmeDocument = {
  id: string;
  repository_id: string;
  name: string;
  path: string;
  content: string;
  url: string;
};

const Readme = () => {
  const { owner, repo } = useParams<{
    owner: string;
    repo: string;
  }>();

  const [readme, setReadme] =
    useState<ReadmeDocument | null>(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] =
    useState<string | null>(null);

  useEffect(() => {
    const loadReadme = async () => {
      if (!owner || !repo) {
        setError("Repository information is missing.");
        setLoading(false);
        return;
      }

      try {
        const response = await getRepositoryReadme(
          owner,
          repo
        );

        setReadme(response.data ?? null);
      } catch (error) {
        console.error(error);
        setError("Failed to load README");
      } finally {
        setLoading(false);
      }
    };

    loadReadme();
  }, [owner, repo]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        Loading README...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 text-red-400 flex items-center justify-center">
        {error}
      </div>
    );
  }

  if (!readme) {
    return (
      <DashboardLayout>
        <div className="mx-auto max-w-4xl">
          <div className="flex items-center justify-center py-20">
            <div className="text-center rounded-2xl border border-slate-800 bg-slate-900/50 p-10">
              <h1 className="text-2xl font-bold text-white">
                README not available
              </h1>
              <p className="mt-3 text-slate-400">
                {owner}/{repo} does not contain a README file.
              </p>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-4xl">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="text-sm text-slate-400">
              Project Documentation
            </p>

            <h1 className="mt-2 text-3xl font-bold">
              {readme.name}
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              {readme.path}
            </p>
          </div>

          <a
            href={readme.url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center rounded-lg bg-slate-800 px-4 py-2 text-sm text-white hover:bg-slate-700"
          >
            View on GitHub →
          </a>
        </div>

        <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-6 md:p-8">
          <pre className="whitespace-pre-wrap break-words font-sans text-sm leading-7 text-slate-300">
            {readme.content}
          </pre>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Readme;