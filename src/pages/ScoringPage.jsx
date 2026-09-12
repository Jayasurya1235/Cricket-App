import { useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import {
  useScoringState,
  useRecordDelivery,
  useRecordWicket,
  useSwapStriker,
  useUndo,
  useEndOver,
} from "../hooks/useScoring";
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
import { ShieldAlert } from "lucide-react";

export default function ScoringPage() {
  const { matchId } = useParams();

  const { data: state, isLoading, isError, error } = useScoringState(matchId);
  const recordDelivery = useRecordDelivery(matchId);
  const recordWicket = useRecordWicket(matchId);
  const swapStriker = useSwapStriker(matchId);
  const undo = useUndo(matchId);
  const endOver = useEndOver(matchId);

  const [showWicketModal, setShowWicketModal] = useState(false);
  const [showExtrasModal, setShowExtrasModal] = useState(null);
  const [showScorecard, setShowScorecard] = useState(false);

  const isProcessing =
    recordDelivery.isPending ||
    recordWicket.isPending ||
    swapStriker.isPending ||
    undo.isPending ||
    endOver.isPending;

  const handleRecordRuns = useCallback(
    (runs) => {
      if (isProcessing) return;
      recordDelivery.mutate({ runs, extras_type: null });
    },
    [recordDelivery, isProcessing]
  );

  const handleExtrasConfirm = useCallback(
    (data) => {
      if (isProcessing) return;
      recordDelivery.mutate(data, {
        onSuccess: () => setShowExtrasModal(null),
      });
    },
    [recordDelivery, isProcessing]
  );

  const handleWicketConfirm = useCallback(
    (data) => {
      if (isProcessing) return;
      recordWicket.mutate(data, {
        onSuccess: () => setShowWicketModal(false),
      });
    },
    [recordWicket, isProcessing]
  );

  const handleSwapStriker = useCallback(() => {
    if (isProcessing) return;
    swapStriker.mutate();
  }, [swapStriker, isProcessing]);

  const handleUndo = useCallback(() => {
    if (isProcessing) return;
    undo.mutate();
  }, [undo, isProcessing]);

  const handleEndOver = useCallback(() => {
    if (isProcessing) return;
    endOver.mutate();
  }, [endOver, isProcessing]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-500 mt-4 text-sm">Loading scoring interface...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl max-w-lg mx-auto text-center">
        <ShieldAlert className="w-8 h-8 mx-auto mb-2 text-red-500" />
        <h4 className="font-bold">Failed to load scoring state</h4>
        <p className="text-sm mt-1">{error?.message || "Unknown error"}</p>
      </div>
    );
  }

  if (!state) {
    return (
      <div className="bg-white border border-cricket-border rounded-2xl p-12 text-center max-w-lg mx-auto space-y-3 shadow-sm">
        <ShieldAlert className="w-12 h-12 text-emerald-500 mx-auto" />
        <h3 className="text-xl font-bold text-gray-900">Match not found</h3>
      </div>
    );
  }

  const isMatchCompleted = state.match_completed;

  return (
    <div className="space-y-3 sm:space-y-4 max-w-4xl mx-auto">
      {/* Toast for action results */}
      {state.last_action_result && (
        <div
          className={`text-xs font-semibold text-center py-2 px-4 rounded-xl transition-all duration-300 ${
            state.last_action_result.success
              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
              : "bg-red-50 text-red-600 border border-red-200"
          }`}
          key={JSON.stringify(state.last_action_result)}
        >
          {state.last_action_result.message}
        </div>
      )}

      {/* Match Header */}
      <MatchHeader state={state} matchId={matchId} />

      {/* Score Summary Stats */}
      <ScoreSummary state={state} />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4">
        {/* Left Column: Batsmen + Bowler */}
        <div className="lg:col-span-1 space-y-3 sm:space-y-4 order-2 lg:order-1">
          <BatsmenPanel state={state} onSwapStriker={handleSwapStriker} />
          <BowlerPanel state={state} />
        </div>

        {/* Right Column: Current Over + Scoring Controls */}
        <div className="lg:col-span-2 space-y-3 sm:space-y-4 order-1 lg:order-2">
          <CurrentOver state={state} />

          {isMatchCompleted ? (
            <InningsSummary
              state={state}
              onContinue={() => {}}
              isProcessing={isProcessing}
            />
          ) : (
            <ScoringControls
              onRecordRuns={handleRecordRuns}
              onOpenExtras={(type) => setShowExtrasModal(type)}
              onOpenWicket={() => setShowWicketModal(true)}
              onUndo={handleUndo}
              onEndOver={handleEndOver}
              onOpenScorecard={() => setShowScorecard(true)}
              canUndo={state.can_undo}
              isProcessing={isProcessing}
            />
          )}
        </div>
      </div>

      {/* Modals */}
      {showWicketModal && (
        <WicketModal
          state={state}
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

      {/* Scorecard Drawer */}
      <ScorecardDrawer
        state={state}
        isOpen={showScorecard}
        onClose={() => setShowScorecard(false)}
      />
    </div>
  );
}
