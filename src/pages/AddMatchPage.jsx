import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AlertCircle, CalendarPlus, ShieldAlert } from "lucide-react";
import { useTeams } from "../hooks/useTeams";
import { useCreateMatch } from "../hooks/useCreateMatch";
import { emptyMatchForm } from "../api/matchSchema";
import { extractErrorMessage } from "../api/client";
import {
  Button,
  Card,
  EmptyState,
  Field,
  Input,
  LoadingState,
  PageHeader,
  SectionHeading,
  Select,
} from "../components/ui";

const MATCH_TYPES = [
  { value: "Test", label: "Test" },
  { value: "ODI", label: "ODI (50 overs)" },
  { value: "T20", label: "T20" },
];

const TOSS_DECISIONS = [
  { value: "bat", label: "bat" },
  { value: "bowl", label: "bowl" },
];

function AddMatchPage() {
  const navigate = useNavigate();
  const { data: teams, isLoading: teamsLoading } = useTeams();
  const createMatch = useCreateMatch();

  const [form, setForm] = useState(emptyMatchForm);
  const [formError, setFormError] = useState("");

  const teamA = teams?.find((t) => t.id === Number(form.team_a_id));
  const teamB = teams?.find((t) => t.id === Number(form.team_b_id));

  function handleChange(field, value) {
    setForm((prev) => {
      const updated = { ...prev, [field]: value };
      // If teams change, reset the toss winner since it must be one of them
      if (field === "team_a_id" || field === "team_b_id") {
        const a = Number(updated.team_a_id);
        const b = Number(updated.team_b_id);
        const winner = Number(updated.toss_winner_id);
        if (winner !== a && winner !== b) updated.toss_winner_id = "";
      }
      return updated;
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setFormError("");

    if (!form.team_a_id || !form.team_b_id) {
      setFormError("Please select both competing teams.");
      return;
    }
    if (form.team_a_id === form.team_b_id) {
      setFormError("Home Squad and Away Squad cannot be the same team.");
      return;
    }
    if (!form.toss_winner_id) {
      setFormError("Please select which team won the toss.");
      return;
    }
    if (!form.toss_decision) {
      setFormError("Please select the toss decision (Bat or Bowl).");
      return;
    }

    try {
      const payload = {
        match_type: form.match_type,
        venue: form.venue,
        match_date: form.match_date,
        match_time: form.match_time,
        team_a_id: Number(form.team_a_id),
        team_b_id: Number(form.team_b_id),
        toss_winner_id: Number(form.toss_winner_id),
        toss_decision: form.toss_decision,
        result: form.result || null,
        referee_1_name: form.referee_1_name || null,
        referee_2_name: form.referee_2_name || null,
        match_referee_name: form.match_referee_name || null,
      };
      const newMatch = await createMatch.mutateAsync(payload);
      navigate(`/matches/${newMatch.id}`);
    } catch (err) {
      setFormError(extractErrorMessage(err));
    }
  }

  if (teamsLoading) {
    return <LoadingState label="Initializing matchup configs…" />;
  }

  if (!teams || teams.length < 2) {
    return (
      <EmptyState
        icon={<ShieldAlert className="size-6 text-warning" aria-hidden="true" />}
        title="Insufficient Teams"
        description="You need at least 2 teams created before you can schedule a match."
        action={
          <Button as={Link} to="/teams/new">
            <CalendarPlus className="size-4" aria-hidden="true" />
            Register First Team
          </Button>
        }
      />
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader
        breadcrumbs={[{ label: "Matches", to: "/matches" }, { label: "New" }]}
        title="Schedule New Match"
        description="Configure venues, competing teams, toss outcome and match officials."
      />

      <Card className="p-6 md:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <Field label="Match Category / Format" required>
            <Select
              name="match_type"
              value={form.match_type}
              onChange={(event) => handleChange("match_type", event.target.value)}
            >
              <option value="">Select match type</option>
              {MATCH_TYPES.map((matchType) => (
                <option key={matchType.value} value={matchType.value}>
                  {matchType.label}
                </option>
              ))}
            </Select>
          </Field>

          <Field label="Arena / Venue" required>
            <Input
              name="venue"
              autoComplete="off"
              placeholder="e.g. M. A. Chidambaram Stadium, Chennai"
              value={form.venue}
              onChange={(event) => handleChange("venue", event.target.value)}
            />
          </Field>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Match Date" required>
              <Input
                name="match_date"
                type="date"
                value={form.match_date}
                onChange={(event) =>
                  handleChange("match_date", event.target.value)
                }
              />
            </Field>

            <Field label="Start Time" required>
              <Input
                name="match_time"
                type="time"
                value={form.match_time}
                onChange={(event) =>
                  handleChange("match_time", event.target.value)
                }
              />
            </Field>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Home Squad (Team A)" required>
              <Select
                name="team_a_id"
                value={form.team_a_id}
                onChange={(event) =>
                  handleChange("team_a_id", event.target.value)
                }
              >
                <option value="">Select Home Team</option>
                {teams
                  .filter((t) => !form.team_b_id || t.id !== Number(form.team_b_id))
                  .map((team) => (
                    <option key={team.id} value={team.id}>
                      {team.name}
                    </option>
                  ))}
              </Select>
            </Field>

            <Field label="Away Squad (Team B)" required>
              <Select
                name="team_b_id"
                value={form.team_b_id}
                onChange={(event) =>
                  handleChange("team_b_id", event.target.value)
                }
              >
                <option value="">Select Away Team</option>
                {teams
                  .filter((t) => !form.team_a_id || t.id !== Number(form.team_a_id))
                  .map((team) => (
                    <option key={team.id} value={team.id}>
                      {team.name}
                    </option>
                  ))}
              </Select>
            </Field>
          </div>

          {/* Toss outcome */}
          <div className="rounded-card border border-line bg-surface-sunken p-4">
            <SectionHeading title="Toss Outcome" />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Toss Won By" required>
                <Select
                  name="toss_winner_id"
                  value={form.toss_winner_id}
                  onChange={(event) =>
                    handleChange("toss_winner_id", event.target.value)
                  }
                >
                  <option value="">Select toss winner</option>
                  {teamA && <option value={teamA.id}>{teamA.name}</option>}
                  {teamB && <option value={teamB.id}>{teamB.name}</option>}
                </Select>
              </Field>

              <Field label="Toss Decision" required>
                <Select
                  name="toss_decision"
                  value={form.toss_decision}
                  onChange={(event) =>
                    handleChange("toss_decision", event.target.value)
                  }
                >
                  <option value="">--</option>
                  {TOSS_DECISIONS.map((decision) => (
                    <option key={decision.value} value={decision.value}>
                      {decision.label}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>
          </div>

          {/* Match officials */}
          <div className="rounded-card border border-line bg-surface-sunken p-4">
            <SectionHeading title="Match Officials" />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Umpire 1">
                <Input
                  name="referee_1_name"
                  autoComplete="off"
                  placeholder="e.g. Kumar Dharmasena"
                  value={form.referee_1_name}
                  onChange={(event) =>
                    handleChange("referee_1_name", event.target.value)
                  }
                />
              </Field>

              <Field label="Umpire 2">
                <Input
                  name="referee_2_name"
                  autoComplete="off"
                  placeholder="e.g. Richard Illingworth"
                  value={form.referee_2_name}
                  onChange={(event) =>
                    handleChange("referee_2_name", event.target.value)
                  }
                />
              </Field>
            </div>

            <div className="mt-4">
              <Field label="Match Referee">
                <Input
                  name="match_referee_name"
                  autoComplete="off"
                  placeholder="e.g. Javagal Srinath"
                  value={form.match_referee_name}
                  onChange={(event) =>
                    handleChange("match_referee_name", event.target.value)
                  }
                />
              </Field>
            </div>
          </div>

          <Field
            label="Match Result"
            hint="Optional — usually set once the match is played."
          >
            <Input
              name="result"
              autoComplete="off"
              placeholder="e.g. India won by 6 wickets"
              value={form.result}
              onChange={(event) => handleChange("result", event.target.value)}
            />
          </Field>

          {formError && (
            <p
              role="alert"
              className="flex items-start gap-2 rounded-card border border-danger-line bg-danger-bg px-4 py-3 text-sm text-danger"
            >
              <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              {formError}
            </p>
          )}

          <div className="flex flex-col-reverse gap-3 border-t border-line pt-5 sm:flex-row sm:items-center sm:justify-between">
            <Button as={Link} to="/matches" variant="ghost">
              Back to Matches
            </Button>
            <Button type="submit" loading={createMatch.isPending}>
              <CalendarPlus className="size-4" aria-hidden="true" />
              {createMatch.isPending
                ? "Creating match fixture…"
                : "Schedule Match"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

export default AddMatchPage;