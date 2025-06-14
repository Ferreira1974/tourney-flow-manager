
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FileText, Download, Trophy, Users, Target, Printer, Crown } from 'lucide-react';

interface TournamentReportProps {
  tournamentData: any;
}

const TournamentReport = ({ tournamentData }: TournamentReportProps) => {
  const generatePDF = () => {
    window.print();
  };

  const handlePrint = () => {
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

  const getFinalStandings = () => {
    const participants = tournamentData.teams?.length > 0 ? tournamentData.teams : tournamentData.players || [];
    
    const sorted = [...participants].sort((a, b) => {
      if (b.wins !== a.wins) return b.wins - a.wins;
      const aDiff = (a.pointsFor || 0) - (a.pointsAgainst || 0);
      const bDiff = (b.pointsFor || 0) - (b.pointsAgainst || 0);
      return bDiff - aDiff;
    });

    return sorted.map((participant, index) => ({
      ...participant,
      position: index + 1,
      pointsDiff: (participant.pointsFor || 0) - (participant.pointsAgainst || 0),
      winRate: participant.gamesPlayed > 0 ? ((participant.wins || 0) / participant.gamesPlayed * 100).toFixed(1) : '0.0'
    }));
  };

  const getAllMatches = () => {
    const matches = tournamentData.matches || [];
    return matches.filter(m => m.winnerId);
  };

  const stats = getStatistics();
  const finalStandings = getFinalStandings();
  const allMatches = getAllMatches();

  if (!tournamentData || !tournamentData.name) {
    return (
      <div className="space-y-8">
        <Card className="bg-gray-800 border-gray-700 p-8">
          <div className="text-center">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-2">Relatório não disponível</h3>
            <p className="text-gray-400">Nenhum dado de torneio encontrado para gerar o relatório.</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 print:space-y-8 print:bg-white">
      {/* Header with tournament title */}
      <div className="text-center print:mb-12">
        <h1 className="text-3xl print:text-6xl font-bold text-white print:text-black mb-4">
          {tournamentData.name}
        </h1>
        <h2 className="text-xl print:text-4xl font-semibold text-gray-300 print:text-gray-700 mb-6">
          RELATÓRIO FINAL DO TORNEIO
        </h2>
        <div className="text-lg print:text-2xl text-gray-400 print:text-gray-600">
          <p className="mb-2">Formato: {getFormatName(tournamentData.format)}</p>
          <p>Data: {new Date(tournamentData.createdAt || Date.now()).toLocaleDateString('pt-BR', { 
            day: '2-digit', 
            month: 'long', 
            year: 'numeric' 
          })}</p>
        </div>
      </div>

      {/* Print Controls */}
      <Card className="bg-gray-800 border-gray-700 p-6 print:hidden">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <FileText className="w-6 h-6" />
            Relatório do Torneio
          </h2>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={handlePrint}
              className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
            >
              <Printer className="w-4 h-4" />
              Imprimir Relatório
            </Button>
            <Button
              onClick={generatePDF}
              className="bg-green-600 hover:bg-green-700 flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Download PDF
            </Button>
          </div>
        </div>
      </Card>

      {/* Tournament Statistics */}
      <Card className="bg-gray-800 border-gray-700 p-6 print:bg-white print:border-gray-300">
        <div className="flex items-center gap-3 mb-6">
          <Target className="w-8 h-8 text-green-400" />
          <h3 className="text-2xl print:text-4xl font-bold text-white print:text-black">Estatísticas do Torneio</h3>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-3xl print:text-5xl font-bold text-white print:text-black">{stats.totalParticipants}</div>
            <div className="text-sm print:text-lg text-gray-400 print:text-gray-700 mt-1">Participantes</div>
          </div>
          <div className="text-center">
            <div className="text-3xl print:text-5xl font-bold text-white print:text-black">{stats.completedMatches}</div>
            <div className="text-sm print:text-lg text-gray-400 print:text-gray-700 mt-1">Jogos Realizados</div>
          </div>
          <div className="text-center">
            <div className="text-3xl print:text-5xl font-bold text-white print:text-black">{stats.totalPoints}</div>
            <div className="text-sm print:text-lg text-gray-400 print:text-gray-700 mt-1">Total de Pontos</div>
          </div>
          <div className="text-center">
            <div className="text-3xl print:text-5xl font-bold text-white print:text-black">{stats.highestScore}</div>
            <div className="text-sm print:text-lg text-gray-400 print:text-gray-700 mt-1">Maior Pontuação</div>
          </div>
        </div>
      </Card>

      {/* Final Standings */}
      <Card className="bg-gray-800 border-gray-700 p-6 print:bg-white print:border-gray-300">
        <div className="flex items-center gap-3 mb-6">
          <Crown className="w-8 h-8 text-yellow-400" />
          <h3 className="text-2xl print:text-4xl font-bold text-white print:text-black">Classificação Final</h3>
        </div>
        
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-gray-600 print:border-gray-300">
                <TableHead className="text-gray-300 print:text-gray-700 w-20 text-sm print:text-lg font-bold">Pos.</TableHead>
                <TableHead className="text-gray-300 print:text-gray-700 text-sm print:text-lg font-bold">Nome</TableHead>
                <TableHead className="text-gray-300 print:text-gray-700 text-center text-sm print:text-lg font-bold">Jogos</TableHead>
                <TableHead className="text-gray-300 print:text-gray-700 text-center text-sm print:text-lg font-bold">Vitórias</TableHead>
                <TableHead className="text-gray-300 print:text-gray-700 text-center text-sm print:text-lg font-bold">Pontos Pró</TableHead>
                <TableHead className="text-gray-300 print:text-gray-700 text-center text-sm print:text-lg font-bold">Pontos Contra</TableHead>
                <TableHead className="text-gray-300 print:text-gray-700 text-center text-sm print:text-lg font-bold">Saldo</TableHead>
                <TableHead className="text-gray-300 print:text-gray-700 text-center text-sm print:text-lg font-bold">Aproveitamento</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {finalStandings.map((participant) => (
                <TableRow key={participant.id} className="border-gray-600 print:border-gray-300">
                  <TableCell className="font-bold text-white print:text-black text-sm print:text-lg">
                    <div className="flex items-center gap-2">
                      <span className="text-lg print:text-2xl">{participant.position}º</span>
                      {participant.position <= 3 && (
                        <div className={`w-6 h-6 print:w-8 print:h-8 rounded-full ${
                          participant.position === 1 ? 'bg-yellow-500' : 
                          participant.position === 2 ? 'bg-gray-400' : 'bg-amber-600'
                        }`} />
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-white print:text-black">
                    <div>
                      <div className="font-bold text-sm print:text-lg">{participant.name}</div>
                      {participant.players && (
                        <div className="text-xs print:text-sm text-gray-400 print:text-gray-600">
                          {participant.players.join(' / ')}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-center text-white print:text-black text-sm print:text-lg">{participant.gamesPlayed || 0}</TableCell>
                  <TableCell className="text-center text-white print:text-black font-bold text-sm print:text-lg">{participant.wins || 0}</TableCell>
                  <TableCell className="text-center text-white print:text-black text-sm print:text-lg">{participant.pointsFor || 0}</TableCell>
                  <TableCell className="text-center text-white print:text-black text-sm print:text-lg">{participant.pointsAgainst || 0}</TableCell>
                  <TableCell className={`text-center font-bold text-sm print:text-lg ${participant.pointsDiff >= 0 ? 'text-green-400 print:text-green-700' : 'text-red-400 print:text-red-700'}`}>
                    {participant.pointsDiff >= 0 ? '+' : ''}{participant.pointsDiff}
                  </TableCell>
                  <TableCell className="text-center text-white print:text-black text-sm print:text-lg">{participant.winRate}%</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        
        {finalStandings.length > 0 && (
          <div className="mt-6 text-sm print:text-lg text-gray-400 print:text-gray-600">
            <strong>Critérios de Desempate:</strong> 1º Número de vitórias, 2º Saldo de pontos (pontos pró - pontos contra)
          </div>
        )}
      </Card>

      {/* Match Results */}
      {allMatches.length > 0 && (
        <Card className="bg-gray-800 border-gray-700 p-6 print:bg-white print:border-gray-300">
          <div className="flex items-center gap-3 mb-6">
            <Trophy className="w-8 h-8 text-blue-400" />
            <h3 className="text-2xl print:text-4xl font-bold text-white print:text-black">Resultados dos Jogos</h3>
          </div>
          
          <div className="space-y-3">
            {allMatches.map((match, index) => {
              const team1Name = getTeamName(match.teamIds[0], tournamentData);
              const team2Name = getTeamName(match.teamIds[1], tournamentData);
              
              return (
                <div key={match.id} className="flex items-center justify-between bg-gray-700 print:bg-gray-100 p-4 rounded-lg">
                  <div className="text-lg print:text-2xl font-bold text-blue-400 print:text-blue-600 min-w-[100px]">
                    Jogo {index + 1}
                  </div>
                  <div className="flex-1 text-center">
                    <div className="text-sm print:text-lg text-white print:text-black">
                      {team1Name} <span className="text-gray-400 print:text-gray-600 mx-2">vs</span> {team2Name}
                    </div>
                  </div>
                  <div className="text-lg print:text-2xl font-bold text-white print:text-black min-w-[120px] text-right">
                    {match.score1} x {match.score2}
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="mt-6 text-sm print:text-lg text-gray-400 print:text-gray-600">
            <strong>Total de jogos realizados:</strong> {allMatches.length}
          </div>
        </Card>
      )}
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
