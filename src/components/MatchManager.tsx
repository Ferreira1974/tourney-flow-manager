import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Trophy, Check, Clock, Users, Crown, Medal } from 'lucide-react';
import { generateMatches, getQualifiedTeams, getNextPhase } from '@/utils/tournamentLogic';
import { getPhaseTitle } from '@/utils/phaseUtils';

interface MatchManagerProps {
  tournamentData: any;
  onUpdate: (updates: any) => void;
}

const MatchManager = ({ tournamentData, onUpdate }: MatchManagerProps) => {
  const { toast } = useToast();
  const [scores, setScores] = useState<{ [key: string]: { score1: string; score2: string } }>({});

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

  // Show both final and third place matches when status is 'final'
  const displayMatches = tournamentData.status === 'final' 
    ? matches.filter(match => match.phase === 'final' || match.phase === 'third_place')
    : currentPhaseMatches;

  return (
    <div className="space-y-6">
      {/* Render groups display for doubles tournament in group stage */}
      {renderGroupsDisplay()}

      <Card className="bg-gray-800 border-gray-700 p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Trophy className="w-6 h-6" />
            {tournamentData.status === 'final' ? 'Final e Disputa de 3º Lugar' : getPhaseTitle(tournamentData.status)}
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
