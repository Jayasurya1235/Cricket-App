import { Link } from "react-router-dom";
import { Plus, Users } from "lucide-react";
import { useTeams } from "../hooks/useTeams";
import { extractErrorMessage } from "../api/client";
import TeamCard from "../components/TeamCard";
import {
  Button,
  CardSkeletonGrid,
  EmptyState,
  ErrorState,
  PageHeader,
} from "../components/ui";

function TeamsPage() {
  const { data: teams, isLoading, isError, error, refetch } = useTeams();

  if (isLoading) {
    return (
      <>
        <PageHeader
          title="Teams"
          description="All clubs registered in the league."
        />
        <CardSkeletonGrid count={6} />
      </>
    );
  }

  if (isError) {
    return (
      <ErrorState
        title="Couldn't load teams"
        message={extractErrorMessage(error)}
        onRetry={() => refetch()}
      />
    );
  }

  const list = teams ?? [];
  const registerAction = (
    <Button as={Link} to="/teams/new" variant="secondary">
      <Plus className="size-4" aria-hidden="true" />
      Register team
    </Button>
  );

  return (
    <>
      <PageHeader
        title="Teams"
        description={`${list.length} ${list.length === 1 ? "club" : "clubs"} registered in the league.`}
        actions={list.length > 0 ? registerAction : undefined}
      />

      {list.length === 0 ? (
        <EmptyState
          icon={<Users className="size-6" aria-hidden="true" />}
          title="No teams registered yet"
          description="Register the first club to start building squads and fixtures."
          action={
            <Button as={Link} to="/teams/new">
              <Plus className="size-4" aria-hidden="true" />
              Register your first team
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {list.map((team) => (
            <TeamCard key={team.id} team={team} />
          ))}
        </div>
      )}
    </>
  );
}

export default TeamsPage;