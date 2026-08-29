import { Link } from "react-router-dom";
import { useTeams } from "../hooks/useTeams";
import { Users, Plus, ShieldAlert } from "lucide-react";
import TeamCard from "../components/TeamCard";

function TeamsPage() {
  const { data: teams, isLoading, isError, error } = useTeams();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-500 mt-4 text-sm">Loading squad list...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl max-w-lg mx-auto text-center">
        <ShieldAlert className="w-8 h-8 mx-auto mb-2 text-red-500" />
        <h4 className="font-bold">Failed to load teams</h4>
        <p className="text-sm mt-1">{error.message}</p>
      </div>
    );
  }

  if (!teams || teams.length === 0) {
    return (
      <div className="bg-white border border-cricket-border rounded-2xl p-12 text-center max-w-lg mx-auto space-y-4 shadow-sm">
        <Users className="w-12 h-12 text-emerald-500 mx-auto" />
        <h3 className="text-xl font-bold text-gray-900">
          No teams registered yet
        </h3>
        <p className="text-gray-500 text-sm">
          Get started by registering the first official cricket squad in the
          database.
        </p>
        <Link
          to="/teams/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-semibold transition"
        >
          <Plus className="w-4 h-4" /> Add First Team
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">
            Teams Directory
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Displaying all {teams.length} professional clubs registered in the
            league.
          </p>
        </div>
        <Link
          to="/teams/new"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow-sm transition"
        >
          <Plus className="w-4 h-4" /> Register Team
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {teams.map((team) => (
          <TeamCard key={team.id} team={team} />
        ))}
      </div>
    </div>
  );
}

export default TeamsPage;
