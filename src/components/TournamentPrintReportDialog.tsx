
import React from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Printer, Trophy, Users, Crown, Target } from "lucide-react";

interface TournamentPrintReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tournamentData: any;
}

const getTeamName = (teamId: any, tournamentData: any) => {
  if (Array.isArray(teamId)) {
    const playerNames = teamId.map((playerId: string) => {
      const player = (tournamentData.players || []).find((p: any) => p.id === playerId);
      return player ? player.name : "Jogador";
    });
    return playerNames.join(" / ");
  }
  const team = (tournamentData.teams || []).find((t: any) => t.id === teamId);
  return team ? team.name : "Time";
};

const phasesOrder = [
  { key: 'group_stage', label: 'Fase de Grupos' },
  { key: 'round_of_16', label: 'Oitavas de Final' },
  { key: 'quarterfinals', label: 'Quartas de Final' },
  { key: 'semifinals', label: 'Semifinais' },
  { key: 'final', label: 'Final' },
  { key: 'third_place', label: 'Disputa 3º Lugar' }
];

const TournamentPrintReportDialog: React.FC<TournamentPrintReportDialogProps> = ({ open, onOpenChange, tournamentData }) => {
  if (!tournamentData) return null;

  // Classificação final — mesma lógica do relatório
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

  // Estatísticas principais
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

  const standings = getFinalStandings();
  const stats = getStatistics();

  // Agrupar jogos por fase — mesmos dados do relatório
  const gamesByPhase = (() => {
    const matches = tournamentData.matches || [];
    if (!matches.length) return {};
    const grouped: Record<string, any[]> = {};
    matches.filter((m: any) => m.winnerId).forEach((match: any) => {
      if (!grouped[match.phase]) grouped[match.phase] = [];
      grouped[match.phase].push(match);
    });
    return grouped;
  })();

  // Grupos
  const groups = tournamentData.groups || [];

  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-5xl bg-white border border-blue-400 print:!block print:!static print:w-full print:!max-w-full print:border-none p-0">
        <DialogTitle className="text-2xl font-bold text-blue-700 text-center mt-4 mb-1 print:mt-0">{tournamentData.name}</DialogTitle>
        <DialogDescription className="text-lg font-semibold text-center text-black mb-2 print:mb-1">
          Relatório Final do Torneio
        </DialogDescription>
        {/* Data de geração */}
        <div className="text-sm text-center mb-6 text-black">Data de Geração: {new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date())}</div>
        {/* Botão Imprimir */}
        <div className="text-center mb-6 print:hidden">
          <Button
            onClick={handlePrint}
            className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
          >
            <Printer className="w-5 h-5" />
            Imprimir relatório
          </Button>
        </div>
        {/* Classificação Final */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Crown className="w-5 h-5 text-yellow-500" />
            <h3 className="text-base font-bold text-blue-700">Classificação Final</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-base border border-gray-300 rounded">
              <thead>
                <tr className="bg-blue-100">
                  <th className="p-1 text-xs font-bold text-blue-700">Pos.</th>
                  <th className="p-1 text-xs font-bold text-blue-700">Nome</th>
                  <th className="p-1 text-xs font-bold text-blue-700">Jogos</th>
                  <th className="p-1 text-xs font-bold text-blue-700">Vitórias</th>
                  <th className="p-1 text-xs font-bold text-blue-700">Pontos Pró</th>
                  <th className="p-1 text-xs font-bold text-blue-700">Pontos Contra</th>
                  <th className="p-1 text-xs font-bold text-blue-700">Saldo</th>
                  <th className="p-1 text-xs font-bold text-blue-700">Aproveitamento</th>
                </tr>
              </thead>
              <tbody>
                {standings.map((participant, idx) => (
                  <tr key={participant.id} className="even:bg-gray-100">
                    <td className="text-center font-bold">{participant.position}º</td>
                    <td>
                      <div className="font-bold text-xs">{participant.name}</div>
                      {participant.players && (
                        <div className="text-xs text-gray-500">{participant.players.join(' / ')}</div>
                      )}
                    </td>
                    <td className="text-center">{participant.gamesPlayed || 0}</td>
                    <td className="text-center">{participant.wins || 0}</td>
                    <td className="text-center">{participant.pointsFor || 0}</td>
                    <td className="text-center">{participant.pointsAgainst || 0}</td>
                    <td className={`text-center font-bold ${participant.pointsDiff >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {participant.pointsDiff >= 0 ? '+' : ''}{participant.pointsDiff}
                    </td>
                    <td className="text-center">{participant.winRate}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        {/* Formação das Chaves */}
        {groups.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-5 h-5 text-blue-500" />
              <h3 className="text-base font-bold text-blue-700">Formação das Chaves</h3>
            </div>
            <div className="flex flex-wrap gap-5 justify-center">
              {groups.map((group: any) => (
                <div
                  key={group.id}
                  className="bg-white border border-blue-300 rounded-lg p-4 min-w-[220px] flex-1"
                >
                  <div className="text-lg font-bold text-blue-600 mb-1">{group.name}</div>
                  <ol className="list-decimal ml-4">
                    {group.teamIds.map((tid: string, idx: number) => (
                      <li key={tid} className="text-base text-black font-medium">
                        {getTeamName(tid, tournamentData)}
                      </li>
                    ))}
                  </ol>
                </div>
              ))}
            </div>
          </div>
        )}
        {/* Jogos por Fase */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Trophy className="w-5 h-5 text-blue-500" />
            <h3 className="text-base font-bold text-blue-700">Jogos por Fase</h3>
          </div>
          <div className="space-y-3">
            {phasesOrder.map(phase =>
              gamesByPhase[phase.key] && gamesByPhase[phase.key].length > 0 && (
                <div key={phase.key}>
                  <div className="font-bold text-blue-600 mb-1">{phase.label}</div>
                  <div className="space-y-1">
                    {gamesByPhase[phase.key].map((match, i) => (
                      <div
                        key={match.id}
                        className="border border-blue-200 rounded-lg bg-white px-5 py-2 flex flex-col sm:flex-row justify-between items-center gap-2"
                      >
                        <div className="font-bold text-blue-600 min-w-[110px]">Jogo {i + 1}</div>
                        <div className="flex-1 flex flex-col sm:flex-row items-center justify-center gap-2">
                          <span className="font-semibold text-black min-w-[120px] text-center">
                            {getTeamName(match.teamIds[0], tournamentData)}
                            <span className="font-normal text-gray-700 mx-2">vs</span>
                            {getTeamName(match.teamIds[1], tournamentData)}
                          </span>
                        </div>
                        <div className="font-bold min-w-[70px] text-right text-blue-800">
                          {match.score1 !== null && match.score2 !== null ? (
                            <span>{match.score1} x {match.score2}</span>
                          ) : (
                            <span className="text-xs text-gray-400">Pendente</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            )}
          </div>
        </div>
        {/* Estatísticas */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-5 h-5 text-green-500" />
            <h3 className="text-base font-bold text-blue-700">Estatísticas do Torneio</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="text-center">
              <div className="text-lg font-bold text-black">{stats.totalParticipants}</div>
              <div className="text-xs text-gray-700 mt-1">Participantes</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-black">{stats.completedMatches}</div>
              <div className="text-xs text-gray-700 mt-1">Jogos Realizados</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-black">{stats.totalPoints}</div>
              <div className="text-xs text-gray-700 mt-1">Total de Pontos</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-black">{stats.highestScore}</div>
              <div className="text-xs text-gray-700 mt-1">Maior Pontuação</div>
            </div>
          </div>
        </div>
        {/* Fechar */}
        <button
          type="button"
          aria-label="Fechar"
          onClick={() => onOpenChange(false)}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground print:hidden"
        >
          <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none"><path d="M3.5 3.5l9 9m-9 0l9-9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
          <span className="sr-only">Fechar</span>
        </button>
      </DialogContent>
    </Dialog>
  );
};

export default TournamentPrintReportDialog;
