
import React from "react";
import { Trophy } from "lucide-react";

interface TournamentGamesByPhaseProps {
  phasesOrder: { key: string; label: string }[];
  gamesByPhase: Record<string, any[]>;
  getTeamName: (teamId: any) => string;
  tournamentData?: any;
}

const TournamentGamesByPhase = ({
  phasesOrder,
  gamesByPhase,
  getTeamName,
  tournamentData,
}: TournamentGamesByPhaseProps) => {
  // Enhanced team name function for Super 16 format
  const getEnhancedTeamName = (teamId: any) => {
    console.log('TournamentGamesByPhase - Processing teamId:', teamId, 'Tournament format:', tournamentData?.format);
    
    if (tournamentData?.format === 'super16') {
      // For Super 16, teamId should be an array of player IDs
      if (Array.isArray(teamId)) {
        console.log('TournamentGamesByPhase - teamId is array:', teamId);
        const playerNames = teamId.map(playerId => {
          const player = (tournamentData.players || []).find(p => p.id === playerId);
          console.log('TournamentGamesByPhase - Found player:', player);
          return player ? player.name : 'Jogador';
        });
        const result = playerNames.join(' / ');
        console.log('TournamentGamesByPhase - Final team name:', result);
        return result;
      }
      
      // If it's a string, might be a team ID - check teams first
      const team = (tournamentData.teams || []).find(t => t.id === teamId);
      if (team && Array.isArray(team.playerIds)) {
        console.log('TournamentGamesByPhase - Found team with playerIds:', team);
        const playerNames = team.playerIds.map(playerId => {
          const player = (tournamentData.players || []).find(p => p.id === playerId);
          return player ? player.name : 'Jogador';
        });
        return playerNames.join(' / ');
      }
      
      // Last fallback - might be a single player ID
      const player = (tournamentData.players || []).find(p => p.id === teamId);
      if (player) {
        return player.name;
      }
      
      return 'Dupla';
    }
    
    // For other formats, use the provided getTeamName function
    return getTeamName(teamId);
  };

  return (
    <div className="mt-5">
      {phasesOrder.map(
        (phase) =>
          gamesByPhase[phase.key] &&
          gamesByPhase[phase.key].length > 0 && (
            <div key={phase.key} className="mb-4">
              <div className="flex items-center gap-2 mb-1">
                <Trophy className="w-4 h-4 text-blue-600" />
                <span className="text-base font-bold text-blue-700">{phase.label}</span>
              </div>
              <div className="space-y-1 pl-2">
                {gamesByPhase[phase.key].map((match: any, i: number) => (
                  <div
                    key={match.id}
                    className="flex flex-row items-center justify-between rounded border border-blue-100 px-2 py-1 bg-sky-50 text-[13px]"
                  >
                    <span className="font-bold text-blue-700 min-w-[60px]">{`Jogo ${i + 1}`}</span>
                    <span className="flex-1 text-center text-blue-950 font-semibold">
                      {getEnhancedTeamName(match.teamIds[0])}
                      <span className="mx-2 text-blue-500 font-normal">vs</span>
                      {getEnhancedTeamName(match.teamIds[1])}
                    </span>
                    <span className="font-bold text-blue-800 px-2 min-w-[60px] text-center">
                      {match.score1 !== null && match.score2 !== null ? (
                        <span>
                          {match.score1} x {match.score2}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">Pendente</span>
                      )}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )
      )}
    </div>
  );
};

export default TournamentGamesByPhase;
