
import React from "react";
import { Trophy } from "lucide-react";

function getTeamName(teamId: any, tournamentData: any) {
  // Handle Super 16 format where teamIds are arrays of player IDs
  if (tournamentData.format === 'super16') {
    if (Array.isArray(teamId)) {
      const playerNames = teamId.map((playerId: string) => {
        const player = (tournamentData.players || []).find((p: any) => p.id === playerId);
        return player ? player.name : "Jogador";
      });
      return playerNames.join(" / ");
    }
    // If it's not an array, try to find the team by ID
    const team = (tournamentData.teams || []).find((t: any) => t.id === teamId);
    if (team && Array.isArray(team.playerIds)) {
      const playerNames = team.playerIds.map((playerId: string) => {
        const player = (tournamentData.players || []).find((p: any) => p.id === playerId);
        return player ? player.name : "Jogador";
      });
      return playerNames.join(" / ");
    }
    return "Dupla";
  }
  
  // Handle doubles_groups format where teamIds are arrays of player IDs
  if (Array.isArray(teamId)) {
    const playerNames = teamId.map((playerId: string) => {
      const player = (tournamentData.players || []).find((p: any) => p.id === playerId);
      return player ? player.name : "Jogador";
    });
    return playerNames.join(" / ");
  }
  
  // Handle team-based formats
  const team = (tournamentData.teams || []).find((t: any) => t.id === teamId);
  return team ? team.name : "Time";
}

interface DoublesGamesByPhaseProps {
  tournamentData: any;
}

export default function DoublesGamesByPhase({ tournamentData }: DoublesGamesByPhaseProps) {
  const phasesOrder = [
    { key: 'group_stage', label: 'Fase de Grupos' },
    { key: 'round_of_16', label: 'Oitavas de Final' },
    { key: 'quarterfinals', label: 'Quartas de Final' },
    { key: 'semifinals', label: 'Semifinais' },
    { key: 'final', label: 'Final' },
    { key: 'third_place', label: 'Disputa 3º Lugar' }
  ];

  // Mostrar todos os jogos, não apenas os já finalizados
  const matches = tournamentData.matches || [];
  const gamesByPhase: Record<string, any[]> = {};
  matches.forEach((match: any) => {
    if (!gamesByPhase[match.phase]) gamesByPhase[match.phase] = [];
    gamesByPhase[match.phase].push(match);
  });

  return (
    <div className="mt-2">
      <div className="flex items-center gap-3 mb-3">
        <Trophy className="w-5 h-5 text-blue-400 print:text-blue-600" />
        <h3 className="text-base print:text-lg font-bold text-white print:text-black">Jogos por Fase</h3>
      </div>
      <div className="space-y-4">
        {phasesOrder.map(phase => (
          gamesByPhase[phase.key] && !!gamesByPhase[phase.key].length && (
            <div key={phase.key}>
              <div className="text-base print:text-lg font-bold text-blue-400 print:text-blue-700 mb-1">{phase.label}</div>
              <div className="space-y-1">
                {gamesByPhase[phase.key].map((match: any, i: number) => (
                  <div key={match.id} className="flex items-center justify-between bg-gray-700 print:bg-gray-100 p-2 rounded-md border print:border-gray-200 mb-1">
                    <div className="text-gray-300 print:text-gray-600 text-sm min-w-[110px]">
                      Jogo {i + 1}
                    </div>
                    <div className="flex-1 text-center">
                      <span className="font-medium text-white print:text-black">{getTeamName(match.teamIds[0], tournamentData)}</span>
                      <span className="text-gray-400 print:text-gray-600 mx-2">vs</span>
                      <span className="font-medium text-white print:text-black">{getTeamName(match.teamIds[1], tournamentData)}</span>
                    </div>
                    <div className="text-white print:text-black font-bold min-w-[70px] text-right">
                      {match.score1 !== null && match.score2 !== null ? (
                        <span>{match.score1} x {match.score2}</span>
                      ) : <span className="text-xs text-gray-400 print:text-gray-600">Pendente</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        ))}
      </div>
    </div>
  );
}
