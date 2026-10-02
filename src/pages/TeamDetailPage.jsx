import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  CheckCircle2,
  Mail,
  MapPin,
  Phone,
  Shield,
  Trash2,
  Trophy,
  UserCheck,
  UserMinus,
  UserPlus,
  Users,
} from "lucide-react";
import { useTeam } from "../hooks/useTeam";
import { useDeleteTeam } from "../hooks/useDeleteTeam";
import { useAddPlayerToTeam } from "../hooks/useAddPlayerToTeam";
import { useRemovePlayerFromTeam } from "../hooks/useRemovePlayerFromTeam";
import { useAssignPlayerToTeam } from "../hooks/useAssignPlayerToTeam";
import { usePlayers } from "../hooks/usePlayers";
import { useLevels } from "../hooks/useLevels";
import { useCountryCodes } from "../hooks/useCountryCodes";
import { extractErrorMessage } from "../api/client";
import {
  Avatar,
  Badge,
  Button,
  Card,
  EmptyState,
  ErrorState,
  Field,
  Input,
  LoadingState,
  PageHeader,
  SearchInput,
  SectionHeading,
  Select,
  TeamBadge,
  useConfirm,
} from "../components/ui";

const PLAYER_ROLES = [
  { value: "playing_11", label: "Playing XI" },
  { value: "substitute", label: "Substitute" },
  { value: "coach", label: "Coach" },
  { value: "support_staff", label: "Support staff" },
];

const SQUAD_GROUPS = [
  { key: "playing_11", label: "Playing XI" },
  { key: "substitutes", label: "Substitutes" },
  { key: "bench", label: "Bench" },
];

function ProfileRow({ icon: Icon, label, value }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-2.5">
      <Icon
        className="mt-0.5 size-4 shrink-0 text-ink-faint"
        aria-hidden="true"
      />
      <div className="min-w-0">
        <dt className="text-[11px] font-semibold uppercase tracking-wide text-ink-subtle">
          {label}
        </dt>
        <dd className="mt-0.5 truncate text-sm font-medium text-ink">{value}</dd>
      </div>
    </div>
  );
}

function RosterMemberCard({ player, onRemove }) {
  const name = `${player.first_name ?? ""} ${player.last_name ?? ""}`.trim();

  return (
    <Card className="flex items-start justify-between gap-3 p-4">
      <div className="flex min-w-0 items-start gap-3">
        <Avatar src={player.profile_image} name={name} size="md" shape="rounded" />
        <div className="min-w-0">
          <h4 className="truncate text-sm font-semibold leading-tight text-ink">
            {name || "Unnamed player"}
          </h4>
          <Badge tone="neutral" size="sm" className="mt-1.5 capitalize">
            {String(player.role ?? "playing_11").replace(/_/g, " ")}
          </Badge>
          {player.email && (
            <p className="mt-1.5 flex items-center gap-1.5 text-[13px] text-ink-subtle">
              <Mail className="size-3.5 shrink-0 text-ink-faint" aria-hidden="true" />
              <span className="truncate">{player.email}</span>
            </p>
          )}
          {player.mobile_number && (
            <p className="mt-1 flex items-center gap-1.5 text-[13px] text-ink-subtle">
              <Phone className="size-3.5 shrink-0 text-ink-faint" aria-hidden="true" />
              <span className="truncate">
                {player.country_code} {player.mobile_number}
              </span>
            </p>
          )}
        </div>
      </div>

      <button
        type="button"
        onClick={() => onRemove(player)}
        aria-label={`Remove ${name || "player"} from squad`}
        className="flex size-9 shrink-0 items-center justify-center rounded-lg text-ink-subtle transition hover:bg-danger-50 hover:text-danger-700"
      >
        <UserMinus className="size-4" aria-hidden="true" />
      </button>
    </Card>
  );
}

function TeamDetailPage() {
  const { teamId } = useParams();
  const navigate = useNavigate();
  const { confirm } = useConfirm();

  const { data: team, isLoading, isError, error, refetch } = useTeam(teamId);
  const { data: players, isLoading: playersLoading } = usePlayers();
  const { data: countryCodes } = useCountryCodes();
  const { data: levels } = useLevels();

  const deleteTeam = useDeleteTeam();
  const addPlayer = useAddPlayerToTeam(teamId);
  const removePlayer = useRemovePlayerFromTeam(teamId);
  const assignPlayer = useAssignPlayerToTeam();

  const [countryCode, setCountryCode] = useState("+91");
  const [mobileNumber, setMobileNumber] = useState("");
  const [addError, setAddError] = useState("");
  const [addSuccess, setAddSuccess] = useState("");
  const [actionError, setActionError] = useState("");

  const [selectedPlayerId, setSelectedPlayerId] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [assignLevel, setAssignLevel] = useState("");
  const [assignRole, setAssignRole] = useState("playing_11");
  const [assignError, setAssignError] = useState("");

  const roster = useMemo(() => {
    if (!team) return [];
    if (Array.isArray(team.players) && team.players.length > 0) {
      return team.players.map((player) => ({ ...player, squad_group: null }));
    }
    const grouped = [];
    for (const group of SQUAD_GROUPS) {
      for (const player of team[group.key] || []) {
        grouped.push({ ...player, squad_group: group.key });
      }
    }
    return grouped;
  }, [team]);

  const squadCount = team?.total ?? roster.length;

  const rosterIds = useMemo(() => new Set(roster.map((p) => p.id)), [roster]);

  const availablePlayers = useMemo(() => {
    if (!players) return [];
    const query = searchQuery.trim().toLowerCase();
    return players.filter((player) => {
      if (rosterIds.has(player.id)) return false;
      if (!query) return true;
      return (
        `${player.first_name ?? ""} ${player.last_name ?? ""}`
          .toLowerCase()
          .includes(query) ||
        String(player.mobile_number ?? "").includes(query) ||
        String(player.email ?? "").toLowerCase().includes(query)
      );
    });
  }, [players, searchQuery, rosterIds]);

  const selectedPlayer = players?.find(
    (player) => player.id === Number(selectedPlayerId),
  );

  async function handleDelete() {
    const confirmed = await confirm({
      title: `Delete ${team.name}?`,
      description:
        "This permanently removes the team and its player registrations. This can't be undone.",
      confirmLabel: "Delete team",
      variant: "danger",
    });
    if (!confirmed) return;

    deleteTeam.mutate(teamId, {
      onSuccess: () => navigate("/teams", { replace: true }),
      onError: (err) => setActionError(extractErrorMessage(err)),
    });
  }

  async function handleRemovePlayer(player) {
    const name = `${player.first_name ?? ""} ${player.last_name ?? ""}`.trim();
    const confirmed = await confirm({
      title: `Remove ${name || "this player"}?`,
      description: "They stay registered, but are removed from this squad.",
      confirmLabel: "Remove from squad",
      variant: "danger",
    });
    if (!confirmed) return;

    setActionError("");
    removePlayer.mutate(player.id, {
      onError: (err) => setActionError(extractErrorMessage(err)),
    });
  }

  async function handleAddPlayer(event) {
    event.preventDefault();
    setAddError("");
    setAddSuccess("");
    try {
      await addPlayer.mutateAsync({
        country_code: countryCode,
        // TeamPlayerByPhone types mobile_number as a string — keep it verbatim
        // so leading zeroes are preserved when matching the player.
        mobile_number: mobileNumber.trim(),
        role: "playing_11",
      });
      setMobileNumber("");
      setAddSuccess("Player added to the squad.");
    } catch (err) {
      setAddError(extractErrorMessage(err));
    }
  }

  async function handleAssignPlayer(event) {
    event.preventDefault();
    setAssignError("");
    if (!selectedPlayerId) {
      setAssignError("Select a player to assign.");
      return;
    }
    if (!assignLevel) {
      setAssignError("Select a level for this player.");
      return;
    }
    try {
      await assignPlayer.mutateAsync({
        playerId: Number(selectedPlayerId),
        team_id: Number(teamId),
        level_id: Number(assignLevel),
        role: assignRole || "playing_11",
      });
      setSelectedPlayerId("");
      setSearchQuery("");
      setAssignLevel("");
      setAssignRole("playing_11");
    } catch (err) {
      setAssignError(extractErrorMessage(err));
    }
  }

  if (isLoading) {
    return <LoadingState label="Loading team…" />;
  }

  if (isError) {
    return (
      <ErrorState
        title="Couldn't load team"
        message={extractErrorMessage(error)}
        onRetry={() => refetch()}
      />
    );
  }

  if (!team) {
    return (
      <EmptyState
        icon={<Shield className="size-6" aria-hidden="true" />}
        title="Team not found"
        description="This team may have been removed, or the link is incorrect."
        action={
          <Button as={Link} to="/teams" variant="secondary">
            Back to teams
          </Button>
        }
      />
    );
  }

  const image = team.logo || team.logo_url;
  const isFlatRoster = roster.some((player) => player.squad_group === null);
  const groupedRoster = SQUAD_GROUPS.map((group) => ({
    group,
    members: roster.filter((player) => player.squad_group === group.key),
  })).filter(({ members }) => members.length > 0);

  return (
    <>
      <PageHeader
        breadcrumbs={[{ label: "Teams", to: "/teams" }, { label: team.name }]}
        title={team.name}
        description={team.homeground || "Club profile and squad management"}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button as={Link} to={`/teams/${team.id}/edit`} variant="secondary">
              Edit team
            </Button>
            <Button
              variant="dangerGhost"
              onClick={handleDelete}
              loading={deleteTeam.isPending}
            >
              <Trash2 className="size-4" aria-hidden="true" />
              Delete team
            </Button>
          </div>
        }
      />

      {actionError && (
        <p
          role="alert"
          className="mb-6 rounded-card border border-danger-200 bg-danger-50 px-4 py-3 text-sm text-danger-800"
        >
          {actionError}
        </p>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6">
          <Card className="p-5">
            <div className="flex items-center gap-3">
              <TeamBadge
                name={team.name}
                shortName={team.short_name}
                src={image}
                size="lg"
              />
              <div className="min-w-0">
                <p className="truncate text-[15px] font-semibold text-ink">
                  {team.name}
                </p>
                <p className="mt-0.5 text-[13px] text-ink-subtle">
                  {team.short_name}
                </p>
              </div>
            </div>

            <dl className="mt-5 space-y-3.5 border-t border-line pt-4">
              <ProfileRow
                icon={MapPin}
                label="Home ground"
                value={team.homeground}
              />
              <ProfileRow icon={Users} label="Founder" value={team.founder} />
              <ProfileRow icon={Trophy} label="Founded" value={team.founded_year} />
              <ProfileRow icon={Trophy} label="Owner" value={team.owner} />
              <ProfileRow icon={Trophy} label="Level" value={team.level} />
            </dl>
          </Card>

          <Card className="p-5">
            <SectionHeading
              title="Assign existing player"
              description="Pick a registered player and give them a level and role."
            />

            <form onSubmit={handleAssignPlayer} className="space-y-4">
              <Field label="Search players">
                <SearchInput
                  value={searchQuery}
                  onChange={(event) => {
                    setSearchQuery(event.target.value);
                    setSelectedPlayerId("");
                  }}
                  placeholder="Search by name, phone, or email"
                />
              </Field>

              <Field label="Registered player">
                <Select
                  value={selectedPlayerId}
                  onChange={(event) => setSelectedPlayerId(event.target.value)}
                  disabled={playersLoading}
                >
                  <option value="">
                    {playersLoading
                      ? "Loading players…"
                      : availablePlayers.length === 0
                        ? "No available players"
                        : "Select a player"}
                  </option>
                  {availablePlayers.map((player) => (
                    <option key={player.id} value={player.id}>
                      {player.first_name} {player.last_name} — {player.country_code}{" "}
                      {player.mobile_number}
                    </option>
                  ))}
                </Select>
              </Field>

              {selectedPlayer && (
                <p className="flex items-start gap-2 rounded-lg border border-brand-200 bg-brand-50 px-3 py-2 text-[13px] text-brand-900">
                  <CheckCircle2
                    className="mt-0.5 size-4 shrink-0"
                    aria-hidden="true"
                  />
                  <span>
                    Assigning {selectedPlayer.first_name}{" "}
                    {selectedPlayer.last_name}
                    {selectedPlayer.batting_position
                      ? ` (${selectedPlayer.batting_position})`
                      : ""}
                  </span>
                </p>
              )}

              <div className="grid grid-cols-2 gap-3">
                <Field label="Level">
                  <Select
                    value={assignLevel}
                    onChange={(event) => setAssignLevel(event.target.value)}
                  >
                    <option value="">Select level</option>
                    {levels?.map((level) => (
                      <option key={level.id} value={level.id}>
                        {level.name}
                      </option>
                    ))}
                  </Select>
                </Field>

                <Field label="Role">
                  <Select
                    value={assignRole}
                    onChange={(event) => setAssignRole(event.target.value)}
                  >
                    {PLAYER_ROLES.map((role) => (
                      <option key={role.value} value={role.value}>
                        {role.label}
                      </option>
                    ))}
                  </Select>
                </Field>
              </div>

              {assignError && (
                <p role="alert" className="text-[13px] text-danger">
                  {assignError}
                </p>
              )}

              <Button
                type="submit"
                fullWidth
                loading={assignPlayer.isPending}
                disabled={availablePlayers.length === 0}
              >
                <UserCheck className="size-4" aria-hidden="true" />
                Assign to team
              </Button>
            </form>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <SectionHeading
            title={`Squad roster (${squadCount})`}
            description={
              isFlatRoster
                ? `${roster.length} registered ${roster.length === 1 ? "member" : "members"}`
                : groupedRoster
                    .map(
                      ({ group, members }) =>
                        `${members.length} ${group.label.toLowerCase()}`,
                    )
                    .join(" · ")
            }
          />

          {squadCount === 0 ? (
            <EmptyState
              icon={<Users className="size-6" aria-hidden="true" />}
              title="No players in this squad yet"
              description="Assign a registered player, or add one by phone number below."
            />
          ) : (
            <div className="space-y-6">
              {isFlatRoster ? (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {roster.map((player) => (
                    <RosterMemberCard
                      key={player.id}
                      player={player}
                      onRemove={handleRemovePlayer}
                    />
                  ))}
                </div>
              ) : (
                groupedRoster.map(({ group, members }) => (
                    <section key={group.key}>
                      <h3 className="mb-3 text-[13px] font-semibold uppercase tracking-wide text-ink-subtle">
                        {group.label}{" "}
                        <span className="text-ink-faint">({members.length})</span>
                      </h3>
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        {members.map((player) => (
                          <RosterMemberCard
                            key={player.id}
                            player={player}
                            onRemove={handleRemovePlayer}
                          />
                        ))}
                      </div>
                    </section>
                ))
              )}
            </div>
          )}

          <Card className="p-5">
            <SectionHeading
              title="Add player by phone"
              description="The athlete must already be registered with this phone number."
            />

            <form onSubmit={handleAddPlayer} className="space-y-4">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-[6rem_1fr]">
                <Field label="Code">
                  <Select
                    value={countryCode}
                    onChange={(event) => setCountryCode(event.target.value)}
                  >
                    {countryCodes?.map((entry) => (
                      <option key={entry.code} value={entry.code}>
                        {entry.code}
                      </option>
                    ))}
                  </Select>
                </Field>

                <Field label="Mobile number" error={addError} required>
                  <Input
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel-national"
                    placeholder="9876543210"
                    value={mobileNumber}
                    onChange={(event) => setMobileNumber(event.target.value)}
                  />
                </Field>
              </div>

              {addSuccess && (
                <p
                  role="status"
                  className="flex items-start gap-2 rounded-lg border border-success-line bg-success-bg px-3 py-2 text-[13px] text-success"
                >
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                  {addSuccess}
                </p>
              )}

              <Button
                type="submit"
                variant="secondary"
                loading={addPlayer.isPending}
                disabled={!mobileNumber.trim()}
              >
                <UserPlus className="size-4" aria-hidden="true" />
                Add to squad
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </>
  );
}

export default TeamDetailPage;