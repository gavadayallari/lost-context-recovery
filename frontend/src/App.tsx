import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Timeline from "./pages/Timeline";
import Commits from "./pages/Commits";
import Issues from "./pages/Issues";
import PullRequests from "./pages/PullRequests";
import Readme from "./pages/Readme";
import AskProject from "./pages/AskProject";
import SyncHistory from "./pages/SyncHistory";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Home */}
        <Route path="/" element={<Home />} />

        {/* Dashboard */}
        <Route
          path="/dashboard/:owner/:repo"
          element={<Dashboard />}
        />

        {/* Timeline */}
        <Route
          path="/dashboard/:owner/:repo/timeline"
          element={<Timeline />}
        />

        {/* Commits */}
        <Route
          path="/dashboard/:owner/:repo/commits"
          element={<Commits />}
        />

        {/* Issues */}
        <Route
          path="/dashboard/:owner/:repo/issues"
          element={<Issues />}
        />

        {/* Pull Requests */}
        <Route
          path="/dashboard/:owner/:repo/pull-requests"
          element={<PullRequests />}
        />

        {/* README */}
        <Route
          path="/dashboard/:owner/:repo/readme"
          element={<Readme />}
        />

        {/* Ask Project */}
        <Route
          path="/dashboard/:owner/:repo/ask"
          element={<AskProject />}
        />

        <Route
          path="/dashboard/:owner/:repo/sync-history"
          element={<SyncHistory />}
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;