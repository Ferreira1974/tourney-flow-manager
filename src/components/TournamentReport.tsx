
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Download, Trophy, Users, Target } from 'lucide-react';

interface TournamentReportProps {
  tournamentData: any;
}

const TournamentReport = ({ tournamentData }: TournamentReportProps) => {
  const generatePDF = () => {
    // This would integrate with jsPDF to generate a comprehensive report
    // For now, we'll create a simple print-friendly version
    window.print();
  };

  const getStatistics = () => {
    const matches = tournamentData.matches || [];
    const teams = tournamentData.teams || [];
    const players = tournamentData.players || [];
    
    const totalMatches = matches.length;
    const completedMatches = matches.filter(m => m.winnerId).length;
    const totalParticipants = teams.length > 0 ? teams.length : players.length;
    
    let totalPoints = 0;
    let highestScore = 0;
    
    matches.forEach(match => {
      if (match.score1 !== null && match.score2 !== null) {
        totalPoints += match.score1 + match.score2;
        highestScore = Math.max(highestScore, match.score1, match.score2);
      }
    });

    const averagePointsPerMatch = completedMatches > 0 ? Math.round(totalPoints / completedMatches) : 0;

    return {
      totalMatches,
      completedMatches,
      totalParticipants,
      totalPoints,
      averagePointsPerMatch,
      highestScore
    };
  };

  const getTopPerformers = () => {
    const participants = tournamentData.teams?.length > 0 ? tournamentData.teams : tournamentData.players || [];
    
    const sorted = [...participants].sort((a, b) => {
      if (b.wins !== a.wins) return b.wins - a.wins;
      const aDiff = (a.pointsFor || 0) - (a.pointsAgainst || 0);
      const bDiff = (b.pointsFor || 0) - (b.pointsAgainst || 0);
      return bDiff - aDiff;
    });

    return sorted.slice(0, 3);
  };

  const getMatchHistory = () => {
    const matches = tournamentData.matches || [];
    return matches.filter(m => m.winnerId).slice(-10); // Last 10 completed matches
  };

  const stats = getStatistics();
  const topPerformers = getTopPerformers();
  const recentMatches = getMatchHistory();

  return (
    <div className="space-y-6">
      <Card className="bg-gray-800 border-gray-700 p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <FileText className="w-6 h-6" />
            Relatório do Torneio
          </h2>
          <Button
            onClick={generatePDF}
            className="bg-green-600 hover:bg-green-700 flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Exportar PDF
          </Button>
        </div>

        {/* Tournament Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-700 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-2">
              <Trophy className="w-5 h-5 text-yellow-400" />
              <h3 className="font-semibold text-white">Informações Gerais</h3>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Nome:</span>
                <span className="text-white">{tournamentData.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Formato:</span>
                <span className="text-white">{getFormatName(tournamentData.format)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Status:</span>
                <Badge variant={tournamentData.status === 'finished' ? 'default' : 'secondary'}>
                  {getStatusName(tournamentData.status)}
                </Badge>
              </div>
            </div>
          </div>

          <div className="bg-gray-700 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-2">
              <Users className="w-5 h-5 text-blue-400" />
              <h3 className="font-semibold text-white">Participação</h3>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Participantes:</span>
                <span className="text-white">{stats.totalParticipants}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Jogos Totais:</span>
                <span className="text-white">{stats.totalMatches}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Jogos Concluídos:</span>
                <span className="text-white">{stats.completedMatches}</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-700 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-2">
              <Target className="w-5 h-5 text-green-400" />
              <h3 className="font-semibold text-white">Estatísticas</h3>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Total de Pontos:</span>
                <span className="text-white">{stats.totalPoints}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Média por Jogo:</span>
                <span className="text-white">{stats.averagePointsPerMatch}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Maior Placar:</span>
                <span className="text-white">{stats.highestScore}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Top Performers */}
        <div className="mb-8">
          <h3 className="text-xl font-bold text-white mb-4">Melhores Desempenhos</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {topPerformers.map((performer, index) => {
              const position = index + 1;
              const winRate = performer.gamesPlayed > 0 
                ? Math.round((performer.wins / performer.gamesPlayed) * 100) 
                : 0;
              
              return (
                <div key={performer.id} className="bg-gray-700 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`
                      w-8 h-8 rounded-full flex items-center justify-center text-white font-bold
                      ${position === 1 ? 'bg-yellow-500' : position === 2 ? 'bg-gray-400' : 'bg-amber-600'}
                    `}>
                      {position}
                    </div>
                    <div>
                      <div className="text-white font-medium">{performer.name}</div>
                      {performer.players && (
                        <div className="text-xs text-gray-400">
                          {performer.players.join(' / ')}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-gray-400">Vitórias</div>
                      <div className="text-white font-bold">{performer.wins || 0}</div>
                    </div>
                    <div>
                      <div className="text-gray-400">Aproveitamento</div>
                      <div className="text-white font-bold">{winRate}%</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Matches */}
        {recentMatches.length > 0 && (
          <div>
            <h3 className="text-xl font-bold text-white mb-4">Resultados Recentes</h3>
            <div className="space-y-2">
              {recentMatches.slice(-5).map((match) => (
                <div key={match.id} className="bg-gray-700 rounded-lg p-3 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="text-white text-sm">
                      {getTeamName(match.teamIds[0], tournamentData)} vs {getTeamName(match.teamIds[1], tournamentData)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-white font-bold">
                      {match.score1} - {match.score2}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {match.phase}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

// Helper functions
const getFormatName = (format: string) => {
  const formats = {
    super8: 'Super 8',
    doubles_groups: 'Torneio de Duplas',
    super16: 'Super 16',
    king_of_the_court: 'Rei da Quadra'
  };
  return formats[format] || format;
};

const getStatusName = (status: string) => {
  const statuses = {
    setup: 'Configuração',
    registration: 'Inscrições',
    playing: 'Em Andamento',
    finished: 'Finalizado',
    group_stage: 'Fase de Grupos',
    phase1_groups: 'Fase 1',
    phase2_playoffs: 'Fase 2',
    phase3_final: 'Final'
  };
  return statuses[status] || status;
};

const getTeamName = (teamId: any, tournamentData: any) => {
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

export default TournamentReport;
