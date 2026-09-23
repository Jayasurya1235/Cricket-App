import { useState } from "react";
import { useParams } from "react-router-dom";
import { useMatch } from "../hooks/useMatch";
import { useTeam } from "../hooks/useTeam";
import {
  useScoringState,
  useStartInnings,
  useRecordDelivery,
} from "../hooks/useScoring";
import { extractErrorMessage } from "../api/client";
import MatchHeader from "../components/scoring/MatchHeader";
import ScoreSummary from "../components/scoring/ScoreSummary";
import BatsmenPanel from "../components/scoring/BatsmenPanel";
import BowlerPanel from "../components/scoring/BowlerPanel";
import CurrentOver from "../components/scoring/CurrentOver";
import ScoringControls from "../components/scoring/ScoringControls";
import WicketModal from "../components/scoring/WicketModal";
import ExtrasModal from "../components/scoring/ExtrasModal";
import ScorecardDrawer from "../components/scoring/ScorecardDrawer";
import InningsSummary from "../components/scoring/InningsSummary";
import StartInningsModal from "../components/scoring/StartInningsModal";
import { ShieldAlert, Play } from "lucide-react";

const OVERS_BY_FORMAT = { T20: 20, ODI: 50, Test: 90 };

function rosterOf(team) {
  if (!team) return [];
  if (Array.isArray(team.players) && team.players.length > 0) return team.players;
  return team.playing_11 || [];
}

function playersById(...rosters) {
  const map = {};
  for (const roster of rosters) {
    for (const p of roster) map[p.id] = p;
  }
  return map;
}

export default function ScoringPage() {
  const { matchId } = useParams();

  const { data: match, isLoading: matchLoading } = useMatch(matchId);
  const { data: teamA } = useTeam(match?.team_a?.id);
  const { data: teamB } = useTeam(match?.team_b?.id);
  const { data: scorecard, isLoading: scoringLoading } = useScoringState(matchId);
  const startInnings = useStartInnings(matchId);
  const recordDelivery = useRecordDelivery(matchId);

  const [showStartInnings, setShowStartInnings] = useState(false);
  const [selectedBowlerId, setSelectedBowlerId] = useState("");
  const [lastBalls, setLastBalls] = useState([]);
  const [showWicketModal, setShowWicketModal] = useState(false);
  const [showExtrasModal, setShowExtrasModal] = useState(null);
const [showScorecard, setShowScorecard] = useState(false);
  const [actionError, setActionError] = useState("");

  const isProcessing = recordDelivery.isPending || startInnings.isPending;
  function pushBall(entry) {
    setLastBalls((prev) => [...prev.slice(-11), entry]);
  }

  if (matchLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-500 mt-4 text-sm">Loading match...</p>
      </div>
    );
  }

  if (!match) {
    return (
      <div className="bg-white border border-cricket-border rounded-2xl p-12 text-center max-w-lg mx-auto shadow-sm">
        <ShieldAlert className="w-12 h-12 text-emerald-500 mx-auto" />
        <h3 className="text-xl font-bold text-gray-900 mt-3">Match not found</h3>
      </div>
    );
  }

  const teamAInfo = match.team_a;
  const teamBInfo = match.team_b;
  const tossWinnerId = match.toss_winner_id;

  // First-innings batting side (used until the backend starts an innings).
  const firstBattingId =
    match.toss_decision === "bowl"
      ? tossWinnerId === teamAInfo?.id
        ? teamBInfo?.id
        : teamAInfo?.id
      : tossWinnerId || teamAInfo?.id;

  const battingTeamId = scorecard?.batting_team_id || firstBattingId;
  const bowlingTeamId =
    battingTeamId === teamAInfo?.id ? teamBInfo?.id : teamAInfo?.id;

  const battingRoster = rosterOf(
    battingTeamId === teamBInfo?.id ? teamB : teamA,
  );
  const bowlingRoster = rosterOf(
    bowlingTeamId === teamBInfo?.id ? teamB : teamA,
  );
  const nameMap = playersById(battingRoster, bowlingRoster);

  function rosterById(id) {
    return id === teamBInfo?.id ? rosterOf(teamB) : rosterOf(teamA);
  }
  function infoById(id) {
    return id === teamBInfo?.id ? teamBInfo : teamAInfo;
  }

  const oversPerInnings = OVERS_BY_FORMAT[match.match_type] || 20;

  if (scoringLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-500 mt-4 text-sm">
          Loading scoring interface...
        </p>
      </div>
    );
  }

  function buildDelivery(extra) {
    if (!scorecard?.striker_id || !scorecard?.non_striker_id) {
      setActionError("Waiting for the server to set the batting pair.");
      return null;
    }
    if (!selectedBowlerId) {
      setActionError("Select a bowler to bowl this ball.");
      return null;
    }
    return {
      striker_id: scorecard.striker_id,
      non_striker_id: scorecard.non_striker_id,
      bowler_id: selectedBowlerId,
      ...extra,
    };
  }

  const validateAndRun = (payload, successHandler) => {
    if (isProcessing) return;
    const finalPayload = buildDelivery(payload);
    if (!finalPayload) return;
    recordDelivery.mutate(finalPayload, {
      onSuccess: (next) => {
        setActionError("");
        successHandler?.(next);
      },
      onError: (err) => setActionError(extractErrorMessage(err)),
    });
  };

  const handleRecordRuns = (runs) => {
    validateAndRun({ runs_batsman: runs }, () => {
      pushBall({ label: String(runs), style: String(runs) });
    });
  };

  const handleExtrasConfirm = (data) => {
    validateAndRun(
      {
        runs_batsman: data.runs_batsman || 0,
        runs_extras: data.runs_extras,
        extra_type: data.extra_type,
      },
      () => {
        setShowExtrasModal(null);
        pushBall({ label: data.label || data.extra_type, style: data.style });
      },
    );
  };

  const handleWicketConfirm = (data) => {
    validateAndRun(
      {
        wicket_type: data.wicket_type,
        dismissed_player_id: data.dismissed_player_id,
      },
      () => {
        setShowWicketModal(false);
        pushBall({ label: "W", style: "W" });
      },
    );
  };

  // No innings started yet — show the "start innings" call to action.
  if (!scorecard) {
    return (
      <div className="space-y-4 max-w-2xl mx-auto">
        <MatchHeader match={match} scorecard={null} />
        <div className="bg-white border border-cricket-border rounded-2xl p-10 text-center shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto">
            <Play className="w-6 h-6 text-emerald-600" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mt-4">
            Start the First Innings
          </h3>
          <p className="text-sm text-gray-500 mt-1.5 max-w-sm mx-auto">
            Pick the batting side and the batting order, then begin scoring
            ball-by-ball.
          </p>
          <button
            onClick={() => setShowStartInnings(true)}
            className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-semibold transition"
          >
            <Play className="w-4 h-4" />
            Start Innings
          </button>
        </div>

        {showStartInnings && (
          <StartInningsModal
            teamA={teamAInfo}
            teamB={teamBInfo}
            rosterA={rosterOf(teamA)}
            rosterB={rosterOf(teamB)}
            defaultTeamId={firstBattingId}
            isProcessing={startInnings.isPending}
            errorMessage={
              startInnings.isError ? extractErrorMessage(startInnings.error) : ""
            }
            onConfirm={(battingTeamId, order) => {
              setShowStartInnings(false);
              startInnings.mutate(order);
            }}
            onClose={() => setShowStartInnings(false)}
          />
        )}
        {startInnings.isError && (
          <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl text-center text-sm">
            {extractErrorMessage(startInnings.error)}
          </div>
        )}
      </div>
    );
  }

  const isInningsComplete = scorecard.completed;
  const isChase = scorecard.innings_number > 1;
  const ballsRemaining = Math.max(
    0,
    oversPerInnings * 6 - scorecard.legal_balls,
  );
  const requiredRuns = scorecard.target != null
    ? Math.max(0, scorecard.target - scorecard.total)
    : null;
  const currentBowlerId = selectedBowlerId || bowlingRoster[0]?.id;

  return (
    <div className="space-y-3 sm:space-y-4 max-w-4xl mx-auto">
      {actionError && (
        <div className="text-xs font-semibold text-center py-2 px-4 rounded-xl bg-red-50 text-red-600 border border-red-200">
          {actionError}
        </div>
      )}

      <MatchHeader match={match} scorecard={scorecard} />

      <ScoreSummary
        scorecard={scorecard}
        isChase={isChase}
        requiredRuns={requiredRuns}
        ballsRemaining={ballsRemaining}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4">
        <div className="lg:col-span-1 space-y-3 sm:space-y-4 order-2 lg:order-1">
          <BatsmenPanel scorecard={scorecard} nameMap={nameMap} />
          <BowlerPanel
            scorecard={scorecard}
            bowlingRoster={bowlingRoster}
            nameMap={nameMap}
            selectedBowlerId={currentBowlerId}
            onSelectBowler={setSelectedBowlerId}
          />
        </div>

        <div className="lg:col-span-2 space-y-3 sm:space-y-4 order-1 lg:order-2">
          <CurrentOver
            balls={lastBalls}
            oversBowled={scorecard.overs_bowled_str}
          />

          {isInningsComplete ? (
            <InningsSummary
              scorecard={scorecard}
              battingRoster={battingRoster}
              bowlingRoster={bowlingRoster}
              nameMap={nameMap}
              isChase={isChase}
              requiredRuns={requiredRuns}
              canStartNextInnings={scorecard.innings_number < 2}
              onStartNextInnings={() => {
                setSelectedBowlerId("");
                setLastBalls([]);
                setShowStartInnings(true);
              }}
              isProcessing={isProcessing}
            />
          ) : (
            <ScoringControls
              onRecordRuns={handleRecordRuns}
              onOpenExtras={(type) => setShowExtrasModal(type)}
              onOpenWicket={() => setShowWicketModal(true)}
              onOpenScorecard={() => setShowScorecard(true)}
              isProcessing={isProcessing}
            />
          )}
        </div>
      </div>

      {showWicketModal && (
        <WicketModal
          scorecard={scorecard}
          nameMap={nameMap}
          onConfirm={handleWicketConfirm}
          onClose={() => setShowWicketModal(false)}
          isProcessing={isProcessing}
        />
      )}

      {showExtrasModal && (
        <ExtrasModal
          extrasType={showExtrasModal}
          onConfirm={handleExtrasConfirm}
          onClose={() => setShowExtrasModal(null)}
          isProcessing={isProcessing}
        />
      )}

      <ScorecardDrawer
        scorecard={scorecard}
        nameMap={nameMap}
        isOpen={showScorecard}
        onClose={() => setShowScorecard(false)}
      />

      {showStartInnings && (
        <StartInningsModal
          teamA={infoById(bowlingTeamId)}
          teamB={infoById(battingTeamId)}
          rosterA={rosterById(bowlingTeamId)}
          rosterB={rosterById(battingTeamId)}
          defaultTeamId={bowlingTeamId}
          title={`Start Innings ${scorecard.innings_number + 1}`}
          isProcessing={startInnings.isPending}
          errorMessage={
            startInnings.isError ? extractErrorMessage(startInnings.error) : ""
          }
          onConfirm={(id, order) => {
            setShowStartInnings(false);
            startInnings.mutate(order);
          }}
          onClose={() => setShowStartInnings(false)}
        />
      )}
    </div>
  );
}