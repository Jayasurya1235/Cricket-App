import { useState } from "react";
import { Link } from "react-router-dom";
import { Handshake } from "lucide-react";
import { useMatchPartnerships } from "../../hooks/useMatchPartnerships";
import { extractErrorMessage } from "../../api/client";
import { formatStat } from "../../utils/analytics";
import { AnalyticsSection, DataTable, StatGrid, StatTile } from "../analytics";
import { Badge, Field, LoadingState, Select } from "../ui";

function pickInnings(analysis, inningsNumber) {
  const innings = analysis?.innings;
  if (!Array.isArray(innings) || innings.length === 0) return null;
  return innings.find((i) => Number(i.innings_number) === Number(inningsNumber)) ?? innings[0];
}

function batterLink(id, name) {
  if (id == null) return name || "—";
  return (
    <Link
      to={`/players/${id}`}
      className="font-medium text-ink transition-colors hover:text-brand-700 hover:underline"
    >
      {name || `Player #${id}`}
    </Link>
  );
}

export default function PartnershipsPanel({ matchId, teams, inningsModels }) {
  const battingInnings = (inningsModels ?? []).filter(
    (innings) => innings?.innings_number != null,
  );

  const teamLabel = (teamId) => {
    const team = (teams ?? []).find((t) => String(t.id) === String(teamId));
    return team?.short_name || team?.name || (teamId != null ? `Team ${teamId}` : "");
  };

  const [inningsNumber, setInningsNumber] = useState(
    () => battingInnings[0]?.innings_number ?? null,
  );
  const effectiveInnings = battingInnings.some(
    (i) => Number(i.innings_number) === Number(inningsNumber),
  )
    ? inningsNumber
    : (battingInnings[0]?.innings_number ?? null);

  const { data, isLoading, isError, error } = useMatchPartnerships(
    matchId,
    effectiveInnings,
  );

  if (battingInnings.length === 0) {
    return (
      <p className="rounded-card border border-dashed border-line-strong bg-surface-muted/40 px-4 py-8 text-center text-[13px] text-ink-subtle">
        Partnerships appear once the innings have been scored.
      </p>
    );
  }

  const innings = pickInnings(data, effectiveInnings);
  const partnerships = innings?.partnerships ?? [];
  const highest = data?.highest_partnership;

  const columns = [
    {
      key: "partnership_number",
      header: "#",
      className: "w-8 text-ink-faint",
      render: (row) => row.partnership_number,
    },
    {
      key: "batters",
      header: "Batters",
      render: (row) => (
        <span className="flex flex-col gap-0.5">
          <span>
            {batterLink(row.batsman_1_id, row.batsman_1_name)}
          </span>
          <span className="text-ink-subtle">
            {batterLink(row.batsman_2_id, row.batsman_2_name)}
          </span>
        </span>
      ),
    },
    {
      key: "runs",
      header: "Runs",
      align: "right",
      render: (row) => <span className="font-bold text-ink">{row.runs}</span>,
    },
    {
      key: "balls",
      header: "Balls",
      align: "right",
      render: (row) => row.balls ?? "—",
    },
    {
      key: "run_rate",
      header: "RR",
      align: "right",
      render: (row) => formatStat(row.run_rate),
    },
    {
      key: "for_wicket",
      header: "Wkt",
      align: "right",
      render: (row) => row.for_wicket ?? "—",
    },
    {
      key: "status",
      header: "Stand",
      render: (row) =>
        row.unbroken ? (
          <Badge tone="success">unbroken</Badge>
        ) : (
          <span className="text-ink-subtle">
            {row.player_out_name ? `out: ${row.player_out_name}` : "ended"}
          </span>
        ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="w-full max-w-xs">
        <Field label="Innings">
          <Select
            value={effectiveInnings ?? ""}
            onChange={(event) => setInningsNumber(Number(event.target.value))}
          >
            {battingInnings.map((inn) => (
              <option key={inn.innings_number} value={inn.innings_number}>
                Innings {inn.innings_number}
                {inn.is_super_over ? " (Super Over)" : ""} · {teamLabel(inn.batting_team_id)}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      {isError && (
        <p className="rounded-card border border-danger-line bg-danger-bg px-4 py-3 text-[13px] text-danger">
          {extractErrorMessage(error)}
        </p>
      )}

      <AnalyticsSection
        icon={Handshake}
        title="Partnership summary"
        description="How the batting side rebuilt through each stand."
      >
        {isLoading ? (
          <LoadingState compact label="Loading partnerships…" />
        ) : (
          <StatGrid columns={3}>
            <StatTile label="Partnerships" value={formatStat(innings?.partnership_count)} />
            <StatTile
              label="Opening stand"
              value={formatStat(innings?.opening_partnership)}
              tone="brand"
            />
            <StatTile
              label="Highest stand"
              value={formatStat(innings?.highest_partnership)}
              tone="success"
            />
          </StatGrid>
        )}
      </AnalyticsSection>

      {highest && (
        <div className="rounded-card border border-brand-200 bg-brand-50/60 p-5">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-brand-700">
            Biggest partnership
          </p>
          <p className="mt-1 text-lg font-bold text-ink">
            {(highest.runs ?? 0) + " runs"}
            <span className="ml-2 text-sm font-medium text-ink-subtle">
              ({highest.balls != null ? `${highest.balls} balls` : "—"})
            </span>
          </p>
          <p className="mt-0.5 text-sm text-ink-muted">
            {batterLink(highest.batsman_1_id, highest.batsman_1_name)} &amp;{" "}
            {batterLink(highest.batsman_2_id, highest.batsman_2_name)}
          </p>
        </div>
      )}

      <AnalyticsSection
        icon={Handshake}
        title="Partnership breakdown"
        description="Every stand in the innings, in batting order."
      >
        {isLoading ? (
          <LoadingState compact label="Loading partnerships…" />
        ) : (
          <DataTable
            caption="Partnership breakdown"
            columns={columns}
            rows={partnerships}
            getRowKey={(row) => row.partnership_number}
            empty="No partnerships recorded for this innings."
          />
        )}
      </AnalyticsSection>
    </div>
  );
}
