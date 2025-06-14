
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Trophy, Check, Clock } from 'lucide-react';
import { generateMatches, getQualifiedTeams } from '@/utils/tournamentLogic';

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

  const getPhaseTitle = (phase: string) => {
    const phaseNames = {
      'group_stage': 'Fase de Grupos',
      'phase1_groups': 'Fase 1 - Grupos',
      'phase2_playoffs': 'Fase 2 - Playoffs',  
      'phase3_final': 'Fase 3 - Final',
      'playoffs': 'Playoffs',
      'finished': 'Torneio Finalizado'
    };
    return phaseNames[phase] || 'Jogos do Torneio';
  };

  const isPhaseComplete = () => {
    return currentPhaseMatches.length > 0 && currentPhaseMatches.every(match => match.winnerId);
  };

  const handleNextPhase = () => {
    let nextStatus = '';
    let updates: any = {};
    
    switch (tournamentData.status) {
      case 'group_stage':
        if (tournamentData.format === 'doubles_groups') {
          const qualifiedTeams = getQualifiedTeams(tournamentData, 'group_stage');
          const playoffMatches = generateMatches({ 
            ...tournamentData, 
            teams: qualifiedTeams, 
            status: 'playoffs' 
          });
          updates = { 
            status: 'playoffs', 
            matches: [...tournamentData.matches, ...playoffMatches] 
          };
          nextStatus = 'playoffs';
        } else {
          nextStatus = 'finished';
          updates = { status: nextStatus };
        }
        break;
      case 'phase1_groups':
        const phase1Qualified = getQualifiedTeams(tournamentData, 'phase1_groups');
        const phase2Matches = generateMatches({
          ...tournamentData,
          teams: phase1Qualified,
          status: 'phase2_playoffs'
        });
        updates = {
          status: 'phase2_playoffs',
          matches: [...tournamentData.matches, ...phase2Matches]
        };
        nextStatus = 'phase2_playoffs';
        break;
      case 'phase2_playoffs':
        const phase2Qualified = getQualifiedTeams(tournamentData, 'phase2_playoffs');
        const phase3Matches = generateMatches({
          ...tournamentData,
          teams: phase2Qualified,
          status: 'phase3_final'
        });
        updates = {
          status: 'phase3_final',
          matches: [...tournamentData.matches, ...phase3Matches]
        };
        nextStatus = 'phase3_final';
        break;
      case 'phase3_final':
      case 'playoffs':
        nextStatus = 'finished';
        updates = { status: nextStatus };
        break;
    }

    if (nextStatus) {
      onUpdate(updates);
      toast({
        title: nextStatus === 'finished' ? "Torneio finalizado" : "Próxima fase iniciada",
        description: nextStatus === 'finished' ? "Parabéns! O torneio foi concluído." : "A próxima fase foi iniciada.",
      });
    }
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

  return (
    <div className="space-y-6">
      <Card className="bg-gray-800 border-gray-700 p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Trophy className="w-6 h-6" />
            {getPhaseTitle(tournamentData.status)}
          </h2>
          <Badge className="bg-blue-600 text-white text-lg px-4 py-2 border-2 border-blue-400">
            {currentPhaseMatches.filter(m => m.winnerId).length} / {currentPhaseMatches.length} concluídos
          </Badge>
        </div>

        <div className="space-y-4">
          {currentPhaseMatches.map((match, index) => (
            <div key={match.id} className="bg-gray-700 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-6 flex-1">
                  <div className="text-blue-400 font-bold text-xl min-w-[80px]">
                    Jogo {index + 1}
                  </div>
                  <div className="text-center flex-1">
                    <div className="text-white font-medium text-lg">
                      {getTeamName(match.teamIds[0])}
                    </div>
                  </div>
                  <div className="text-gray-400 text-lg font-bold">vs</div>
                  <div className="text-center flex-1">
                    <div className="text-white font-medium text-lg">
                      {getTeamName(match.teamIds[1])}
                    </div>
                  </div>
                  <div className="text-gray-400 text-lg font-bold min-w-[100px]">
                    Resultado:
                  </div>
                  <div className="min-w-[120px]">
                    {match.winnerId ? (
                      <div className="text-white font-bold text-xl">
                        {match.score1} x {match.score2}
                      </div>
                    ) : (
                      <div className="text-gray-400 text-xl">
                        ___ x ___
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="ml-4">
                  {match.winnerId ? (
                    <Badge className="bg-green-600 text-white">
                      <Check className="w-3 h-3 mr-1" />
                      Finalizado
                    </Badge>
                  ) : (
                    <Badge className="bg-yellow-600 text-white border-yellow-400">
                      <Clock className="w-3 h-3 mr-1" />
                      Pendente
                    </Badge>
                  )}
                </div>
              </div>

              {!match.winnerId && (
                <div className="flex items-center gap-4 mt-4 p-4 bg-gray-600 rounded">
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min="0"
                      placeholder="0"
                      value={scores[match.id]?.score1 || ''}
                      onChange={(e) => handleScoreChange(match.id, 'score1', e.target.value)}
                      className="w-16 text-center bg-gray-700 border-gray-500 text-white"
                    />
                    <span className="text-gray-400">-</span>
                    <Input
                      type="number"
                      min="0"
                      placeholder="0"
                      value={scores[match.id]?.score2 || ''}
                      onChange={(e) => handleScoreChange(match.id, 'score2', e.target.value)}
                      className="w-16 text-center bg-gray-700 border-gray-500 text-white"
                    />
                  </div>
                  <Button
                    onClick={() => handleSaveScore(match.id)}
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Salvar Resultado
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>

        {isPhaseComplete() && tournamentData.status !== 'finished' && (
          <div className="mt-6 text-center">
            <Button
              onClick={handleNextPhase}
              size="lg"
              className="bg-green-600 hover:bg-green-700 font-bold"
            >
              {tournamentData.status === 'phase3_final' || tournamentData.status === 'playoffs'
                ? 'Finalizar Torneio' 
                : 'Iniciar Próxima Fase'
              }
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
};

export default MatchManager;
