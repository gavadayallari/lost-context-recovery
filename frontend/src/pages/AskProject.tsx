import { useState, useRef, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { askProjectAssistant } from "../services/projectAssistantApi";

type ChatMessage = {
  role: "user" | "ai";
  text: string;
  source?: string;
  ai?: boolean;
};

const AskProject = () => {
  const { owner, repo } = useParams<{
    owner: string;
    repo: string;
  }>();

  const [question, setQuestion] = useState("");
  const [history, setHistory] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history]);

  const handleAsk = async (queryOverride?: string) => {
    const textToAsk = queryOverride || question;
    
    if (!owner || !repo) {
      setError("Repository information is missing.");
      return;
    }

    if (!textToAsk.trim()) {
      setError("Please enter a question.");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      setHistory((prev) => [...prev, { role: "user", text: textToAsk }]);
      setQuestion("");

      const response = await askProjectAssistant(owner, repo, textToAsk);

      setHistory((prev) => [
        ...prev,
        {
          role: "ai",
          text: response.data.answer,
          source: response.data.source,
          ai: response.data.ai,
        },
      ]);
    } catch (error) {
      console.error(error);
      setError("Failed to get project answer.");
    } finally {
      setLoading(false);
    }
  };

  const suggestedQuestions = [
    "Explain this project",
    "What technologies are used?",
    "How does this project work?",
    "What are the main features?",
    "What changed recently?",
    "Explain the latest commits",
    "Are there any open issues?",
    "What are the important pull requests?",
    "What should a new developer understand first?",
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 md:p-10">
      <div className="mb-6">
        <Link
          to={`/dashboard/${owner}/${repo}`}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-medium text-slate-300 transition hover:border-blue-500 hover:bg-slate-800 hover:text-white"
        >
          ← Back to Dashboard
        </Link>
      </div>

      <div className="mx-auto max-w-5xl">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold">Project Intelligence</h1>
          <p className="mt-3 text-slate-400">Ask anything about this repository.</p>
          <p className="mt-2 text-xs text-slate-500">Repository: {owner}/{repo}</p>
        </div>

        <div className="flex-1 flex flex-col">
          {history.length > 0 && (
            <div className="flex flex-col gap-6 mb-10">
              {history.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex w-full ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl p-5 ${
                      msg.role === "user"
                        ? "bg-blue-600 text-white rounded-br-none"
                        : "bg-slate-900 border border-slate-800 text-slate-300 rounded-bl-none"
                    }`}
                  >
                    <p className="whitespace-pre-wrap leading-7">{msg.text}</p>
                    
                    {msg.role === "ai" && msg.source && (
                      <div className="mt-4 flex items-center gap-3 border-t border-slate-800 pt-3">
                        <span className="rounded-full bg-slate-950 border border-slate-700 px-3 py-1 text-xs font-medium text-slate-400">
                          Source: {msg.source}
                        </span>
                        {msg.ai && (
                          <span className="rounded-full bg-purple-500/10 px-3 py-1 text-xs font-medium text-purple-400">
                            AI Context
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
          )}

          <div className="w-full rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleAsk();
                }
              }}
              placeholder="Ask something about the project..."
              rows={3}
              className="w-full resize-none rounded-xl border border-slate-700 bg-slate-950 p-4 text-white placeholder:text-slate-600 outline-none transition focus:border-blue-500"
            />

            <div className="mt-4 flex justify-end">
              <button
                onClick={() => handleAsk()}
                disabled={loading || !question.trim()}
                className="rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? "Analyzing..." : "Ask AI"}
              </button>
            </div>

            {error && (
              <div className="mt-4 rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
                {error}
              </div>
            )}
          </div>

          {history.length === 0 && (
            <div className="mt-10">
              <p className="mb-4 text-sm font-medium text-slate-400 text-center">
                Quick Questions
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                {suggestedQuestions.map((item) => (
                  <button
                    key={item}
                    onClick={() => handleAsk(item)}
                    className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-slate-300 transition hover:border-blue-500 hover:text-white"
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AskProject;