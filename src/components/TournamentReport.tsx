import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FileText, Download, Trophy, Users, Target, Printer, Crown } from 'lucide-react';
import ReportHeader from './tournament-report/ReportHeader';
import DoublesGroupsFormation from './tournament-report/DoublesGroupsFormation';
import DoublesGamesByPhase from './tournament-report/DoublesGamesByPhase';
import DoublesMedalSummary from './tournament-report/DoublesMedalSummary';
import FinalStandingsTable from './tournament-report/FinalStandingsTable';
import TournamentStatistics from './tournament-report/TournamentStatistics';
import MatchResults from './tournament-report/MatchResults';

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

  const getFormatName = (format: string) => {
    const formats = {
      super8: 'Super 8',
      doubles_groups: 'Torneio de Duplas',
      super16: 'Super 16',
      king_of_the_court: 'Rei da Quadra'
    };
    return formats[format] || format;
  };

  const finalStandings = getFinalStandings();
  const allMatches = getAllMatches();

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

  // NOVA exibição consolidada relatorio para "doubles_groups"
  if (tournamentData.format === 'doubles_groups') {
    return (
      <div className="print:p-6 p-0">
        <ReportHeader title={`Relatório do Torneio - Formato Duplas`} />
        <DoublesGroupsFormation tournamentData={tournamentData} />
        <DoublesGamesByPhase tournamentData={tournamentData} />
        <DoublesMedalSummary tournamentData={tournamentData} />
      </div>
    );
  }

  return (
    <div className="space-y-3 print:space-y-2 print:bg-white max-w-full overflow-hidden">
      {/* Print Controls - Hidden on print */}
      <Card className="bg-gray-800 border-gray-700 p-4 print:hidden">
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

      {/* Header with tournament title */}
      <div className="text-center print:mb-4 mb-3">
        <h1 className="text-2xl print:text-3xl font-bold text-white print:text-black mb-1">
          {tournamentData.name}
        </h1>
        <h2 className="text-lg print:text-xl font-semibold text-gray-300 print:text-gray-700 mb-2">
          RELATÓRIO FINAL DO TORNEIO
        </h2>
        <div className="text-sm print:text-sm text-gray-400 print:text-gray-600">
          <p>Data: {new Date(tournamentData.createdAt || Date.now()).toLocaleDateString('pt-BR', { 
            day: '2-digit', 
            month: 'long', 
            year: 'numeric' 
          })}</p>
        </div>
      </div>

      {/* Classificação Final */}
      <Card className="bg-gray-800 border-gray-700 p-3 print:bg-white print:border-gray-300 print:shadow-none">
        <FinalStandingsTable standings={finalStandings} />
      </Card>

      {/* NOVO: Chaves/grupos + todas fases e jogos duplas */}
      {tournamentData.format === 'doubles_groups' && (
        <Card className="bg-gray-900 border-gray-700 p-3 print:bg-gray-200 print:border-gray-300 print:shadow-none">
          <h3 className="text-base print:text-lg font-bold text-white print:text-black mb-2">
            Chaves e Fases do Torneio
          </h3>
          {/* Já renderizado acima, manter lógica se houver customização futura */}
        </Card>
      )}

      {/* Estatísticas */}
      <Card className="bg-gray-800 border-gray-700 p-3 print:bg-white print:border-gray-300 print:shadow-none">
        <TournamentStatistics stats={stats} />
      </Card>

      {/* Resultados dos Jogos */}
      {tournamentData.format !== 'doubles_groups' && allMatches.length > 0 && (
        <Card className="bg-gray-800 border-gray-700 p-3 print:bg-white print:border-gray-300 print:shadow-none">
          <MatchResults
            matches={allMatches}
            getTeamName={getTeamName}
            tournamentData={tournamentData}
          />
        </Card>
      )}
    </div>
  );
};

// Helper functions

export default TournamentReport;
