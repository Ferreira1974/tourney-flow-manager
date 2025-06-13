
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FileText, Download, Trophy, Users, Target, Printer, Medal, Crown } from 'lucide-react';

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

  return (
    <div className="space-y-8 print:space-y-8">
      {/* Header com título maior e data */}
      <div className="text-center print:mb-10">
        <h1 className="text-5xl print:text-6xl font-bold text-white print:text-black mb-3">
          {tournamentData.name}
        </h1>
        <h2 className="text-3xl print:text-4xl font-semibold text-gray-300 print:text-gray-700 mb-6">
          RELATÓRIO FINAL DO TORNEIO
        </h2>
        <div className="text-xl print:text-2xl text-gray-400 print:text-gray-600">
          <p className="mb-2">Formato: {getFormatName(tournamentData.format)}</p>
          <p>Data: {new Date(tournamentData.createdAt).toLocaleDateString('pt-BR', { 
            day: '2-digit', 
            month: 'long', 
            year: 'numeric' 
          })}</p>
        </div>
      </div>

      {/* Action Buttons */}
      <Card className="bg-gray-800 border-gray-700 p-8 print:hidden">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="text-3xl font-bold text-white flex items-center gap-2">
            <FileText className="w-8 h-8" />
            Relatório do Torneio
          </h2>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={handlePrint}
              className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2 text-lg px-6 py-3"
            >
              <Printer className="w-5 h-5" />
              Imprimir Relatório
            </Button>
            <Button
              onClick={generatePDF}
              className="bg-green-600 hover:bg-green-700 flex items-center gap-2 text-lg px-6 py-3"
            >
              <Download className="w-5 h-5" />
              Download PDF
            </Button>
          </div>
        </div>
      </Card>

      {/* Classificação Final - Destaque Principal */}
      <Card className="bg-gray-800 border-gray-700 p-10 print:bg-white print:border-gray-300">
        <div className="flex items-center gap-4 mb-8">
          <Crown className="w-10 h-10 text-yellow-400" />
          <h3 className="text-4xl print:text-5xl font-bold text-white print:text-black">Classificação Final</h3>
        </div>
        
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-gray-600 print:border-gray-300">
                <TableHead className="text-gray-300 print:text-gray-700 w-24 text-xl print:text-2xl font-bold">Pos.</TableHead>
                <TableHead className="text-gray-300 print:text-gray-700 text-xl print:text-2xl font-bold">Nome</TableHead>
                <TableHead className="text-gray-300 print:text-gray-700 text-center text-xl print:text-2xl font-bold">Jogos</TableHead>
                <TableHead className="text-gray-300 print:text-gray-700 text-center text-xl print:text-2xl font-bold">Vitórias</TableHead>
                <TableHead className="text-gray-300 print:text-gray-700 text-center text-xl print:text-2xl font-bold">Pontos Pró</TableHead>
                <TableHead className="text-gray-300 print:text-gray-700 text-center text-xl print:text-2xl font-bold">Pontos Contra</TableHead>
                <TableHead className="text-gray-300 print:text-gray-700 text-center text-xl print:text-2xl font-bold">Saldo</TableHead>
                <TableHead className="text-gray-300 print:text-gray-700 text-center text-xl print:text-2xl font-bold">Aproveitamento</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {finalStandings.map((participant) => (
                <TableRow key={participant.id} className="border-gray-600 print:border-gray-300">
                  <TableCell className="font-bold text-white print:text-black text-xl print:text-2xl">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl print:text-4xl">{participant.position}º</span>
                      {participant.position <= 3 && (
                        <div className={`w-8 h-8 print:w-10 print:h-10 rounded-full ${
                          participant.position === 1 ? 'bg-yellow-500' : 
                          participant.position === 2 ? 'bg-gray-400' : 'bg-amber-600'
                        }`} />
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-white print:text-black">
                    <div>
                      <div className="font-bold text-xl print:text-2xl">{participant.name}</div>
                      {participant.players && (
                        <div className="text-lg print:text-xl text-gray-400 print:text-gray-600">
                          {participant.players.join(' / ')}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-center text-white print:text-black text-xl print:text-2xl">{participant.gamesPlayed || 0}</TableCell>
                  <TableCell className="text-center text-white print:text-black font-bold text-xl print:text-2xl">{participant.wins || 0}</TableCell>
                  <TableCell className="text-center text-white print:text-black text-xl print:text-2xl">{participant.pointsFor || 0}</TableCell>
                  <TableCell className="text-center text-white print:text-black text-xl print:text-2xl">{participant.pointsAgainst || 0}</TableCell>
                  <TableCell className={`text-center font-bold text-xl print:text-2xl ${participant.pointsDiff >= 0 ? 'text-green-400 print:text-green-700' : 'text-red-400 print:text-red-700'}`}>
                    {participant.pointsDiff >= 0 ? '+' : ''}{participant.pointsDiff}
                  </TableCell>
                  <TableCell className="text-center text-white print:text-black text-xl print:text-2xl">{participant.winRate}%</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        
        {finalStandings.length > 0 && (
          <div className="mt-8 text-lg print:text-xl text-gray-400 print:text-gray-600">
            <strong>Critérios de Desempate:</strong> 1º Número de vitórias, 2º Saldo de pontos (pontos pró - pontos contra)
          </div>
        )}
      </Card>

      {/* Estatísticas Gerais */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="bg-gray-800 border-gray-700 p-8 print:bg-white print:border-gray-300">
          <div className="flex items-center gap-3 mb-6">
            <Trophy className="w-8 h-8 text-yellow-400" />
            <h3 className="text-3xl print:text-4xl font-semibold text-white print:text-black">Informações Gerais</h3>
          </div>
          <div className="space-y-6">
            <div className="flex justify-between items-center py-4 border-b border-gray-600 print:border-gray-300">
              <span className="text-gray-400 print:text-gray-700 text-xl print:text-2xl">Formato:</span>
              <span className="text-white font-medium print:text-black text-xl print:text-2xl">{getFormatName(tournamentData.format)}</span>
            </div>
            <div className="flex justify-between items-center py-4 border-b border-gray-600 print:border-gray-300">
              <span className="text-gray-400 print:text-gray-700 text-xl print:text-2xl">Status:</span>
              <Badge variant={tournamentData.status === 'finished' ? 'default' : 'secondary'} className="print:border print:border-gray-400 text-lg print:text-xl px-4 py-2">
                {getStatusName(tournamentData.status)}
              </Badge>
            </div>
            <div className="flex justify-between items-center py-4">
              <span className="text-gray-400 print:text-gray-700 text-xl print:text-2xl">Participantes:</span>
              <span className="text-white font-medium print:text-black text-xl print:text-2xl">{stats.totalParticipants}</span>
            </div>
          </div>
        </Card>

        <Card className="bg-gray-800 border-gray-700 p-8 print:bg-white print:border-gray-300">
          <div className="flex items-center gap-3 mb-6">
            <Target className="w-8 h-8 text-green-400" />
            <h3 className="text-3xl print:text-4xl font-semibold text-white print:text-black">Estatísticas</h3>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div className="text-center">
              <div className="text-4xl print:text-5xl font-bold text-white print:text-black">{stats.completedMatches}/{stats.totalMatches}</div>
              <div className="text-lg print:text-xl text-gray-400 print:text-gray-700">Jogos Realizados</div>
            </div>
            <div className="text-center">
              <div className="text-4xl print:text-5xl font-bold text-white print:text-black">{stats.totalPoints}</div>
              <div className="text-lg print:text-xl text-gray-400 print:text-gray-700">Total de Pontos</div>
            </div>
            <div className="text-center">
              <div className="text-4xl print:text-5xl font-bold text-white print:text-black">{stats.averagePointsPerMatch}</div>
              <div className="text-lg print:text-xl text-gray-400 print:text-gray-700">Média por Jogo</div>
            </div>
            <div className="text-center">
              <div className="text-4xl print:text-5xl font-bold text-white print:text-black">{stats.highestScore}</div>
              <div className="text-lg print:text-xl text-gray-400 print:text-gray-700">Maior Pontuação</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Histórico de Jogos */}
      {allMatches.length > 0 && (
        <Card className="bg-gray-800 border-gray-700 p-8 print:bg-white print:border-gray-300">
          <div className="flex items-center gap-4 mb-8">
            <Trophy className="w-8 h-8 text-blue-400" />
            <h3 className="text-3xl print:text-4xl font-bold text-white print:text-black">Histórico Completo de Jogos</h3>
          </div>
          
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-gray-600 print:border-gray-300">
                  <TableHead className="text-gray-300 print:text-gray-700 w-20 text-xl print:text-2xl font-bold">Jogo</TableHead>
                  <TableHead className="text-gray-300 print:text-gray-700 text-xl print:text-2xl font-bold">Participante 1</TableHead>
                  <TableHead className="text-gray-300 print:text-gray-700 text-center text-xl print:text-2xl font-bold">Placar</TableHead>
                  <TableHead className="text-gray-300 print:text-gray-700 text-xl print:text-2xl font-bold">Participante 2</TableHead>
                  <TableHead className="text-gray-300 print:text-gray-700 text-center text-xl print:text-2xl font-bold">Vencedor</TableHead>
                  {allMatches.some(m => m.phase) && (
                    <TableHead className="text-gray-300 print:text-gray-700 text-center text-xl print:text-2xl font-bold">Fase</TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {allMatches.map((match, index) => {
                  const team1Name = getTeamName(match.teamIds[0], tournamentData);
                  const team2Name = getTeamName(match.teamIds[1], tournamentData);
                  const isTeam1Winner = match.winnerId === match.teamIds[0] || 
                    (Array.isArray(match.teamIds[0]) && Array.isArray(match.winnerId) && 
                     match.teamIds[0].every(id => match.winnerId.includes(id)));
                  
                  return (
                    <TableRow key={match.id} className="border-gray-600 print:border-gray-300">
                      <TableCell className="font-medium text-white print:text-black text-xl print:text-2xl">{index + 1}</TableCell>
                      <TableCell className={`text-xl print:text-2xl ${isTeam1Winner ? 'font-bold text-green-400 print:text-green-700' : 'text-white print:text-black'}`}>
                        {team1Name}
                      </TableCell>
                      <TableCell className="text-center font-bold text-white print:text-black text-xl print:text-2xl">
                        {match.score1} x {match.score2}
                      </TableCell>
                      <TableCell className={`text-xl print:text-2xl ${!isTeam1Winner ? 'font-bold text-green-400 print:text-green-700' : 'text-white print:text-black'}`}>
                        {team2Name}
                      </TableCell>
                      <TableCell className="text-center text-green-400 print:text-green-700 font-semibold text-xl print:text-2xl">
                        {isTeam1Winner ? team1Name : team2Name}
                      </TableCell>
                      {allMatches.some(m => m.phase) && (
                        <TableCell className="text-center">
                          <Badge variant="outline" className="text-lg print:text-xl print:border-gray-400 px-3 py-1">
                            {match.phase || 'Regular'}
                          </Badge>
                        </TableCell>
                      )}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
          
          <div className="mt-6 text-lg print:text-xl text-gray-400 print:text-gray-600">
            Total de jogos realizados: {allMatches.length}
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
