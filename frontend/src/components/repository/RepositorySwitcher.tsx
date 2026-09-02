import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getRepositories } from "../../services/repositoryListApi";

type Repository = {
  id: string;
  owner: string;
  name: string;
  full_name: string;
  language: string | null;
};

const RepositorySwitcher = () => {
  const navigate = useNavigate();

  const { owner, repo } = useParams<{
    owner: string;
    repo: string;
  }>();

  const [repositories, setRepositories] =
    useState<Repository[]>([]);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    const loadRepositories = async () => {
      try {
        const response =
          await getRepositories();

        setRepositories(response.data);
      } catch (error) {
        console.error(
          "Failed to load repositories:",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    loadRepositories();
  }, []);

  const currentRepository =
    repositories.find(
      (repository) =>
        repository.owner === owner &&
        repository.name === repo
    );

  const handleChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const value = event.target.value;

    if (!value) {
      return;
    }

    const selectedRepository =
      repositories.find(
        (repository) =>
          repository.id === value
      );

    if (!selectedRepository) {
      return;
    }

    navigate(
      `/dashboard/${encodeURIComponent(
        selectedRepository.owner
      )}/${encodeURIComponent(
        selectedRepository.name
      )}`
    );
  };

  if (loading) {
    return (
      <div className="text-sm text-slate-400">
        Loading repositories...
      </div>
    );
  }

  return (
    <div className="w-full max-w-xs">
      <label className="mb-2 block text-xs text-slate-500">
        Current Repository
      </label>

      <select
        value={
          currentRepository?.id ?? ""
        }
        onChange={handleChange}
        className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-blue-500"
      >
        <option value="">
          Select repository
        </option>

        {repositories.map((repository) => (
          <option
            key={repository.id}
            value={repository.id}
          >
            {repository.full_name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default RepositorySwitcher;