import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Trophy, Check, Clock, Users, Crown, Medal, History } from 'lucide-react';
import { generateMatches, getQualifiedTeams, getNextPhase } from '@/utils/tournamentLogic';
import { getPhaseTitle } from '@/utils/phaseUtils';
import PhaseHistory from './PhaseHistory';

interface MatchManagerProps {
  tournamentData: any;
  onUpdate: (updates: any) => void;
}

const MatchManager = ({ tournamentData, onUpdate }: MatchManagerProps) => {
  const { toast } = useToast();
  const [scores, setScores] = useState<{ [key: string]: { score1: string; score2: string } }>({});
  const [showPhasePanel, setShowPhasePanel] = useState(false);
  const [showBackupModal, setShowBackupModal] = useState(false);
  const [activePhaseHistory, setActivePhaseHistory] = useState(false);

  useEffect(() => {
    // Generate matches if needed and not already generated
    if (tournamentData.status !== 'registration' && (!tournamentData.matches || tournamentData.matches.length === 0)) {
      const matches = generateMatches(tournamentData);
      if (matches.length > 0) {
        onUpdate({ matches });
      }
    }
  }, [tournamentData.status]);

  const matches = tournamentData.matches || [];
  const currentPhaseMatches = matches.filter(match => match.phase === tournamentData.status);

  const handleScoreChange = (matchId: string, scoreType: 'score1' | 'score2', value: string) => {
    setScores(prev => ({
      ...prev,
      [matchId]: {
        ...prev[matchId],
        [scoreType]: value
      }
    }));
  };

  const handleSaveScore = (matchId: string) => {
    const matchScores = scores[matchId];
    if (!matchScores || !matchScores.score1 || !matchScores.score2) {
      toast({
        title: "Erro",
        description: "Preencha ambos os placares.",
        variant: "destructive",
      });
      return;
    }

    const score1 = parseInt(matchScores.score1);
    const score2 = parseInt(matchScores.score2);

    if (isNaN(score1) || isNaN(score2) || score1 < 0 || score2 < 0) {
      toast({
        title: "Erro",
        description: "Placares devem ser números válidos.",
        variant: "destructive",
      });
      return;
    }

    if (score1 === score2) {
      toast({
        title: "Erro",
        description: "Não é permitido empate. Um time deve vencer.",
        variant: "destructive",
      });
      return;
    }

    const match = matches.find(m => m.id === matchId);
    if (!match) return;

    const winnerId = score1 > score2 ? match.teamIds[0] : match.teamIds[1];
    
    const updatedMatches = matches.map(m => 
      m.id === matchId 
        ? { ...m, score1, score2, winnerId, completed: true }
        : m
    );

    // Update team statistics
    const teams = [...(tournamentData.teams || [])];
    const players = [...(tournamentData.players || [])];
    
    // For Super 8 format, update individual player stats
    if (tournamentData.format === 'super8') {
      match.teamIds[0].forEach((playerId: string) => {
        const player = players.find(p => p.id === playerId);
        if (player) {
          player.gamesPlayed = (player.gamesPlayed || 0) + 1;
          player.pointsFor = (player.pointsFor || 0) + score1;
          player.pointsAgainst = (player.pointsAgainst || 0) + score2;
          if (Array.isArray(winnerId) && winnerId.includes(playerId)) {
            player.wins = (player.wins || 0) + 1;
          }
        }
      });
      
      match.teamIds[1].forEach((playerId: string) => {
        const player = players.find(p => p.id === playerId);
        if (player) {
          player.gamesPlayed = (player.gamesPlayed || 0) + 1;
          player.pointsFor = (player.pointsFor || 0) + score2;
          player.pointsAgainst = (player.pointsAgainst || 0) + score1;
          if (Array.isArray(winnerId) && winnerId.includes(playerId)) {
            player.wins = (player.wins || 0) + 1;
          }
        }
      });
      
      onUpdate({ matches: updatedMatches, players });
    } else {
      // For team-based formats
      const team1 = teams.find(t => t.id === match.teamIds[0]);
      const team2 = teams.find(t => t.id === match.teamIds[1]);

      if (team1) {
        team1.gamesPlayed = (team1.gamesPlayed || 0) + 1;
        team1.pointsFor = (team1.pointsFor || 0) + score1;
        team1.pointsAgainst = (team1.pointsAgainst || 0) + score2;
        if (winnerId === team1.id) {
          team1.wins = (team1.wins || 0) + 1;
        }
      }

      if (team2) {
        team2.gamesPlayed = (team2.gamesPlayed || 0) + 1;
        team2.pointsFor = (team2.pointsFor || 0) + score2;
        team2.pointsAgainst = (team2.pointsAgainst || 0) + score1;
        if (winnerId === team2.id) {
          team2.wins = (team2.wins || 0) + 1;
        }
      }

      onUpdate({ matches: updatedMatches, teams });
    }

    setScores(prev => {
      const newScores = { ...prev };
      delete newScores[matchId];
      return newScores;
    });

    toast({
      title: "Placar salvo",
      description: "Resultado registrado com sucesso!",
    });

    // Check if current phase is completed for doubles tournament
    if (tournamentData.format === 'doubles_groups') {
      checkDoublesPhaseCompletion(updatedMatches, tournamentData, onUpdate, toast);
    } else {
      // Check if all matches are completed to update tournament status to finished
      const allMatchesCompleted = updatedMatches.every(match => match.winnerId);
      if (allMatchesCompleted && tournamentData.status !== 'finished') {
        onUpdate({ status: 'finished' });
        toast({
          title: "Torneio finalizado",
          description: "Todos os jogos foram concluídos! Verifique a classificação final.",
        });
      }
    }
  };

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
    if (tournamentData.format !== 'doubles_groups' || tournamentData.status !== 'group_stage') {
      return null;
    }

    const groups = tournamentData.groups || [];
    if (groups.length === 0) return null;

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

  const renderFinalResults = () => {
    if (tournamentData.format !== 'doubles_groups' || tournamentData.status !== 'finished') {
      return null;
    }

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
            <div className="mt-2 text-lg font-semibold text-yellow-800">
              {finalMatch.score1} x {finalMatch.score2}
            </div>
          </div>

          {/* Finalista */}
          <div className="bg-gray-300 rounded-lg p-6 text-center">
            <Medal className="w-12 h-12 text-gray-700 mx-auto mb-3" />
            <h3 className="text-xl font-bold text-gray-700 mb-2">FINALISTA</h3>
            <p className="text-2xl font-bold text-gray-700">{finalist?.name || 'Dupla'}</p>
            <div className="mt-2 text-lg font-semibold text-gray-600">
              Vice-Campeão
            </div>
          </div>

          {/* Terceiro Lugar */}
          <div className="bg-orange-400 rounded-lg p-6 text-center">
            <Trophy className="w-12 h-12 text-orange-800 mx-auto mb-3" />
            <h3 className="text-xl font-bold text-orange-800 mb-2">3º LUGAR</h3>
            <p className="text-2xl font-bold text-orange-800">{thirdPlace?.name || 'Dupla'}</p>
            <div className="mt-2 text-lg font-semibold text-orange-700">
              {thirdPlaceMatch.score1} x {thirdPlaceMatch.score2}
            </div>
          </div>
        </div>
      </Card>
    );
  };

  const getCompletedPhases = () => {
    if (tournamentData.format !== 'doubles_groups') return [];
    
    const matches = tournamentData.matches || [];
    const phases = [];
    
    // Check which phases have been completed
    const phaseOrder = ['group_stage', 'round_of_16', 'quarterfinals', 'semifinals', 'final', 'third_place'];
    
    for (const phase of phaseOrder) {
      const phaseMatches = matches.filter(match => match.phase === phase);
      if (phaseMatches.length > 0) {
        const completedMatches = phaseMatches.filter(match => match.winnerId);
        phases.push({
          phase,
          title: getPhaseTitle(phase),
          completed: completedMatches.length === phaseMatches.length,
          totalMatches: phaseMatches.length,
          completedMatches: completedMatches.length
        });
      }
    }
    
    return phases;
  };

  const getPhaseTitle = (phase: string) => {
    const phaseNames = {
      'group_stage': 'Fase de Grupos',
      'round_of_16': 'Oitavas de Final',
      'quarterfinals': 'Quartas de Final',
      'semifinals': 'Semifinais',
      'final': 'Final',
      'third_place': 'Disputa de 3º Lugar',
      'phase1_groups': 'Fase 1 - Grupos',
      'phase2_playoffs': 'Fase 2 - Playoffs',  
      'phase3_final': 'Fase 3 - Final',
      'playoffs': 'Playoffs',
      'finished': 'Torneio Finalizado'
    };
    return phaseNames[phase] || 'Jogos do Torneio';
  };

  const renderGroupsByPhase = (phase: string) => {
    // Apenas duplas
    if (tournamentData.format !== 'doubles_groups') return null;
    const groups = (tournamentData.groups || []).filter((g:any) =>
      (phase === 'group_stage' && g.id.startsWith('g_group_stage_'))
      || (phase === 'round_of_16' && g.id.startsWith('g_round_of_16_'))
      || (phase === 'quarterfinals' && g.id.startsWith('g_quarterfinals_'))
      || (phase === 'semifinals' && g.id.startsWith('g_semifinals_'))
      || (phase === 'final' && g.id.startsWith('g_final_'))
    );
    if (!groups.length) return null;

    return (
      <div className="mb-4">
        <h4 className="text-lg text-white font-bold mb-2">Chaves da fase ({getPhaseTitle(phase)})</h4>
        <div className="flex gap-4 flex-wrap">
          {groups.map((group: any) => (
            <div key={group.id} className="bg-gray-700 border border-gray-600 rounded-lg p-4 min-w-[180px]">
              <div className="font-bold text-blue-300 mb-2">{group.name}</div>
              <ol className="space-y-1">
                {group.teamIds.map((tid:string, idx:number) => {
                  const team = (tournamentData.teams || []).find((t:any) => t.id === tid);
                  return (
                    <li key={tid} className="text-white text-sm">
                      <span className="font-bold">{idx+1}.</span> {team ? team.name : 'Dupla'}
                    </li>
                  );
                })}
              </ol>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderPhasesPanel = () => {
    if (tournamentData.format !== 'doubles_groups') return null;
    // Os nomes das fases relevantes
    const phaseOrder = ['group_stage','round_of_16','quarterfinals','semifinals','final','third_place'];
    return (
      <div className="fixed inset-0 bg-black/[.85] z-40 flex items-center justify-center p-6 print:static print:bg-transparent">
        <div className="max-w-5xl w-full bg-gray-800 border border-gray-700 rounded-xl p-6 overflow-y-auto max-h-[97vh] shadow-2xl relative">
          <button
            onClick={() => setShowPhasePanel(false)}
            className="absolute top-2 right-4 bg-gray-900 text-white rounded px-3 py-1 text-xs font-medium hover:bg-gray-700 print:hidden"
          >Fechar</button>
          <h2 className="text-2xl font-bold mb-5 text-center text-white">Todas as Fases e Partidas</h2>
          <div className="space-y-8">
            {phaseOrder.map(phase => {
              const phaseMatches = (tournamentData.matches || []).filter((m:any) => m.phase === phase);
              if (!phaseMatches.length) return null;
              return (
                <div key={phase} className="rounded-lg border border-gray-700 bg-gray-700 p-4">
                  <h3 className="text-xl font-semibold text-blue-400 mb-3">{getPhaseTitle(phase)}</h3>
                  {renderGroupsByPhase(phase)}
                  <div className="space-y-2">
                    {phaseMatches.map((match:any, i:number) => (
                      <div key={match.id} className="flex items-center justify-between bg-gray-800 rounded p-2">
                        <div className="text-gray-200 text-sm min-w-[110px]">
                          Jogo {i+1}
                        </div>
                        <div className="flex-1 text-center">
                          <span className="font-medium text-white">{getTeamName(match.teamIds[0])}</span>
                          <span className="text-gray-400 mx-2">vs</span>
                          <span className="font-medium text-white">{getTeamName(match.teamIds[1])}</span>
                        </div>
                        <div className="text-white font-bold min-w-[70px] text-right">
                          {match.score1 !== null && match.score2 !== null ? (
                            <span>{match.score1} x {match.score2}</span>
                          ): <span className="text-xs text-gray-400">Pendente</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    );
  };

  const renderPrintableGroups = () => {
    if (
      tournamentData.format !== 'doubles_groups' ||
      !tournamentData.groups ||
      tournamentData.groups.length === 0
    ) return null;

    return (
      <div className="mb-6 break-inside-avoid">
        <h3 className="text-xl font-bold text-center text-black mb-3 print:mb-3">Formação das Chaves</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tournamentData.groups.map((group: any) => (
            <div key={group.id} className="border border-gray-400 rounded-lg p-3 bg-gray-50">
              <div className="font-bold text-blue-700 mb-2">{group.name}</div>
              <ol className="space-y-1">
                {group.teamIds.map((tid: string, idx: number) => {
                  const team = (tournamentData.teams || []).find((t: any) => t.id === tid);
                  return (
                    <li key={tid} className="text-black text-sm">
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
  };

  const renderBackupModal = () => {
    if (!showBackupModal) return null;
    if (tournamentData.format !== "doubles_groups") return null;
    const allMatches = tournamentData.matches || [];

    // Ordena: por fase, depois por ordem no array (opcional: refine se desejar)
    const phaseOrderObj: Record<string, number> = {
      group_stage: 0, round_of_16: 1, quarterfinals: 2, semifinals: 3, final: 4, third_place: 5
    };
    const orderedMatches = [...allMatches].sort((a: any, b: any) => (phaseOrderObj[a.phase] ?? 999) - (phaseOrderObj[b.phase] ?? 999));

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 print:bg-white print:static print:block" style={{printColorAdjust:'exact'}}>
        <div className="max-w-3xl w-full bg-white rounded-lg p-6 shadow-2xl overflow-auto relative print:shadow-none print:rounded-none print:p-4">
          <button 
            onClick={() => setShowBackupModal(false)} 
            className="absolute top-2 right-4 bg-gray-900 text-white rounded px-3 py-1 text-xs font-medium hover:bg-gray-700 print:hidden"
          >Fechar</button>
          <h2 className="text-2xl font-bold text-center mb-2 text-black print:text-black">Lista de Jogos (Backup)</h2>
          {/* Chaves antes dos jogos */}
          {renderPrintableGroups()}
          <div>
            <h3 className="mb-2 mt-6 text-lg font-bold text-black print:text-black">Listagem de Jogos</h3>
            <table className="min-w-full border print:text-black">
              <thead>
                <tr>
                  <th className="border px-2 py-1 text-xs">Fase</th>
                  <th className="border px-2 py-1 text-xs">Jogo</th>
                  <th className="border px-2 py-1 text-xs">Duplas</th>
                  <th className="border px-2 py-1 text-xs">Placar</th>
                </tr>
              </thead>
              <tbody>
                {orderedMatches.map((match: any, idx: number) => (
                  <tr key={match.id}>
                    <td className="border px-2 py-1 text-xs">
                      {getPhaseTitle(match.phase)}
                    </td>
                    <td className="border px-2 py-1 text-xs">
                      {match.phase === 'final' ? 'FINAL' : 
                        match.phase === 'third_place' ? '3º LUGAR' : 
                        `Jogo ${idx + 1}`
                      }
                    </td>
                    <td className="border px-2 py-1 text-xs">
                      {getTeamName(match.teamIds[0])} vs {getTeamName(match.teamIds[1])}
                    </td>
                    <td className="border px-2 py-1 text-xs font-bold">
                      {match.score1 != null && match.score2 != null ? `${match.score1} x ${match.score2}` : ' - '}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-5 flex justify-between print:hidden">
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              onClick={() => window.print()}
            >
              Imprimir página
            </button>
            <button
              className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
              onClick={() => setShowBackupModal(false)}
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    )
  };

  const renderPhaseHistoryModal = () => {
    if (!activePhaseHistory || tournamentData.format !== "doubles_groups") return null;
    const matches = tournamentData.matches || [];
    const phaseOrder = [
      'group_stage',
      'round_of_16',
      'quarterfinals',
      'semifinals',
      'final',
      'third_place',
    ];
    const phaseLabels: Record<string,string> = {
      group_stage:'Fase de Grupos', round_of_16:'Oitavas de Final', quarterfinals:'Quartas de Final', semifinals:'Semifinais', final:'Final', third_place:'Disputa 3º Lugar'
    };
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 print:bg-transparent print:static print:block">
        <div className="max-w-4xl w-full bg-white rounded-lg p-6 shadow-2xl overflow-auto relative print:shadow-none print:p-4 print:rounded-none">
          <button
            onClick={() => setActivePhaseHistory(false)}
            className="absolute top-2 right-4 bg-gray-900 text-white rounded px-3 py-1 text-xs font-medium hover:bg-gray-700 print:hidden"
          >Fechar</button>
          <h2 className="text-2xl font-bold text-center mb-4 text-black print:text-black">Histórico de Fases</h2>
          {phaseOrder.map(phase => {
            const phaseMatches = matches.filter((m: any) => m.phase === phase);
            if (!phaseMatches.length) return null;
            return (
              <div key={phase} className="mb-6 break-inside-avoid">
                <h3 className="text-lg font-bold mb-2 text-blue-700">
                  {phaseLabels[phase] || phase}
                </h3>
                <table className="min-w-full border mb-3 print:text-black">
                  <thead>
                    <tr>
                      <th className="border px-2 py-1 text-xs">Jogo</th>
                      <th className="border px-2 py-1 text-xs">Duplas</th>
                      <th className="border px-2 py-1 text-xs">Placar</th>
                      <th className="border px-2 py-1 text-xs">Vencedor</th>
                    </tr>
                  </thead>
                  <tbody>
                    {phaseMatches.map((match: any, idx: number) => (
                      <tr key={match.id}>
                        <td className="border px-2 py-1 text-xs">
                          {match.phase === 'final' ? 'FINAL' :
                            match.phase === 'third_place' ? '3º LUGAR' :
                            `Jogo ${idx + 1}`}
                        </td>
                        <td className="border px-2 py-1 text-xs">
                          {getTeamName(match.teamIds[0])} vs {getTeamName(match.teamIds[1])}
                        </td>
                        <td className="border px-2 py-1 text-xs font-bold">
                          {match.score1 != null && match.score2 != null ? `${match.score1} x ${match.score2}` : '-'}
                        </td>
                        <td className="border px-2 py-1 text-xs">
                          {match.winnerId ? getTeamName(match.winnerId) : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  if (matches.length === 0) {
    return (
      <Card className="bg-gray-800 border-gray-700 p-8 text-center">
        <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-white mb-2">Aguardando Jogos</h3>
        <p className="text-gray-400">
          Os jogos aparecerão aqui quando forem gerados na aba de participantes.
        </p>
      </Card>
    );
  }

  // Show final results when tournament is finished
  if (tournamentData.status === 'finished') {
    return (
      <div className="space-y-6">
        {renderFinalResults()}
        <Card className="bg-gray-800 border-gray-700 p-8 text-center">
          <Trophy className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-white mb-2">Torneio Finalizado</h2>
          <p className="text-gray-400 text-lg">
            Todos os jogos foram concluídos! Verifique a classificação final na aba "Classificação".
          </p>
        </Card>
      </div>
    );
  }

  // For doubles tournament, show only "Fase Atual" tab, e sempre mostrar as partidas da final + 3º lugar quando a fase estiver nessas
  if (tournamentData.format === 'doubles_groups') {
    const completedPhases = getCompletedPhases();
    const currentPhase = tournamentData.status;

    // Corrigido: Mostrar final + 3º lugar juntos quando em "final" ou em "third_place"
    let displayMatches: any[] = [];
    if (currentPhase === 'final' || currentPhase === 'third_place') {
      displayMatches = (tournamentData.matches || []).filter(
        m => m.phase === 'final' || m.phase === 'third_place'
      );
    } else {
      displayMatches = (tournamentData.matches || []).filter(
        m => m.phase === currentPhase
      );
    }

    return (
      <div className="space-y-6">
        <div className="flex flex-wrap gap-3 items-center justify-end mb-2">
          <Button 
            onClick={() => setShowBackupModal(true)}
            className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
            type="button"
          >
            <span>Imprimir lista de jogos / backup</span>
          </Button>
          {/* Removido o botão Histórico de Fases */}
        </div>
        {/* modais de backup e histórico */}
        {renderBackupModal()}
        {/* resto da aba jogos padrão */}
        <Tabs defaultValue="current" className="w-full">
          <TabsList className="grid w-full grid-cols-1 bg-gray-800 border-gray-700">
            <TabsTrigger value="current" className="data-[state=active]:bg-blue-600">
              Fase Atual
            </TabsTrigger>
          </TabsList>

          <TabsContent value="current" className="space-y-6">
            {/* Render groups display for current phase */}
            {renderGroupsDisplay()}

            <Card className="bg-gray-800 border-gray-700 p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <Trophy className="w-6 h-6" />
                  {/* Título ajustado para as finais */}
                  {(currentPhase === 'final' || currentPhase === 'third_place')
                    ? 'Final e Disputa de 3º Lugar'
                    : getPhaseTitle(currentPhase)
                  }
                </h2>
                <Badge className="bg-blue-600 text-white text-lg px-4 py-2">
                  {displayMatches.filter(m => m.winnerId).length} / {displayMatches.length} concluídos
                </Badge>
              </div>

              <div className="space-y-3">
                {displayMatches.map((match, index) => (
                  <Card key={match.id} className="bg-gray-700 border-gray-600 p-4">
                    <div className="flex items-center justify-between">
                      {/* Match Title */}
                      <div className="text-blue-400 font-bold text-lg min-w-[150px]">
                        {match.phase === 'final' ? 'FINAL' : match.phase === 'third_place' ? '3º LUGAR' : `Jogo ${index + 1}`}
                      </div>
                      
                      {/* Teams */}
                      <div className="flex-1 text-center">
                        <div className="text-white font-medium">
                          {getTeamName(match.teamIds[0])} <span className="text-gray-400 mx-2">vs</span> {getTeamName(match.teamIds[1])}
                        </div>
                      </div>

                      {/* Status and Result */}
                      <div className="flex items-center gap-4 min-w-[200px] justify-end">
                        {match.winnerId ? (
                          <>
                            <div className="text-lg font-bold text-white">
                              {match.score1} x {match.score2}
                            </div>
                            <Badge className="bg-green-600 text-white">
                              <Check className="w-3 h-3 mr-1" />
                              Finalizado
                            </Badge>
                          </>
                        ) : (
                          <>
                            <div className="flex items-center gap-2">
                              <Input
                                type="number"
                                min="0"
                                placeholder="0"
                                value={scores[match.id]?.score1 || ''}
                                onChange={(e) => handleScoreChange(match.id, 'score1', e.target.value)}
                                className="w-16 text-center bg-gray-600 border-gray-500 text-white"
                              />
                              <span className="text-gray-400">x</span>
                              <Input
                                type="number"
                                min="0"
                                placeholder="0"
                                value={scores[match.id]?.score2 || ''}
                                onChange={(e) => handleScoreChange(match.id, 'score2', e.target.value)}
                                className="w-16 text-center bg-gray-600 border-gray-500 text-white"
                              />
                            </div>
                            <Button
                              onClick={() => handleSaveScore(match.id)}
                              size="sm"
                              className="bg-blue-600 hover:bg-blue-700"
                            >
                              Salvar
                            </Button>
                            <Badge className="bg-gray-500 text-white">
                              Pendente
                            </Badge>
                          </>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    );
  }

  // For other tournament formats, keep existing behavior
  return (
    <div className="space-y-6">
      {/* Render groups display for doubles tournament in group stage */}
      {renderGroupsDisplay()}

      <Card className="bg-gray-800 border-gray-700 p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Trophy className="w-6 h-6" />
            {getPhaseTitle(tournamentData.status)}
          </h2>
          <Badge className="bg-blue-600 text-white text-lg px-4 py-2">
            {currentPhaseMatches.filter(m => m.winnerId).length} / {currentPhaseMatches.length} concluídos
          </Badge>
        </div>

        <div className="space-y-3">
          {currentPhaseMatches.map((match, index) => (
            <Card key={match.id} className="bg-gray-700 border-gray-600 p-4">
              <div className="flex items-center justify-between">
                {/* Match Title */}
                <div className="text-blue-400 font-bold text-lg min-w-[150px]">
                  {match.phase === 'final' ? 'FINAL' : match.phase === 'third_place' ? '3º LUGAR' : `Jogo ${index + 1}`}
                </div>
                
                {/* Teams */}
                <div className="flex-1 text-center">
                  <div className="text-white font-medium">
                    {getTeamName(match.teamIds[0])} <span className="text-gray-400 mx-2">vs</span> {getTeamName(match.teamIds[1])}
                  </div>
                </div>

                {/* Status and Result */}
                <div className="flex items-center gap-4 min-w-[200px] justify-end">
                  {match.winnerId ? (
                    <>
                      <div className="text-lg font-bold text-white">
                        {match.score1} x {match.score2}
                      </div>
                      <Badge className="bg-green-600 text-white">
                        <Check className="w-3 h-3 mr-1" />
                        Finalizado
                      </Badge>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          min="0"
                          placeholder="0"
                          value={scores[match.id]?.score1 || ''}
                          onChange={(e) => handleScoreChange(match.id, 'score1', e.target.value)}
                          className="w-16 text-center bg-gray-600 border-gray-500 text-white"
                        />
                        <span className="text-gray-400">x</span>
                        <Input
                          type="number"
                          min="0"
                          placeholder="0"
                          value={scores[match.id]?.score2 || ''}
                          onChange={(e) => handleScoreChange(match.id, 'score2', e.target.value)}
                          className="w-16 text-center bg-gray-600 border-gray-500 text-white"
                        />
                      </div>
                      <Button
                        onClick={() => handleSaveScore(match.id)}
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        Salvar
                      </Button>
                      <Badge className="bg-gray-500 text-white">
                        Pendente
                      </Badge>
                    </>
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

const checkDoublesPhaseCompletion = (matches: any[], tournamentData: any, onUpdate: any, toast: any) => {
  const currentPhaseMatches = matches.filter(match => match.phase === tournamentData.status);
  const completedMatches = currentPhaseMatches.filter(match => match.winnerId);
  
  // Check if current phase is completed
  if (completedMatches.length === currentPhaseMatches.length && currentPhaseMatches.length > 0) {
    if (tournamentData.status === 'group_stage') {
      // Advance to elimination phase
      const qualifiedTeams = getQualifiedTeams(tournamentData, 'group_stage');
      const nextPhase = getNextPhase('group_stage', qualifiedTeams.length);
      
      if (nextPhase !== 'finished') {
        const newMatches = generateMatches({ ...tournamentData, status: nextPhase, teams: qualifiedTeams });
        onUpdate({ 
          status: nextPhase,
          matches: [...matches, ...newMatches]
        });
        
        toast({
          title: "Fase concluída",
          description: `Avançando para ${getPhaseTitle(nextPhase)}`,
        });
      }
    } else if (['round_of_16', 'quarterfinals'].includes(tournamentData.status)) {
      // Advance to next elimination round
      const winners = matches
        .filter(match => match.phase === tournamentData.status && match.winnerId)
        .map(match => {
          const teams = tournamentData.teams || [];
          return teams.find(team => team.id === match.winnerId);
        })
        .filter(Boolean);
      
      const nextPhase = getNextPhase(tournamentData.status, winners.length);
      
      if (nextPhase !== 'finished') {
        const newMatches = generateMatches({ ...tournamentData, status: nextPhase, teams: winners });
        onUpdate({ 
          status: nextPhase,
          matches: [...matches, ...newMatches]
        });
        
        toast({
          title: "Fase concluída",
          description: `Avançando para ${getPhaseTitle(nextPhase)}`,
        });
      }
    } else if (tournamentData.status === 'semifinals') {
      // Create final and third place matches
      const winners = matches
        .filter(match => match.phase === 'semifinals' && match.winnerId)
        .map(match => {
          const teams = tournamentData.teams || [];
          return teams.find(team => team.id === match.winnerId);
        })
        .filter(Boolean);
      
      const losers = matches
        .filter(match => match.phase === 'semifinals' && match.winnerId)
        .map(match => {
          const teams = tournamentData.teams || [];
          const loserId = match.teamIds.find(id => id !== match.winnerId);
          return teams.find(team => team.id === loserId);
        })
        .filter(Boolean);
      
      const finalMatches = generateMatches({ ...tournamentData, status: 'final', teams: winners });
      const thirdPlaceMatches = generateMatches({ ...tournamentData, status: 'third_place', teams: losers });
      
      onUpdate({ 
        status: 'final',
        matches: [...matches, ...finalMatches, ...thirdPlaceMatches]
      });
      
      toast({
        title: "Semifinais concluídas",
        description: "Final e disputa de 3º lugar criadas!",
      });
    } else if (tournamentData.status === 'final') {
      // Check if both final and third place are completed
      const finalCompleted = matches.some(match => match.phase === 'final' && match.winnerId);
      const thirdPlaceCompleted = matches.some(match => match.phase === 'third_place' && match.winnerId);
      
      if (finalCompleted && thirdPlaceCompleted) {
        onUpdate({ status: 'finished' });
        toast({
          title: "Torneio finalizado",
          description: "Parabéns! O torneio foi concluído com sucesso.",
        });
      }
    }
  }
};

export default MatchManager;
