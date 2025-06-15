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

  const handlePrintGameList = () => {
    window.print(); // Se atualizar depois, pode ser customizado só para jogos
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

  // Utilitário: Listar jogos por fase, incluindo finais
  const getGamesByPhase = () => {
    const matches = tournamentData.matches || [];
    if (!matches.length) return [];
    // Agrupar por fase
    const grouped: Record<string, any[]> = {};
    matches.filter(m => m.winnerId).forEach(match => {
      if (!grouped[match.phase]) grouped[match.phase] = [];
      grouped[match.phase].push(match);
    });
    return grouped;
  };

  // Utilitário: Campeão, finalista, terceiro
  const getFinalMedalists = () => {
    // Buscar final
    const finalMatch = (tournamentData.matches || []).find(m => m.phase === "final" && m.winnerId);
    const thirdMatch = (tournamentData.matches || []).find(m => m.phase === "third_place" && m.winnerId);

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

  // Função para renderizar chaves + todos os jogos, apenas para doubles_groups
  function renderDoublesPhasesAndGames() {
    // Formação das chaves (groups)
    const groupCards = tournamentData.groups && tournamentData.groups.length > 0 && (
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <Users className="w-5 h-5 text-blue-400 print:text-blue-600" />
          <h3 className="text-base print:text-lg font-bold text-white print:text-black">Formação das Chaves</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tournamentData.groups.map((group: any) => (
            <div key={group.id} className="bg-gray-700 print:bg-gray-50 border rounded-lg p-3">
              <div className="font-bold text-blue-300 mb-2">{group.name}</div>
              <ol className="space-y-1">
                {group.teamIds.map((tid: string, idx: number) => {
                  const team = (tournamentData.teams || []).find((t: any) => t.id === tid);
                  return (
                    <li key={tid} className="text-white print:text-black text-sm">
                      <span className="font-bold">{idx + 1}.</span> {team ? team.name : 'Dupla'}
                    </li>
                  );
                })}
              </ol>
            </div>
          ))}
        </div>
      </div>
    );

    // Todos Jogos por Fase (inclusive finais)
    // (Mesmo phasesOrder do uso antigo)
    const phasesOrder = [
      { key: 'group_stage', label: 'Fase de Grupos' },
      { key: 'round_of_16', label: 'Oitavas de Final' },
      { key: 'quarterfinals', label: 'Quartas de Final' },
      { key: 'semifinals', label: 'Semifinais' },
      { key: 'final', label: 'Final' },
      { key: 'third_place', label: 'Disputa 3º Lugar' }
    ];

    // Agrupar jogos por fase
    const gamesByPhase = (() => {
      const matches = tournamentData.matches || [];
      if (!matches.length) return {};
      // Agrupar por fase
      const grouped: Record<string, any[]> = {};
      matches.filter((m: any) => m.winnerId).forEach((match: any) => {
        if (!grouped[match.phase]) grouped[match.phase] = [];
        grouped[match.phase].push(match);
      });
      return grouped;
    })();

    return (
      <>
        {groupCards}
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
      </>
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
          {/* Botões alinhados horizontalmente */}
          <div className="flex flex-wrap gap-3 sm:gap-2">
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
            {/* Botão verde - Imprimir lista de jogos */}
            <Button
              onClick={handlePrintGameList}
              className="bg-emerald-700 hover:bg-emerald-800 flex items-center gap-2"
            >
              <Printer className="w-4 h-4" />
              Imprimir lista de jogos
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
        <div className="flex items-center gap-3 mb-3">
          <Crown className="w-5 h-5 text-yellow-400 print:text-yellow-600" />
          <h3 className="text-base print:text-lg font-bold text-white print:text-black">Classificação Final</h3>
        </div>
        
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-gray-600 print:border-gray-300">
                <TableHead className="text-gray-300 print:text-gray-700 w-12 text-xs font-bold p-1">Pos.</TableHead>
                <TableHead className="text-gray-300 print:text-gray-700 text-xs font-bold p-1">Nome</TableHead>
                <TableHead className="text-gray-300 print:text-gray-700 text-center text-xs font-bold p-1">Jogos</TableHead>
                <TableHead className="text-gray-300 print:text-gray-700 text-center text-xs font-bold p-1">Vitórias</TableHead>
                <TableHead className="text-gray-300 print:text-gray-700 text-center text-xs font-bold p-1">Pontos Pró</TableHead>
                <TableHead className="text-gray-300 print:text-gray-700 text-center text-xs font-bold p-1">Pontos Contra</TableHead>
                <TableHead className="text-gray-300 print:text-gray-700 text-center text-xs font-bold p-1">Saldo</TableHead>
                <TableHead className="text-gray-300 print:text-gray-700 text-center text-xs font-bold p-1">Aproveitamento</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {finalStandings.map((participant) => (
                <TableRow key={participant.id} className="border-gray-600 print:border-gray-300">
                  <TableCell className="font-bold text-white print:text-black text-xs p-1">
                    <div className="flex items-center gap-1">
                      <span className="text-xs">{participant.position}º</span>
                      {participant.position <= 3 && (
                        <div className={`w-2 h-2 rounded-full ${
                          participant.position === 1 ? 'bg-yellow-500' : 
                          participant.position === 2 ? 'bg-gray-400' : 'bg-amber-600'
                        }`} />
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-white print:text-black p-1">
                    <div>
                      <div className="font-bold text-xs">{participant.name}</div>
                      {participant.players && (
                        <div className="text-xs text-gray-400 print:text-gray-600">
                          {participant.players.join(' / ')}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-center text-white print:text-black text-xs p-1">{participant.gamesPlayed || 0}</TableCell>
                  <TableCell className="text-center text-white print:text-black font-bold text-xs p-1">{participant.wins || 0}</TableCell>
                  <TableCell className="text-center text-white print:text-black text-xs p-1">{participant.pointsFor || 0}</TableCell>
                  <TableCell className="text-center text-white print:text-black text-xs p-1">{participant.pointsAgainst || 0}</TableCell>
                  <TableCell className={`text-center font-bold text-xs p-1 ${participant.pointsDiff >= 0 ? 'text-green-400 print:text-green-700' : 'text-red-400 print:text-red-700'}`}>
                    {participant.pointsDiff >= 0 ? '+' : ''}{participant.pointsDiff}
                  </TableCell>
                  <TableCell className="text-center text-white print:text-black text-xs p-1">{participant.winRate}%</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        
        {finalStandings.length > 0 && (
          <div className="mt-2 text-xs text-gray-400 print:text-gray-600">
            <strong>Critérios de Desempate:</strong> 1º Número de vitórias, 2º Saldo de pontos (pontos pró - pontos contra)
          </div>
        )}
      </Card>

      {/* NOVO: Chaves/grupos + todas fases e jogos duplas (abaixo classificação) */}
      {tournamentData.format === 'doubles_groups' && (
        <>
          <Card className="bg-gray-900 border-gray-700 p-3 print:bg-gray-200 print:border-gray-300 print:shadow-none">
            <h3 className="text-base print:text-lg font-bold text-white print:text-black mb-2">
              Chaves e Fases do Torneio
            </h3>
            {renderDoublesPhasesAndGames()}
          </Card>
        </>
      )}

      {/* Estatísticas (mantido) */}
      <Card className="bg-gray-800 border-gray-700 p-3 print:bg-white print:border-gray-300 print:shadow-none">
        <div className="flex items-center gap-3 mb-3">
          <Target className="w-5 h-5 text-green-400 print:text-green-600" />
          <h3 className="text-base print:text-lg font-bold text-white print:text-black">Estatísticas do Torneio</h3>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="text-center">
            <div className="text-lg print:text-xl font-bold text-white print:text-black">{stats.totalParticipants}</div>
            <div className="text-xs text-gray-400 print:text-gray-700 mt-1">Participantes</div>
          </div>
          <div className="text-center">
            <div className="text-lg print:text-xl font-bold text-white print:text-black">{stats.completedMatches}</div>
            <div className="text-xs text-gray-400 print:text-gray-700 mt-1">Jogos Realizados</div>
          </div>
          <div className="text-center">
            <div className="text-lg print:text-xl font-bold text-white print:text-black">{stats.totalPoints}</div>
            <div className="text-xs text-gray-400 print:text-gray-700 mt-1">Total de Pontos</div>
          </div>
          <div className="text-center">
            <div className="text-lg print:text-xl font-bold text-white print:text-black">{stats.highestScore}</div>
            <div className="text-xs text-gray-400 print:text-gray-700 mt-1">Maior Pontuação</div>
          </div>
        </div>
      </Card>

      {/* Resultados dos Jogos (mantido para outros formatos) */}
      {tournamentData.format !== 'doubles_groups' && allMatches.length > 0 && (
        <Card className="bg-gray-800 border-gray-700 p-3 print:bg-white print:border-gray-300 print:shadow-none">
          <div className="flex items-center gap-3 mb-3">
            <Trophy className="w-5 h-5 text-blue-400 print:text-blue-600" />
            <h3 className="text-base print:text-lg font-bold text-white print:text-black">Resultados dos Jogos</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {allMatches.map((match, index) => {
              const team1Name = getTeamName(match.teamIds[0], tournamentData);
              const team2Name = getTeamName(match.teamIds[1], tournamentData);
              
              return (
                <div key={match.id} className="flex items-center justify-between bg-gray-700 print:bg-gray-50 p-2 rounded-lg border print:border-gray-200">
                  <div className="text-sm font-semibold text-blue-400 print:text-blue-600 min-w-[50px]">
                    Jogo {index + 1}
                  </div>
                  <div className="flex-1 text-center px-2">
                    <div className="text-xs text-white print:text-black">
                      <span className="font-medium">{team1Name}</span>
                      <span className="text-gray-400 print:text-gray-600 mx-1">vs</span>
                      <span className="font-medium">{team2Name}</span>
                    </div>
                  </div>
                  <div className="text-sm font-bold text-white print:text-black min-w-[50px] text-right">
                    {match.score1} x {match.score2}
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="mt-2 text-xs text-gray-400 print:text-gray-600">
            <strong>Total de jogos realizados:</strong> {allMatches.length}
          </div>
        </Card>
      )}
    </div>
  );
};

// Helper functions

export default TournamentReport;
