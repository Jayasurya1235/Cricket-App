import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { AlertCircle, Trophy } from "lucide-react";
import { useLevels } from "../hooks/useLevels";
import { useTournament } from "../hooks/useTournament";
import {
  useCreateTournament,
  useUpdateTournament,
} from "../hooks/useTournamentMutations";
import { extractErrorMessage } from "../api/client";
import {
  Button,
  Card,
  ErrorState,
  Field,
  Input,
  LoadingState,
  PageHeader,
  SectionHeading,
  Select,
  Textarea,
} from "../components/ui";

const FORMATS = [
  { value: "league", label: "League (round robin)" },
  { value: "knockout", label: "Knockout" },
  { value: "league_knockout", label: "League + Knockout" },
];

const STATUSES = [
  { value: "upcoming", label: "Upcoming" },
  { value: "ongoing", label: "Ongoing" },
  { value: "completed", label: "Completed" },
];

const EMPTY_FORM = {
  name: "",
  description: "",
  level_id: "",
  format: "league",
  status: "upcoming",
  start_date: "",
  end_date: "",
  points_win: "2",
  points_tie: "1",
  points_loss: "0",
  points_no_result: "1",
};

function buildInitial(tournament) {
  if (!tournament) return EMPTY_FORM;
  return {
    name: tournament.name ?? "",
    description: tournament.description ?? "",
    level_id: tournament.level_id ?? "",
    format: tournament.format ?? "league",
    status: tournament.status ?? "upcoming",
    start_date: tournament.start_date ?? "",
    end_date: tournament.end_date ?? "",
    points_win:
      tournament.points_win != null ? String(tournament.points_win) : "2",
    points_tie:
      tournament.points_tie != null ? String(tournament.points_tie) : "1",
    points_loss:
      tournament.points_loss != null ? String(tournament.points_loss) : "0",
    points_no_result:
      tournament.points_no_result != null
        ? String(tournament.points_no_result)
        : "1",
  };
}

function TournamentForm({ tournament, isEdit, tournamentId }) {
  const navigate = useNavigate();
  const { data: levels } = useLevels();
  const createTournament = useCreateTournament();
  const updateTournament = useUpdateTournament();

  const [form, setForm] = useState(() => buildInitial(tournament));
  const [formError, setFormError] = useState("");

  const isPending = createTournament.isPending || updateTournament.isPending;

  function handleChange(field, value) {
    setForm((previous) => ({ ...previous, [field]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setFormError("");

    if (!String(form.name).trim()) {
      setFormError("Tournament name is required.");
      return;
    }

    const payload = {
      name: form.name.trim(),
      description: form.description || null,
      level_id: form.level_id ? Number(form.level_id) : null,
      format: form.format,
      status: form.status,
      start_date: form.start_date || null,
      end_date: form.end_date || null,
      points_win: Number(form.points_win),
      points_tie: Number(form.points_tie),
      points_loss: Number(form.points_loss),
      points_no_result: Number(form.points_no_result),
    };

    try {
      if (isEdit) {
        await updateTournament.mutateAsync({ id: tournamentId, data: payload });
        navigate(`/tournaments/${tournamentId}`);
      } else {
        const created = await createTournament.mutateAsync(payload);
        navigate(`/tournaments/${created.id}`);
      }
    } catch (err) {
      setFormError(extractErrorMessage(err));
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        breadcrumbs={[
          { label: "Tournaments", to: "/tournaments" },
          ...(isEdit
            ? [
                {
                  label: tournament?.name ?? "Tournament",
                  to: `/tournaments/${tournamentId}`,
                },
              ]
            : []),
          { label: isEdit ? "Edit" : "New" },
        ]}
        title={isEdit ? "Edit tournament" : "Create a tournament"}
        description={
          isEdit
            ? "Update the format, dates and points configuration."
            : "Set up a league or cup, then add teams and generate fixtures."
        }
      />

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <Field label="Tournament name" required>
            <Input
              name="name"
              autoComplete="off"
              placeholder="e.g. Winter Premier League"
              value={form.name}
              onChange={(event) => handleChange("name", event.target.value)}
            />
          </Field>

          <Field label="Description">
            <Textarea
              name="description"
              placeholder="Short summary shown on the tournament page."
              value={form.description}
              onChange={(event) => handleChange("description", event.target.value)}
            />
          </Field>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Format">
              <Select
                name="format"
                value={form.format}
                onChange={(event) => handleChange("format", event.target.value)}
              >
                {FORMATS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </Field>

            <Field label="Status">
              <Select
                name="status"
                value={form.status}
                onChange={(event) => handleChange("status", event.target.value)}
              >
                {STATUSES.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </Field>
          </div>

          <Field label="League level" hint="Optional — restricts which teams are eligible.">
            <Select
              name="level_id"
              value={form.level_id}
              onChange={(event) => handleChange("level_id", event.target.value)}
            >
              <option value="">Any level</option>
              {levels?.map((level) => (
                <option key={level.id} value={level.id}>
                  {level.name}
                </option>
              ))}
            </Select>
          </Field>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Start date">
              <Input
                name="start_date"
                type="date"
                value={form.start_date}
                onChange={(event) =>
                  handleChange("start_date", event.target.value)
                }
              />
            </Field>

            <Field label="End date">
              <Input
                name="end_date"
                type="date"
                value={form.end_date}
                onChange={(event) => handleChange("end_date", event.target.value)}
              />
            </Field>
          </div>

          <div className="rounded-card border border-line bg-surface-sunken p-4">
            <SectionHeading
              title="Points system"
              description="Points awarded for each fixture result in the table."
            />
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <Field label="Win">
                <Input
                  name="points_win"
                  type="number"
                  min="0"
                  value={form.points_win}
                  onChange={(event) =>
                    handleChange("points_win", event.target.value)
                  }
                />
              </Field>
              <Field label="Tie">
                <Input
                  name="points_tie"
                  type="number"
                  min="0"
                  value={form.points_tie}
                  onChange={(event) =>
                    handleChange("points_tie", event.target.value)
                  }
                />
              </Field>
              <Field label="Loss">
                <Input
                  name="points_loss"
                  type="number"
                  min="0"
                  value={form.points_loss}
                  onChange={(event) =>
                    handleChange("points_loss", event.target.value)
                  }
                />
              </Field>
              <Field label="No result">
                <Input
                  name="points_no_result"
                  type="number"
                  min="0"
                  value={form.points_no_result}
                  onChange={(event) =>
                    handleChange("points_no_result", event.target.value)
                  }
                />
              </Field>
            </div>
          </div>

          {formError && (
            <p
              role="alert"
              className="flex items-start gap-2 rounded-card border border-danger-line bg-danger-bg px-4 py-3 text-sm text-danger"
            >
              <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              {formError}
            </p>
          )}

          <div className="flex flex-col-reverse gap-3 border-t border-line pt-5 sm:flex-row sm:justify-end">
            <Button
              as={Link}
              to={isEdit ? `/tournaments/${tournamentId}` : "/tournaments"}
              variant="ghost"
            >
              Cancel
            </Button>
            <Button type="submit" loading={isPending}>
              <Trophy className="size-4" aria-hidden="true" />
              {isEdit ? "Save changes" : "Create tournament"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

export default function AddTournamentPage() {
  const { tournamentId } = useParams();
  const isEdit = Boolean(tournamentId);
  const { data: tournament, isLoading, isError, error, refetch } =
    useTournament(tournamentId);

  if (isEdit && isLoading) {
    return <LoadingState label="Loading tournament…" />;
  }

  if (isEdit && isError) {
    return (
      <ErrorState
        title="Couldn't load tournament"
        message={extractErrorMessage(error)}
        onRetry={() => refetch()}
      />
    );
  }

  return (
    <TournamentForm
      key={isEdit ? tournament?.id : "new"}
      tournament={tournament}
      isEdit={isEdit}
      tournamentId={tournamentId}
    />
  );
}
