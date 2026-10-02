import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { AlertCircle, CheckCircle2, Trash2 } from "lucide-react";
import { usePlayer } from "../hooks/usePlayer";
import { useLocations } from "../hooks/useLocations";
import { useCountryCodes } from "../hooks/useCountryCodes";
import { useLevels } from "../hooks/useLevels";
import { useTeams } from "../hooks/useTeams";
import { useUpdatePlayer } from "../hooks/useUpdatePlayer";
import { useDeletePlayer } from "../hooks/useDeletePlayer";
import { useUpdatePlayerTeamRole } from "../hooks/useUpdatePlayerTeamRole";
import { extractErrorMessage } from "../api/client";
import PlayerFormFields from "../components/PlayerFormFields";
import {
  Button,
  Card,
  EmptyState,
  ErrorState,
  LoadingState,
  PageHeader,
  useConfirm,
} from "../components/ui";

function buildInitial(player) {
  return {
    first_name: player.first_name ?? "",
    last_name: player.last_name ?? "",
    date_of_birth: player.date_of_birth ?? "",
    gender: player.gender ?? "",
    profile_image: player.profile_image ?? "",
    batting_hand: player.batting_hand ?? "",
    batting_position: player.batting_position ?? "",
    bowling_hand: player.bowling_hand ?? "",
    bowling_type: player.bowling_type ?? "",
    country_id: player.country_id ?? "",
    state_id: player.state_id ?? "",
    city_id: player.city_id ?? "",
    height: player.height ?? "",
    weight: player.weight ?? "",
    country_code: player.country_code ?? "",
    mobile_number: player.mobile_number ?? "",
    email: player.email ?? "",
    team_id: player.team_id ?? "",
    level_id: player.level_id ?? "",
    role: player.role ?? "playing_11",
  };
}

function EditPlayerForm({ player, playerId }) {
  const navigate = useNavigate();
  const confirm = useConfirm();
  const { data: countries } = useLocations();
  const { data: countryCodes } = useCountryCodes();
  const { data: levels } = useLevels();
  const { data: teams } = useTeams();
  const updatePlayer = useUpdatePlayer();
  const deletePlayer = useDeletePlayer();
  const updatePlayerTeamRole = useUpdatePlayerTeamRole();

  const [form, setForm] = useState(() => buildInitial(player));
  const [formError, setFormError] = useState("");

  function handleChange(field, value) {
    setForm((previous) => {
      const updated = { ...previous, [field]: value };
      if (field === "country_id") {
        updated.state_id = "";
        updated.city_id = "";
      }
      if (field === "state_id") {
        updated.city_id = "";
      }
      return updated;
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setFormError("");

    if (!/^\d{7,15}$/.test(form.mobile_number)) {
      setFormError("Mobile number must contain 7 to 15 digits.");
      return;
    }
    if (Number(form.height) <= 0 || Number(form.weight) <= 0) {
      setFormError("Height and weight must be greater than zero.");
      return;
    }

    try {
      // team_id/role are not part of PlayerUpdate — strip them out. Team assignment
      // is a separate resource (POST /players/{id}/teams).
      const { team_id, role, ...playerFields } = form;
      // PlayerUpdate has no level_id field either. It is always "" here because
      // PlayerResponse carries no level, so drop the key instead of sending an
      // unknown one.
      delete playerFields.level_id;

      const payload = {
        ...playerFields,
        profile_image: form.profile_image || null,
        country_id: form.country_id ? Number(form.country_id) : null,
        state_id: form.state_id ? Number(form.state_id) : null,
        city_id: form.city_id ? Number(form.city_id) : null,
        height: form.height ? Number(form.height) : null,
        weight: form.weight ? Number(form.weight) : null,
        // PlayerUpdate types mobile_number as a string, matching PlayerResponse.
        // Keep it as typed so leading zeroes survive.
        mobile_number: form.mobile_number ? form.mobile_number.trim() : null,
      };

      await updatePlayer.mutateAsync({ id: playerId, data: payload });

      // Update the role on the existing team assignment, if one changed.
      // Note: this endpoint only updates ROLE — changing team or level
      // requires removing the old assignment and creating a new one.
      if (team_id && role) {
        await updatePlayerTeamRole.mutateAsync({
          playerId,
          teamId: Number(team_id),
          role,
        });
      }

      navigate("/players");
    } catch (err) {
      setFormError(extractErrorMessage(err));
    }
  }

  async function handleDelete() {
    const confirmed = await confirm({
      title: "Delete player",
      description: `Delete player “${form.first_name} ${form.last_name}”? This cannot be undone.`,
      confirmLabel: "Delete player",
      tone: "danger",
    });
    if (!confirmed) return;

    try {
      await deletePlayer.mutateAsync(playerId);
      navigate("/players");
    } catch (err) {
      setFormError(`Failed to delete player: ${extractErrorMessage(err)}`);
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader
        breadcrumbs={[
          { label: "Players", to: "/players" },
          {
            label: `${player.first_name ?? ""} ${player.last_name ?? ""}`.trim(),
          },
          { label: "Edit" },
        ]}
        title="Edit Athlete Profile"
        description="Update general profiles, physical specifications, contact details and team assignment."
      />

      <Card className="p-6 md:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <PlayerFormFields
            form={form}
            onChange={handleChange}
            countries={countries}
            countryCodes={countryCodes}
            levels={levels}
            teams={teams}
            teamRequired
          />

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
            <Button
              type="button"
              variant="dangerGhost"
              loading={deletePlayer.isPending}
              onClick={handleDelete}
            >
              <Trash2 className="size-4" aria-hidden="true" />
              {deletePlayer.isPending ? "Deleting…" : "Delete Player"}
            </Button>

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center">
              <Button as={Link} to="/players" variant="ghost">
                Cancel
              </Button>
              <Button type="submit" loading={updatePlayer.isPending}>
                <CheckCircle2 className="size-4" aria-hidden="true" />
                {updatePlayer.isPending ? "Saving changes…" : "Save Changes"}
              </Button>
            </div>
          </div>
        </form>
      </Card>
    </div>
  );
}

function EditPlayerPage() {
  const { playerId } = useParams();
  const {
    data: player,
    isLoading: playerLoading,
    isError,
    error,
  } = usePlayer(playerId);

  if (playerLoading) {
    return <LoadingState label="Loading athlete profile…" />;
  }

  if (isError) {
    return (
      <ErrorState
        title="Failed to load player"
        message={extractErrorMessage(error)}
      />
    );
  }

  if (!player) {
    return (
      <EmptyState
        title="Player not found"
        description="This player may have been removed."
        action={
          <Button as={Link} to="/players" variant="secondary">
            Return to Players Directory
          </Button>
        }
      />
    );
  }

  return <EditPlayerForm key={player.id} player={player} playerId={playerId} />;
}

export default EditPlayerPage;