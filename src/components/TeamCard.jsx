import { Link, useNavigate } from "react-router-dom";
import { MapPin, Users, ChevronRight, Shield, Pencil, Trash2 } from "lucide-react";
import { useDeleteTeam } from "../hooks/useDeleteTeam";
import { extractErrorMessage } from "../api/client";
import cskImage from "../images/csk.jpg";
import rcbImage from "../images/rcb.jpg";
import miImage from "../images/mi.jpg";
import srhImage from "../images/srh.jpg";

// Team color scheme configuration
const TEAM_COLORS = {
  CSK: {
    bg: "from-purple-900 to-slate-900",
    textColor: "text-yellow-400",
    borderColor: "border-yellow-500/30",
  },
  RCB: {
    bg: "from-red-950 to-slate-900",
    textColor: "text-red-400",
    borderColor: "border-red-500/30",
  },
  MI: {
    bg: "from-blue-950 to-yellow-900",
    textColor: "text-blue-400",
    borderColor: "border-blue-500/30",
  },
   SRH: {
    bg: "from-blue-950 to-yellow-900",
    textColor: "text-blue-400",
    borderColor: "border-blue-500/30",
  },
  DEFAULT: {
    bg: "from-emerald-600 via-emerald-700 to-emerald-900",
    textColor: "text-emerald-100",
    borderColor: "border-emerald-300",
  },
};

// Map team short names to images
const TEAM_IMAGES = {
  CSK: cskImage,
  RCB: rcbImage,
  MI: miImage,
  SRH:srhImage
};

function TeamCard({ team }) {
  const navigate = useNavigate();
  const deleteTeam = useDeleteTeam();
  const teamColors = TEAM_COLORS[team.short_name] || TEAM_COLORS.DEFAULT;
  const teamImage = team.logo || team.logo_url || TEAM_IMAGES[team.short_name];

  async function handleDelete(e) {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm(`Delete team "${team.name}"? This cannot be undone.`)) return;
    try {
      await deleteTeam.mutateAsync(team.id);
    } catch (err) {
      alert(`Failed to delete team: ${extractErrorMessage(err)}`);
    }
  }

  return (
    <Link
      to={`/teams/${team.id}`}
      className={`group relative overflow-hidden rounded-2xl border-2 ${teamColors.borderColor} transition-all duration-300 hover:shadow-2xl`}
    >
      {/* Edit / Delete actions */}
      <div
        className="absolute top-3 right-3 z-20 flex items-center gap-1.5"
        onClick={(e) => e.preventDefault()}
      >
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            navigate(`/teams/${team.id}/edit`);
          }}
          className="p-2 rounded-lg bg-black/40 backdrop-blur-sm text-white hover:bg-emerald-600 transition"
          title="Edit team"
        >
          <Pencil className="w-4 h-4" />
        </button>
        <button
          onClick={handleDelete}
          disabled={deleteTeam.isPending}
          className="p-2 rounded-lg bg-black/40 backdrop-blur-sm text-white hover:bg-red-600 transition disabled:opacity-50"
          title="Delete team"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
      <div className={`bg-linear-to-r ${teamColors.bg} min-h-70 relative`}>
        {/* Left side - Team info (sits above the diagonal image) */}
        <div className="relative z-10 h-full flex flex-col justify-between p-6 w-3/5 sm:w-1/2">
          <div className="space-y-1">
            <h1
              className={`text-5xl sm:text-6xl font-black tracking-wider ${teamColors.textColor} -ml-4`}
            >
              {team.short_name}
            </h1>
            <p className="text-gray-200 font-medium -ml-3">{team.name}</p>
          </div>

          <div className="space-y-3 -ml-4 mt-4">
            <div className="flex items-center gap-3 text-gray-300">
              <MapPin className="w-5 h-5 text-gray-400 shrink-0" />
              <span className="text-sm font-medium">{team.homeground}</span>
            </div>
            <div className="flex items-center gap-3 text-gray-300">
              <Users className="w-5 h-5 text-gray-400 shrink-0" />
              <span className="text-sm font-medium">
                {team.total ??
                  team.players?.length ??
                  (team.playing_11?.length ?? 0) +
                    (team.substitutes?.length ?? 0) +
                    (team.bench?.length ?? 0)}{" "}
                Players Registered
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1 group/link cursor-pointer mt-18 ">
            <span
              className={`text-sm font-bold ${teamColors.textColor} transition-all -ml-4` }
            >
              View Squad & Details
            </span>
            <ChevronRight
              className={`w-4 h-4 ${teamColors.textColor} transform group-hover/link:translate-x-1 transition-transform`}
            />
          </div>
        </div>

        {/* Right side - Team Image, diagonally clipped */}
        <div
          className="absolute inset-y-0 right-0 w-3/5 sm:w-2/3 overflow-hidden opacity-90 group-hover:opacity-100 transition-opacity duration-300"
          style={{ clipPath: "polygon(22% 0, 100% 0, 100% 100%, 0% 100%)" }}
        >
          {teamImage ? (
            <img
              src={teamImage}
              alt={team.name}
              className="h-full w-full object-cover object-center"
            />
          ) : (
            <div
              className={`h-full w-full flex items-center justify-center bg-linear-to-r ${teamColors.bg}`}
            >
              <Shield
                className={`w-20 h-20 ${teamColors.textColor} opacity-30`}
              />
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

export default TeamCard;
