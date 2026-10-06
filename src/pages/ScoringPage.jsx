import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { useMatch } from "../hooks/useMatch";
import { useTeam } from "../hooks/useTeam";
import {
  useScoringState,
  useStartInnings,
  useRecordDelivery,
  useAddBatsman,
} from "../hooks/useScoring";
import { extractErrorMessage } from "../api/client";
import { mergeTeam } from "../utils/teams";
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
import NextBatsmanPanel from "../components/scoring/NextBatsmanPanel";
import {
  BALLS_PER_OVER,
  describeDelivery,
  deliveryWasLegal,
  isAwaitingBatsman,
  nextBatsmanChoices,
  needsNewBowler as computeNeedsNewBowler,
  ineligibleBowlerId as computeIneligibleBowlerId,
} from "../utils/scoring";
import { ShieldAlert, Play } from "lucide-react";

const OVERS_BY_FORMAT = { T20: 20, ODI: 50, Test: 90 };
const MAX_LOG_ENTRIES = 60;

// The team detail response splits the squad by role: playing_11, substitutes
// and bench. Only the Playing XI can be given a batting order, so substitutes
// and bench players are deliberately excluded here. A previous version also
// accepted a `team.players` array, which the API never returns.
function rosterOf(team) {
  if (!team) return [];
  // Combine all squad members - playing XI, substitutes, bench etc.
  if (Array.isArray(team.players) && team.players.length > 0) {
    return team.players;
  }
  const combined = [];
  if (Array.isArray(team.playing_11)) combined.push(...team.playing_11);
  if (Array.isArray(team.substitutes)) combined.push(...team.substitutes);
  if (Array.isArray(team.bench)) combined.push(...team.bench);
  return combined;
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
  const { data: scorecard, isLoading: scoringLoading, isError: scoringError, error: scoringErrorObj } = useScoringState(matchId);
  const startInnings = useStartInnings(matchId);
  const recordDelivery = useRecordDelivery(matchId);
  const addBatsman = useAddBatsman(matchId);

  const [showStartInnings, setShowStartInnings] = useState(false);
  const [selectedBowlerId, setSelectedBowlerId] = useState("");
  const [lastBalls, setLastBalls] = useState([]);
  const [lastWicketType, setLastWicketType] = useState(null);
  const [showWicketModal, setShowWicketModal] = useState(false);
  const [showExtrasModal, setShowExtrasModal] = useState(null);
  const [showScorecard, setShowScorecard] = useState(false);
  const [actionError, setActionError] = useState("");
  const [startInningsNotice, setStartInningsNotice] = useState("");

  // The delivery log is display-only (the backend exposes no ball-by-ball
  // history). It is scoped to one innings, so remember which innings it
  // belongs to and drop it when the innings changes.
  const logInningsId = useRef(null);
  const deliverySeq = useRef(0);

  const isProcessing =
    recordDelivery.isPending || startInnings.isPending || addBatsman.isPending;

  // ---- server-derived scoring state -------------------------------------
  const overDone = computeNeedsNewBowler(scorecard);
  const blockedBowlerId = computeIneligibleBowlerId(scorecard);

  // Drop the log whenever the server moves to a different innings.
  useEffect(() => {
    if (!scorecard?.innings_id) return;
    if (logInningsId.current !== scorecard.innings_id) {
      logInningsId.current = scorecard.innings_id;
      setLastBalls([]);
      setLastWicketType(null);
    }
  }, [scorecard?.innings_id]);

  // StartInningsRequest only carries `batting_order` - there is no team field
  // in the contract - so the chosen batting team cannot be sent explicitly.
  //
  // Two things follow from that, and both used to be broken:
  //
  //  1. The modal must NOT close on submit. It used to call setShowStartInnings
  //     (false) before the request resolved, so any failure (409 when an
  //     innings already exists, a network drop, a rejected order) threw away
  //     the 11-player order the scorer had just built and dumped the error in
  //     a banner outside the now-closed dialog. Keep the dialog open, let its
  //     own isProcessing/errorMessage props show the failure, and close only
  //     once the server has actually accepted it.
  //
  //  2. Because the pick is not transmitted, reconcile it against the
  //     response. ScorecardResponse.batting_team_id is the authoritative
  //     answer, so if the server started the innings for the other team the
  //     scorer must be told instead of silently getting the wrong side.
  function handleStartInnings(battingTeamId, order) {
    setStartInningsNotice("");
    startInnings.mutate(order, {
      onSuccess: (data) => {
        const actual = data?.batting_team_id;
        if (actual != null && Number(battingTeamId) !== Number(actual)) {
          const actualName =
            infoById(actual)?.short_name || infoById(actual)?.name || `team #${actual}`;
          setStartInningsNotice(
            `The server started the innings for ${actualName}, not the side you selected. The batting order was applied to ${actualName}.`,
          );
        }
        setShowStartInnings(false);
      },
    });
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

  // The match payload only embeds { id, name, short_name } per side, with no
  // logo. useTeam() above returns the full record, so merge it in — every
  // team label on this screen then carries the uploaded crest.
  const teamAInfo = mergeTeam(match.team_a, teamA);
  const teamBInfo = mergeTeam(match.team_b, teamB);
  const tossWinnerId = match.toss_winner_id;

  // First-innings batting side (used until the backend starts an innings).
  // The spec types toss_decision as a free string, so compare case-insensitively.
  const tossChoseToBowl =
    String(match.toss_decision ?? "").trim().toLowerCase() === "bowl";
  const firstBattingId = tossChoseToBowl
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

  // After a wicket the server clears striker_id and sets `awaiting_batsman`
  // while it waits for a replacement. That waiting state must never be
  // mistaken for a finished innings, and a finished innings must never be
  // mistaken for a waiting state, so the two are resolved independently below.
  const nextBatsmen = nextBatsmanChoices(scorecard, {
    roster: battingRoster,
  });
  // Trust the server's own `awaiting_batsman` flag. Do NOT also require
  // `!order_exhausted`: the backend sets that flag straight after a wicket even
  // though batters are still to come, and gating on it would hide this panel
  // and strand the innings with no striker.
  // A completed innings always wins: the server can leave `awaiting_batsman`
  // set on the final wicket, and "Innings Complete" must still be shown.
  const needsNewBatsman = Boolean(
    scorecard && !scorecard.completed && isAwaitingBatsman(scorecard),
  );

  function rosterById(id) {
    return id === teamBInfo?.id ? rosterOf(teamB) : rosterOf(teamA);
  }
  function infoById(id) {
    return id === teamBInfo?.id ? teamBInfo : teamAInfo;
  }

  // Prefer the server's own over limit; fall back to the match format.
  const oversPerInnings =
    scorecard?.max_overs ?? OVERS_BY_FORMAT[match.match_type] ?? 20;

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

  // The bowler that will actually bowl. A bowler who just completed an over is
  // never eligible. When a new over is due we deliberately do NOT auto-pick a
  // replacement: the scorer has to choose, so the "Over finished" message is
  // surfaced instead of a silent bowler change.
  const firstEligibleBowler = bowlingRoster.find(
    (p) => blockedBowlerId == null || p.id !== blockedBowlerId,
  );
  const storedBowlerId = Number(selectedBowlerId) || null;
  const storedIsIneligible =
    blockedBowlerId != null && storedBowlerId === blockedBowlerId;
  const activeBowlerId =
    (storedBowlerId && !storedIsIneligible ? storedBowlerId : null) ||
    (overDone ? null : firstEligibleBowler?.id) ||
    null;

  function pushDelivery(payload, prevScorecard, nextScorecard) {
    const isLegal = deliveryWasLegal(prevScorecard, nextScorecard, {
      bowlerId: payload.bowler_id,
      extraType: payload.extra_type,
    });
    deliverySeq.current += 1;
    const entry = describeDelivery(payload, {
      isLegal,
      bowlerId: payload.bowler_id,
      strikerId: payload.striker_id,
      id: `d${deliverySeq.current}`,
    });
    setLastBalls((prev) => [...prev, entry].slice(-MAX_LOG_ENTRIES));
    if (entry.isWicket) setLastWicketType(entry.wicketType);
  }

  function buildDelivery(extra) {
    if (scorecard?.completed) {
      setActionError("This innings is already complete.");
      return null;
    }
    if (needsNewBatsman) {
      setActionError("Select the next batsman to continue the innings.");
      return null;
    }
    if (scorecard?.striker_id == null) {
      setActionError("Select the next batsman to continue the innings.");
      return null;
    }
    if (scorecard?.non_striker_id == null) {
      setActionError("Waiting for the server to set the batting pair.");
      return null;
    }
    // A bowler may not bowl two overs in a row. This covers both "nobody
    // chosen yet for the new over" and "the same bowler picked again".
    if (
      overDone &&
      (activeBowlerId == null || activeBowlerId === blockedBowlerId)
    ) {
      setActionError("Over finished. Please choose a different bowler.");
      return null;
    }
    if (!activeBowlerId) {
      setActionError("Select a bowler to bowl this ball.");
      return null;
    }
    return {
      striker_id: scorecard.striker_id,
      non_striker_id: scorecard.non_striker_id,
      bowler_id: activeBowlerId,
      ...extra,
    };
  }

  const validateAndRun = (payload, successHandler) => {
    if (isProcessing) return;
    const prevScorecard = scorecard;
    const finalPayload = buildDelivery(payload);
    if (!finalPayload) return;
    recordDelivery.mutate(finalPayload, {
      onSuccess: (next) => {
        setActionError("");
        pushDelivery(finalPayload, prevScorecard, next);
        successHandler?.(next);
      },
      onError: (err) => setActionError(extractErrorMessage(err)),
    });
  };

  const handleRecordRuns = (runs) => {
    validateAndRun({ runs_batsman: runs, runs_extras: 0, extra_type: "none" });
  };

  const handleExtrasConfirm = (data) => {
    validateAndRun(
      {
        runs_batsman: data.runs_batsman || 0,
        runs_extras: data.runs_extras,
        extra_type: data.extra_type,
      },
      () => setShowExtrasModal(null),
    );
  };

  const handleWicketConfirm = (data) => {
    validateAndRun(
      {
        runs_batsman: 0,
        runs_extras: 0,
        extra_type: "none",
        wicket_type: data.wicket_type,
        dismissed_player_id: data.dismissed_player_id,
      },
      () => setShowWicketModal(false),
    );
  };

  const handleSelectNextBatsman = (playerId) => {
    if (isProcessing) return;
    setActionError("");
    addBatsman.mutate(playerId, {
      onSuccess: () => setLastWicketType(null),
      onError: (err) => setActionError(extractErrorMessage(err)),
    });
  };

  if (scoringError) {
    const status = scoringErrorObj?.response?.status;
    const raw = scoringErrorObj?.response?.data;
    // The server can fail without a `detail` field, in which case the generic
    // message hides the reason entirely. Surface whatever actually came back.
    const body =
      raw && typeof raw === "string"
        ? raw.slice(0, 180)
        : raw && typeof raw === "object"
          ? JSON.stringify(raw).slice(0, 180)
          : "";
    return (
      <div className="max-w-md mx-auto mt-10 bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
        <ShieldAlert className="w-8 h-8 text-red-500 mx-auto" />
        <h3 className="text-sm font-bold text-red-800 mt-3">
          Could not load the scorecard
        </h3>
        {status ? (
          <p className="text-[10px] font-bold text-red-400 mt-1">
            HTTP {status}
          </p>
        ) : null}
        <p className="text-xs text-red-600 mt-1.5">
          {extractErrorMessage(scoringErrorObj)}
        </p>
        {body && (
          <pre className="mt-2 text-[10px] text-red-500 bg-white/70 border border-red-100 rounded-lg p-2 text-left whitespace-pre-wrap break-all">
            {body}
          </pre>
        )}
        <p className="text-[11px] text-red-500 mt-3">
          Scoring is paused until this is resolved, so no deliveries are lost.
        </p>
      </div>
    );
  }

  // No innings started yet — show the "start innings" call to action.
  if (!scorecard) {
    return (
      <div className="space-y-4 max-w-2xl mx-auto">
        <MatchHeader match={match} scorecard={null} teamA={teamAInfo} teamB={teamBInfo} />
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
            open
            teamA={teamAInfo}
            teamB={teamBInfo}
            rosterA={rosterOf(teamA)}
            rosterB={rosterOf(teamB)}
            defaultTeamId={firstBattingId}
            isProcessing={startInnings.isPending}
            errorMessage={
              startInnings.isError ? extractErrorMessage(startInnings.error) : ""
            }
            onConfirm={handleStartInnings}
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

  const isInningsComplete = Boolean(scorecard.completed);
  const isChase = scorecard.innings_number > 1;
  const ballsRemaining = Math.max(
    0,
    oversPerInnings * BALLS_PER_OVER - (scorecard.legal_balls ?? 0),
  );
  const requiredRuns =
    scorecard.target != null
      ? Math.max(0, scorecard.target - scorecard.total)
      : null;

  const canScore = !isInningsComplete && !needsNewBatsman;

  // One polite live region carries every score change. The Recent Balls strip
  // is intentionally not a live region, so a delivery is announced once here
  // instead of twice.
  const liveScoreMessage = !scorecard
    ? ""
    : isInningsComplete
      ? `Innings complete. ${scorecard.total} for ${scorecard.wickets} in ${scorecard.overs_bowled_str} overs.`
      : needsNewBatsman
        ? `Wicket down. ${scorecard.total} for ${scorecard.wickets} in ${scorecard.overs_bowled_str} overs. Choose the next batsman.`
        : `${scorecard.total} for ${scorecard.wickets} in ${scorecard.overs_bowled_str} overs.`;

  return (
    <div className="space-y-3 sm:space-y-4 max-w-4xl mx-auto">
      {actionError && (
        <div
          role="alert"
          className="text-xs font-semibold text-center py-2 px-4 rounded-xl bg-red-50 text-red-600 border border-red-200"
        >
          {actionError}
        </div>
      )}
      {startInningsNotice && (
        <div
          role="status"
          className="text-xs font-semibold text-center py-2 px-4 rounded-xl bg-amber-50 text-amber-800 border border-amber-200"
        >
          {startInningsNotice}
        </div>
      )}
      {startInnings.isError && (
        <div
          role="alert"
          className="text-xs font-semibold text-center py-2 px-4 rounded-xl bg-red-50 text-red-600 border border-red-200"
        >
          {extractErrorMessage(startInnings.error)}
        </div>
      )}

      <p aria-live="polite" aria-atomic="true" className="sr-only">
        {liveScoreMessage}
      </p>

      <MatchHeader match={match} scorecard={scorecard} teamA={teamAInfo} teamB={teamBInfo} />

      <ScoreSummary
        scorecard={scorecard}
        isChase={isChase}
        requiredRuns={requiredRuns}
        ballsRemaining={ballsRemaining}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4">
        <div className="lg:col-span-1 space-y-3 sm:space-y-4 order-2 lg:order-1">
          <BatsmenPanel scorecard={scorecard} nameMap={nameMap} />

          {needsNewBatsman && (
            <NextBatsmanPanel
              choices={nextBatsmen}
              nameMap={nameMap}
              onSelect={handleSelectNextBatsman}
              isProcessing={isProcessing}
              wicketType={lastWicketType}
            />
          )}

          {!needsNewBatsman && (
            <BowlerPanel
              scorecard={scorecard}
              bowlingRoster={bowlingRoster}
              selectedBowlerId={activeBowlerId}
              onSelectBowler={setSelectedBowlerId}
              ineligibleBowlerId={blockedBowlerId}
              needsNewBowler={overDone}
            />
          )}
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
                setLastWicketType(null);
                setShowStartInnings(true);
              }}
              isProcessing={isProcessing}
              onOpenScorecard={() => setShowScorecard(true)}
            />
          ) : (
            <ScoringControls
              onRecordRuns={handleRecordRuns}
              onOpenExtras={(type) => setShowExtrasModal(type)}
              onOpenWicket={() => setShowWicketModal(true)}
              onOpenScorecard={() => setShowScorecard(true)}
              isProcessing={isProcessing}
              canScore={canScore}
              blockedReason={
                needsNewBatsman
                  ? "Choose the next batsman to continue scoring"
                  : null
              }
            />
          )}
        </div>
      </div>

      {showWicketModal && (
        <WicketModal
          open
          scorecard={scorecard}
          nameMap={nameMap}
          onConfirm={handleWicketConfirm}
          onClose={() => setShowWicketModal(false)}
          isProcessing={isProcessing}
        />
      )}

      {showExtrasModal && (
        <ExtrasModal
          open
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
          open
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
          onConfirm={handleStartInnings}
          onClose={() => setShowStartInnings(false)}
        />
      )}
    </div>
  );
}
