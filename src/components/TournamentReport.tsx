import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FileText, Download, Trophy, Users, Target, Printer, Crown } from 'lucide-react';
import ReportHeader from './ReportHeader';
import DoublesGroupsFormation from './DoublesGroupsFormation';
import DoublesGamesByPhase from './DoublesGamesByPhase';
import DoublesMedalSummary from './DoublesMedalSummary';
import TournamentPrintReportDialog from './TournamentPrintReportDialog';

interface TournamentReportProps {
  tournamentData: any;
}

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

const TournamentReport = ({ tournamentData }: { tournamentData: any }) => {
  if (!tournamentData || !tournamentData.name) {
    return (
      <div className="space-y-8">
        <Card className="bg-gray-800 border-gray-700 p-8">
          <div className="text-center">
            <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-2">Relatório não disponível</h3>
            <p className="text-gray-400">Nenhum dado de torneio encontrado para gerar o relatório.</p>
          </div>
        </Card>
      </div>
    );
  }

  // Estado dos botões de impressão/download
  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    window.print(); // Download real: implementar se desejado
  };

  // Fases ordenadas
  const phasesOrder = [
    { key: 'group_stage', label: 'Fase de Grupos' },
    { key: 'round_of_16', label: 'Oitavas de Final' },
    { key: 'quarterfinals', label: 'Quartas de Final' },
    { key: 'semifinals', label: 'Semifinais' },
    { key: 'final', label: 'Final' },
    { key: 'third_place', label: 'Disputa 3º Lugar' }
  ];

  // Agrupar jogos por fase disputada
  const gamesByPhase = (() => {
    const matches = tournamentData.matches || [];
    if (!matches.length) return {};
    const grouped: Record<string, any[]> = {};
    matches.forEach((match: any) => {
      if (!grouped[match.phase]) grouped[match.phase] = [];
      grouped[match.phase].push(match);
    });
    return grouped;
  })();

  // Medalhistas finais
  const getFinalMedalists = () => {
    const finalMatch = (tournamentData.matches || []).find((m: any) => m.phase === "final" && m.winnerId);
    const thirdMatch = (tournamentData.matches || []).find((m: any) => m.phase === "third_place" && m.winnerId);

    let champion = "";
    let vice = "";
    let third = "";

    if (finalMatch) {
      champion = getTeamName(finalMatch.winnerId, tournamentData);
      const teamLoser = finalMatch.teamIds.find((tid: any) => tid !== finalMatch.winnerId);
      vice = getTeamName(teamLoser, tournamentData);
    }
    if (thirdMatch) {
      third = getTeamName(thirdMatch.winnerId, tournamentData);
    }
    return { champion, vice, third };
  };

  const { champion, vice, third } = getFinalMedalists();
  const finalStandings = getFinalStandings();
  const stats = getStatistics();

  return (
    <div className="print:bg-white w-full max-w-4xl mx-auto px-1 sm:px-4 pt-2 print:p-0 text-[13px]">
      {/* Botões de ação - só fora da impressão */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-2 print:hidden mb-2">
        <div />
        <div className="flex gap-2">
          <Button
            onClick={handlePrint}
            className="bg-blue-700 hover:bg-blue-800 text-white min-w-[135px] text-[13px] font-semibold"
          >
            <Printer className="w-4 h-4" /> Imprimir
          </Button>
          <Button
            onClick={handleDownload}
            className="bg-green-600 hover:bg-green-700 text-white min-w-[135px] text-[13px] font-semibold"
          >
            <Download className="w-4 h-4" /> Download
          </Button>
        </div>
      </div>

      {/* Título do torneio */}
      <div className="text-center mt-1 mb-3">
        <h1 className="font-extrabold text-2xl sm:text-3xl text-blue-800 print:text-blue-800 mb-1 uppercase tracking-tight">{tournamentData.name}</h1>
        <h2 className="text-[1.15rem] font-bold text-gray-800 print:text-black">Relatório Final do Torneio</h2>
        <p className="text-xs text-gray-500 font-medium print:text-black mt-0">
          Data: {new Date(tournamentData.createdAt || Date.now()).toLocaleDateString('pt-BR', {day: '2-digit', month: '2-digit', year: 'numeric'})}
        </p>
      </div>

      {/* Tabela de classificação */}
      <Card className="bg-white print:bg-white border border-blue-300 rounded-lg p-2 sm:p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <Crown className="w-5 h-5 text-yellow-500" />
          <span className="text-base font-bold text-blue-700">Classificação Final</span>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-blue-900 w-10 text-xs p-1">Pos.</TableHead>
                <TableHead className="text-blue-900 text-xs font-bold p-1">Nome</TableHead>
                <TableHead className="text-blue-900 text-center text-xs font-bold p-1">Jogos</TableHead>
                <TableHead className="text-blue-900 text-center text-xs font-bold p-1">Vitórias</TableHead>
                <TableHead className="text-blue-900 text-center text-xs font-bold p-1">Pontos Pró</TableHead>
                <TableHead className="text-blue-900 text-center text-xs font-bold p-1">Pontos Contra</TableHead>
                <TableHead className="text-blue-900 text-center text-xs font-bold p-1">Saldo</TableHead>
                <TableHead className="text-blue-900 text-center text-xs font-bold p-1">Aproveit.</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {finalStandings.map((participant, idx) => (
                <TableRow key={participant.id} className={
                  idx === 0 ? 'bg-yellow-50'
                    : idx === 1 ? 'bg-gray-100'
                    : idx === 2 ? 'bg-amber-100'
                    : ''
                }>
                  <TableCell className="font-bold text-blue-800 text-xs p-1 align-middle flex gap-1 items-center">
                    <span>{participant.position}º</span>
                    {participant.position === 1 && <span className="inline-block w-3 h-3 bg-yellow-400 rounded-full" />}
                    {participant.position === 2 && <span className="inline-block w-3 h-3 bg-gray-400 rounded-full" />}
                    {participant.position === 3 && <span className="inline-block w-3 h-3 bg-amber-600 rounded-full" />}
                  </TableCell>
                  <TableCell className="text-blue-950 p-1 font-bold text-xs">
                    {participant.name}
                  </TableCell>
                  <TableCell className="text-center text-blue-900 text-xs p-1">{participant.gamesPlayed || 0}</TableCell>
                  <TableCell className="text-center text-blue-900 font-bold text-xs p-1">{participant.wins || 0}</TableCell>
                  <TableCell className="text-center text-blue-900 text-xs p-1">{participant.pointsFor || 0}</TableCell>
                  <TableCell className="text-center text-blue-900 text-xs p-1">{participant.pointsAgainst || 0}</TableCell>
                  <TableCell className={`text-center font-bold text-xs p-1 ${participant.pointsDiff >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                    {participant.pointsDiff >= 0 ? '+' : ''}{participant.pointsDiff}
                  </TableCell>
                  <TableCell className="text-center text-blue-900 text-xs p-1">{participant.winRate}%</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="mt-2 text-xs text-gray-500">
          <strong>Critérios de desempate:</strong> 1º Vitórias, 2º Saldo de pontos (pró - contra)
        </div>
      </Card>

      {/* Lista de jogos por fase */}
      <div className="mt-5">
        {phasesOrder.map(phase => (
          gamesByPhase[phase.key] && gamesByPhase[phase.key].length > 0 && (
            <div key={phase.key} className="mb-4">
              <div className="flex items-center gap-2 mb-1">
                <Trophy className="w-4 h-4 text-blue-600" />
                <span className="text-base font-bold text-blue-700">{phase.label}</span>
              </div>
              <div className="space-y-1 pl-2">
                {gamesByPhase[phase.key].map((match: any, i: number) => (
                  <div key={match.id}
                       className="flex flex-row items-center justify-between rounded border border-blue-100 px-2 py-1 bg-sky-50 text-[13px]">
                    <span className="font-bold text-blue-700 min-w-[60px]">Jogo {i + 1}</span>
                    <span className="flex-1 text-center text-blue-950 font-semibold">
                      {getTeamName(match.teamIds[0], tournamentData)}
                      <span className="mx-2 text-blue-500 font-normal">vs</span>
                      {getTeamName(match.teamIds[1], tournamentData)}
                    </span>
                    <span className="font-bold text-blue-800 px-2 min-w-[60px] text-center">
                      {match.score1 !== null && match.score2 !== null ? (
                        <span>{match.score1} x {match.score2}</span>
                      ) : (
                        <span className="text-xs text-gray-400">Pendente</span>
                      )}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )
        ))}
      </div>

      {/* Medalhistas finais */}
      <div className="my-5 flex flex-col items-center">
        <div className="border-2 border-blue-700 rounded-xl bg-blue-50 p-3 w-full max-w-xl">
          <h3 className="text-lg font-black text-blue-800 text-center uppercase mb-2">Destaques Finais</h3>
          <div className="flex flex-col sm:flex-row justify-between gap-3">
            <div className="flex-1 text-center">
              <span className="block text-blue-700 font-bold text-sm mb-1">Campeão</span>
              <span className="block font-black text-lg text-yellow-700">{champion || '-'}</span>
            </div>
            <div className="flex-1 text-center">
              <span className="block text-blue-700 font-bold text-sm mb-1">Finalista</span>
              <span className="block font-black text-lg text-gray-700">{vice || '-'}</span>
            </div>
            <div className="flex-1 text-center">
              <span className="block text-blue-700 font-bold text-sm mb-1">3º Lugar</span>
              <span className="block font-black text-lg text-amber-700">{third || '-'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TournamentReport;
