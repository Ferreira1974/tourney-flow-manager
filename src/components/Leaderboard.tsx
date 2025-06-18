// Conteúdo completo para: src/components/Leaderboard.tsx

import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Crown, Trophy, Medal, Award } from 'lucide-react';
import { getParticipantDisplayName } from '@/utils/tournamentLogic'; // <-- MUDANÇA: Importa a função centralizada

interface LeaderboardProps {
  tournamentData: any;
}

const Leaderboard = ({ tournamentData }: LeaderboardProps) => {
  // MUDANÇA: Lógica de getTeamName foi removida daqui

  const getTeams = () => {
    if (['doubles_groups', 'super16'].includes(tournamentData.format)) {
      return tournamentData.teams || [];
    } else if (['super8', 'king_of_the_court'].includes(tournamentData.format)) {
      // Convert players to team format for consistent display
      return (tournamentData.players || []).map(player => ({
        id: player.id,
        name: player.name,
        gamesPlayed: player.gamesPlayed || 0,
        wins: player.wins || 0,
        pointsFor: player.pointsFor || 0,
        pointsAgainst: player.pointsAgainst || 0
      }));
    }
    return [];
  };

  const calculateTeamStats = () => {
    const teams = getTeams();
    const matches = tournamentData.matches || [];
    
    const teamStats = teams.map(team => ({
      ...team,
      gamesPlayed: 0,
      wins: 0,
      pointsFor: 0,
      pointsAgainst: 0,
      // MUDANÇA: Usa a nova função
      displayName: getParticipantDisplayName(team.id, tournamentData)
    }));

    matches.forEach(match => {
      if (match.score1 !== null && match.score2 !== null && match.winnerId) {
        match.teamIds.forEach((teamId, index) => {
          const team = teamStats.find(t => {
            if (tournamentData.format === 'super16') {
              if (Array.isArray(teamId) && Array.isArray(t.playerIds)) {
                return JSON.stringify(teamId.sort()) === JSON.stringify(t.playerIds.sort());
              }
              return t.id === teamId;
            }
            return t.id === teamId;
          });
          
          if (team) {
            team.gamesPlayed += 1;
            team.pointsFor += index === 0 ? match.score1 : match.score2;
            team.pointsAgainst += index === 0 ? match.score2 : match.score1;
            
            if (match.winnerId === teamId || 
                (Array.isArray(teamId) && Array.isArray(match.winnerId) && 
                 JSON.stringify(teamId.sort()) === JSON.stringify(match.winnerId.sort()))) {
              team.wins += 1;
            }
          }
        });
      }
    });

    return teamStats;
  };

  const teams = calculateTeamStats();
  
  const sortedTeams = [...teams].sort((a, b) => {
    if (b.wins !== a.wins) return b.wins - a.wins;
    
    const aDiff = (a.pointsFor || 0) - (a.pointsAgainst || 0);
    const bDiff = (b.pointsFor || 0) - (b.pointsAgainst || 0);
    if (bDiff !== aDiff) return bDiff - aDiff;
    
    return (b.pointsFor || 0) - (a.pointsFor || 0);
  });

  const getRankIcon = (position: number) => {
    switch (position) {
      case 1:
        return <Crown className="w-5 h-5 text-yellow-400" />;
      case 2:
        return <Medal className="w-5 h-5 text-gray-400" />;
      case 3:
        return <Award className="w-5 h-5 text-amber-600" />;
      default:
        return null;
    }
  };

  const getRankColor = (position: number) => {
    switch (position) {
      case 1:
        return 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white';
      case 2:
        return 'bg-gradient-to-r from-gray-400 to-gray-500 text-white';
      case 3:
        return 'bg-gradient-to-r from-amber-600 to-amber-700 text-white';
      default:
        return 'bg-gray-700 text-white';
    }
  };

  const getWinPercentage = (team: any) => {
    if (!team.gamesPlayed || team.gamesPlayed === 0) return 0;
    return Math.round((team.wins / team.gamesPlayed) * 100);
  };

  const getDefeats = (team: any) => {
    return (team.gamesPlayed || 0) - (team.wins || 0);
  };

  const renderTop3 = () => {
    if (sortedTeams.length === 0) return null;

    const top3 = sortedTeams.slice(0, 3);
    
    return (
      <Card className="bg-gradient-to-r from-yellow-600 to-yellow-700 border-yellow-500 p-8 mb-6">
        <h2 className="text-3xl font-bold text-white mb-6 text-center flex items-center justify-center gap-3">
          <Trophy className="w-8 h-8" />
          Top 3 Classificação
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {top3[0] && (
            <div className="bg-yellow-500 rounded-lg p-6 text-center">
              <Crown className="w-12 h-12 text-yellow-900 mx-auto mb-3" />
              <h3 className="text-xl font-bold text-yellow-900 mb-2">CAMPEÃO</h3>
              <p className="text-2xl font-bold text-yellow-900">{top3[0].displayName}</p>
              <div className="mt-2 text-lg font-semibold text-yellow-800">
                {top3[0].wins} vitórias
              </div>
            </div>
          )}

          {top3[1] && (
            <div className="bg-gray-300 rounded-lg p-6 text-center">
              <Medal className="w-12 h-12 text-gray-700 mx-auto mb-3" />
              <h3 className="text-xl font-bold text-gray-700 mb-2">FINALISTA</h3>
              <p className="text-2xl font-bold text-gray-700">{top3[1].displayName}</p>
              <div className="mt-2 text-lg font-semibold text-gray-600">
                {top3[1].wins} vitórias
              </div>
            </div>
          )}

          {top3[2] && (
            <div className="bg-orange-400 rounded-lg p-6 text-center">
              <Trophy className="w-12 h-12 text-orange-800 mx-auto mb-3" />
              <h3 className="text-xl font-bold text-orange-800 mb-2">3º LUGAR</h3>
              <p className="text-2xl font-bold text-orange-800">{top3[2].displayName}</p>
              <div className="mt-2 text-lg font-semibold text-orange-700">
                {top3[2].wins} vitórias
              </div>
            </div>
          )}
        </div>
      </Card>
    );
  };

  if (teams.length === 0) {
    return (
      <Card className="bg-gray-800 border-gray-700 p-8 text-center">
        <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-white mb-2">Classificação</h3>
        <p className="text-gray-400">
          A classificação aparecerá aqui quando os jogos começarem.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {renderTop3()}

      <Card className="bg-gray-800 border-gray-700 p-6">
        <div className="flex items-center gap-2 mb-6">
          <Trophy className="w-6 h-6 text-yellow-400" />
          <h2 className="text-2xl font-bold text-white">Classificação Completa</h2>
          {tournamentData.status === 'finished' && (
            <Badge className="bg-green-600 text-white ml-2">Final</Badge>
          )}
        </div>

        <div className="space-y-3">
          {sortedTeams.map((team, index) => {
            const position = index + 1;
            const pointDifference = (team.pointsFor || 0) - (team.pointsAgainst || 0);
            const defeats = getDefeats(team);
            
            return (
              <div
                key={team.id}
                className={`
                  rounded-lg p-4 transition-all duration-200 hover:scale-[1.02]
                  ${getRankColor(position)}
                `}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 min-w-[3rem]">
                      <span className="text-2xl font-bold">
                        {position}
                      </span>
                      {getRankIcon(position)}
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-bold">
                        {team.displayName}
                      </h3>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
                    <div>
                      <div className="text-sm opacity-80">Jogos</div>
                      <div className="text-lg font-bold">{team.gamesPlayed || 0}</div>
                    </div>
                    
                    <div>
                      <div className="text-sm opacity-80">Vitórias</div>
                      <div className="text-lg font-bold">{team.wins || 0}</div>
                    </div>

                    <div>
                      <div className="text-sm opacity-80">Derrotas</div>
                      <div className="text-lg font-bold">{defeats}</div>
                    </div>
                    
                    <div>
                      <div className="text-sm opacity-80">Aproveitamento</div>
                      <div className="text-lg font-bold">{getWinPercentage(team)}%</div>
                    </div>
                    
                    <div>
                      <div className="text-sm opacity-80">Saldo</div>
                      <div className={`text-lg font-bold ${
                        pointDifference > 0 ? 'text-green-300' : 
                        pointDifference < 0 ? 'text-red-300' : 'text-white'
                      }`}>
                        {pointDifference > 0 ? '+' : ''}{pointDifference}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-white/20 grid grid-cols-2 gap-4 text-sm">
                  <div className="flex justify-between">
                    <span className="opacity-80">Pontos Feitos:</span>
                    <span className="font-medium">{team.pointsFor || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="opacity-80">Pontos Sofridos:</span>
                    <span className="font-medium">{team.pointsAgainst || 0}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
};

export default Leaderboard;