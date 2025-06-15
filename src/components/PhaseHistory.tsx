
import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Check, Users } from 'lucide-react';

interface PhaseHistoryProps {
  tournamentData: any;
  phase: string;
  phaseTitle: string;
}

const PhaseHistory = ({ tournamentData, phase, phaseTitle }: PhaseHistoryProps) => {
  const matches = (tournamentData.matches || []).filter(match => match.phase === phase);
  const groups = tournamentData.groups || [];

  const getTeamName = (teamId: any) => {
    if (Array.isArray(teamId)) {
      const playerNames = teamId.map(playerId => {
        const player = (tournamentData.players || []).find(p => p.id === playerId);
        return player ? player.name : 'Jogador';
      });
      return playerNames.join(' / ');
    }
    
    const team = (tournamentData.teams || []).find(t => t.id === teamId);
    return team ? team.name : 'Time';
  };

  const renderGroupsDisplay = () => {
    if (phase !== 'group_stage' || groups.length === 0) {
      return null;
    }

    return (
      <Card className="bg-gray-800 border-gray-700 p-6 mb-6">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Users className="w-6 h-6 text-blue-400" />
          Formação das Chaves
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {groups.map((group, index) => (
            <div key={group.id} className="bg-gray-700 border border-gray-600 rounded-lg p-4">
              <h4 className="text-lg font-bold text-blue-300 mb-3 text-center">
                {group.name}
              </h4>
              <div className="space-y-2">
                {group.teamIds.map((teamId, teamIndex) => {
                  const team = (tournamentData.teams || []).find(t => t.id === teamId);
                  return (
                    <div key={teamId} className="flex items-center gap-2 p-2 bg-gray-600 rounded">
                      <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                        {teamIndex + 1}
                      </div>
                      <span className="text-white font-medium">
                        {team ? team.name : 'Dupla'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </Card>
    );
  };

  if (matches.length === 0) {
    return (
      <div className="text-center text-gray-400 py-8">
        <p>Nenhum jogo encontrado para esta fase.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {renderGroupsDisplay()}

      <Card className="bg-gray-800 border-gray-700 p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Trophy className="w-6 h-6" />
            {phaseTitle}
          </h2>
          <Badge className="bg-blue-600 text-white text-lg px-4 py-2">
            {matches.filter(m => m.winnerId).length} / {matches.length} concluídos
          </Badge>
        </div>

        <div className="space-y-3">
          {matches.map((match, index) => (
            <Card key={match.id} className="bg-gray-700 border-gray-600 p-4">
              <div className="flex items-center justify-between">
                {/* Match Title */}
                <div className="text-blue-400 font-bold text-lg min-w-[150px]">
                  {match.phase === 'final' ? 'FINAL' : 
                   match.phase === 'third_place' ? '3º LUGAR' : 
                   `Jogo ${index + 1}`}
                </div>
                
                {/* Teams */}
                <div className="flex-1 text-center">
                  <div className="text-white font-medium">
                    {getTeamName(match.teamIds[0])} <span className="text-gray-400 mx-2">vs</span> {getTeamName(match.teamIds[1])}
                  </div>
                </div>

                {/* Result */}
                <div className="flex items-center gap-4 min-w-[200px] justify-end">
                  {match.winnerId ? (
                    <>
                      <div className="text-lg font-bold text-white">
                        {match.score1} x {match.score2}
                      </div>
                      <div className="text-sm text-green-400 font-medium">
                        Vencedor: {getTeamName(match.winnerId)}
                      </div>
                      <Badge className="bg-green-600 text-white">
                        <Check className="w-3 h-3 mr-1" />
                        Finalizado
                      </Badge>
                    </>
                  ) : (
                    <Badge className="bg-gray-500 text-white">
                      Não realizado
                    </Badge>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default PhaseHistory;
