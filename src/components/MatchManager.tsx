// Conteúdo completo para: src/components/MatchManager.tsx

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getNextPhase, getQualifiedTeams, getParticipantDisplayName } from '@/utils/tournamentLogic'; // <-- MUDANÇA: Importa a função
import GameOptionsCard from './GameOptionsCard';

interface MatchManagerProps {
  tournamentData: any;
  updateTournament: (data: any) => void;
}

const MatchManager = ({ tournamentData, updateTournament }: MatchManagerProps) => {
  const [scores, setScores] = useState<any>({});

  const handleScoreChange = (matchId: string, team: 'score1' | 'score2', value: string) => {
    const numericValue = value.replace(/[^0-9]/g, '');
    setScores((prev: any) => ({
      ...prev,
      [matchId]: {
        ...prev[matchId],
        [team]: numericValue,
      },
    }));
  };
  
  // MUDANÇA: A função getTeamName foi removida daqui. Usaremos getParticipantDisplayName diretamente no JSX.

  const handleSaveScore = (matchId: string) => {
    const matchScores = scores[matchId];
    if (!matchScores || !matchScores.score1 || !matchScores.score2) return;

    const score1 = parseInt(matchScores.score1, 10);
    const score2 = parseInt(matchScores.score2, 10);
    const match = tournamentData.matches.find((m: any) => m.id === matchId);
    const winnerId = score1 > score2 ? match.teamIds[0] : match.teamIds[1];
    
    const updatedMatches = tournamentData.matches.map((m: any) =>
      m.id === matchId ? { ...m, score1, score2, winnerId } : m
    );
    updateTournament({ ...tournamentData, matches: updatedMatches });
  };
  
  const handleAdvancePhase = () => {
    const phase = tournamentData.format === 'super16' ? tournamentData.status : 'group_stage';
    const qualifiedTeams = getQualifiedTeams(tournamentData, phase);
    const nextPhaseName = getNextPhase(tournamentData.status, qualifiedTeams.length, tournamentData.format);

    const updatedData = {
        ...tournamentData,
        status: nextPhaseName,
        teams: qualifiedTeams 
    };
    
    const newMatches = getNextPhase(updatedData, qualifiedTeams);
    updateTournament({ ...updatedData, matches: [...tournamentData.matches, ...newMatches] });
  };

  const allMatchesInPhasePlayed = () => {
    const currentPhaseMatches = tournamentData.matches.filter((m: any) => m.phase === tournamentData.status);
    return currentPhaseMatches.every((m: any) => m.winnerId !== null);
  };

  return (
    <div className="space-y-6">
        <GameOptionsCard tournamentData={tournamentData}/>
        {tournamentData.matches.filter((m:any) => m.phase === tournamentData.status).map((match: any) => (
            <Card key={match.id} className="bg-gray-800 border-gray-700 text-white">
                <CardHeader>
                    <CardTitle className="text-lg">Jogo</CardTitle>
                </CardHeader>
                <CardContent className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        {/* MUDANÇA: Usa a nova função */}
                        <span>{getParticipantDisplayName(match.teamIds[0], tournamentData)}</span>
                        <Input
                            type="text"
                            value={scores[match.id]?.score1 || ''}
                            onChange={(e) => handleScoreChange(match.id, 'score1', e.target.value)}
                            className="w-16 bg-gray-700 border-gray-600 text-center"
                            disabled={!!match.winnerId}
                        />
                        <span>vs</span>
                        <Input
                            type="text"
                            value={scores[match.id]?.score2 || ''}
                            onChange={(e) => handleScoreChange(match.id, 'score2', e.target.value)}
                            className="w-16 bg-gray-700 border-gray-600 text-center"
                            disabled={!!match.winnerId}
                        />
                        {/* MUDANÇA: Usa a nova função */}
                        <span>{getParticipantDisplayName(match.teamIds[1], tournamentData)}</span>
                    </div>
                    <Button 
                        onClick={() => handleSaveScore(match.id)}
                        disabled={!scores[match.id]?.score1 || !scores[match.id]?.score2 || !!match.winnerId}
                    >
                        Salvar
                    </Button>
                </CardContent>
            </Card>
        ))}

        {allMatchesInPhasePlayed() && tournamentData.status !== 'final' && (
            <div className="text-center">
                <Button onClick={handleAdvancePhase} className="bg-blue-600 hover:bg-blue-700">
                    Avançar para a Próxima Fase
                </Button>
            </div>
        )}
    </div>
  );
};

export default MatchManager;