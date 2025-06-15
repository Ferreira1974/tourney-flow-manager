
import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Crown, Trophy, Medal, Award } from 'lucide-react';

interface LeaderboardProps {
  tournamentData: any;
}

const Leaderboard = ({ tournamentData }: LeaderboardProps) => {
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

  const teams = getTeams();
  
  // Sort teams by wins, then by point difference, then by points scored
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

  const renderFinalResults = () => {
    if (tournamentData.format !== 'doubles_groups' || tournamentData.status !== 'finished') {
      return null;
    }

    const matches = tournamentData.matches || [];
    const finalMatch = matches.find(match => match.phase === 'final' && match.winnerId);
    const thirdPlaceMatch = matches.find(match => match.phase === 'third_place' && match.winnerId);

    if (!finalMatch || !thirdPlaceMatch) return null;

    const champion = (tournamentData.teams || []).find(t => t.id === finalMatch.winnerId);
    const finalist = (tournamentData.teams || []).find(t => t.id === finalMatch.teamIds.find(id => id !== finalMatch.winnerId));
    const thirdPlace = (tournamentData.teams || []).find(t => t.id === thirdPlaceMatch.winnerId);

    return (
      <Card className="bg-gradient-to-r from-yellow-600 to-yellow-700 border-yellow-500 p-8 mb-6">
        <h2 className="text-3xl font-bold text-white mb-6 text-center flex items-center justify-center gap-3">
          <Trophy className="w-8 h-8" />
          Resultado Final do Torneio
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Campeão */}
          <div className="bg-yellow-500 rounded-lg p-6 text-center">
            <Crown className="w-12 h-12 text-yellow-900 mx-auto mb-3" />
            <h3 className="text-xl font-bold text-yellow-900 mb-2">CAMPEÃO</h3>
            <p className="text-2xl font-bold text-yellow-900">{champion?.name || 'Dupla'}</p>
            {champion?.players && (
              <p className="text-yellow-800 mt-1">
                {champion.players.join(' / ')}
              </p>
            )}
            <div className="mt-2 text-lg font-semibold text-yellow-800">
              {finalMatch.score1} x {finalMatch.score2}
            </div>
          </div>

          {/* Finalista */}
          <div className="bg-gray-300 rounded-lg p-6 text-center">
            <Medal className="w-12 h-12 text-gray-700 mx-auto mb-3" />
            <h3 className="text-xl font-bold text-gray-700 mb-2">FINALISTA</h3>
            <p className="text-2xl font-bold text-gray-700">{finalist?.name || 'Dupla'}</p>
            {finalist?.players && (
              <p className="text-gray-600 mt-1">
                {finalist.players.join(' / ')}
              </p>
            )}
            <div className="mt-2 text-lg font-semibold text-gray-600">
              Vice-Campeão
            </div>
          </div>

          {/* Terceiro Lugar */}
          <div className="bg-orange-400 rounded-lg p-6 text-center">
            <Trophy className="w-12 h-12 text-orange-800 mx-auto mb-3" />
            <h3 className="text-xl font-bold text-orange-800 mb-2">3º LUGAR</h3>
            <p className="text-2xl font-bold text-orange-800">{thirdPlace?.name || 'Dupla'}</p>
            {thirdPlace?.players && (
              <p className="text-orange-700 mt-1">
                {thirdPlace.players.join(' / ')}
              </p>
            )}
            <div className="mt-2 text-lg font-semibold text-orange-700">
              {thirdPlaceMatch.score1} x {thirdPlaceMatch.score2}
            </div>
          </div>
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
      {/* Show final results when tournament is finished */}
      {renderFinalResults()}

      <Card className="bg-gray-800 border-gray-700 p-6">
        <div className="flex items-center gap-2 mb-6">
          <Trophy className="w-6 h-6 text-yellow-400" />
          <h2 className="text-2xl font-bold text-white">Classificação</h2>
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
                        {team.name}
                      </h3>
                      {team.players && (
                        <p className="text-sm opacity-80">
                          {team.players.join(' / ')}
                        </p>
                      )}
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

        {tournamentData.status === 'finished' && sortedTeams.length > 0 && !renderFinalResults() && (
          <div className="mt-8 p-6 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg text-center">
            <Trophy className="w-12 h-12 text-white mx-auto mb-3" />
            <h3 className="text-2xl font-bold text-white mb-2">Campeão</h3>
            <p className="text-xl text-white font-medium">
              {sortedTeams[0].name}
            </p>
            {sortedTeams[0].players && (
              <p className="text-white/90 mt-1">
                {sortedTeams[0].players.join(' / ')}
              </p>
            )}
          </div>
        )}
      </Card>
    </div>
  );
};

export default Leaderboard;
