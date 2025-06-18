// Conteúdo completo e corrigido para: src/components/TeamPreview.tsx

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Play, Shuffle, ShieldCheck } from 'lucide-react';
import { getParticipantDisplayName } from '@/utils/tournamentLogic';

interface TeamPreviewProps {
  tournamentData: any;
  onStartTournament: () => void;
  onRedrawTeams: () => void;
}

const TeamPreview = ({ tournamentData, onStartTournament, onRedrawTeams }: TeamPreviewProps) => {
  const { teams, players, seededPlayerIds = [] } = tournamentData;

  const getPlayerNameAndSeed = (playerId: string) => {
    const player = players.find((p: any) => p.id === playerId);
    if (!player) return { name: 'Jogador não encontrado', isSeeded: false };
    return {
      name: player.name,
      isSeeded: seededPlayerIds.includes(playerId),
    };
  };

  return (
    <Card className="bg-gray-800 border-gray-700 text-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-3 text-2xl">
          <Users className="text-blue-400" />
          Duplas Sorteadas
        </CardTitle>
        <CardDescription>
          Confira as duplas formadas. Se estiver tudo certo, inicie o torneio.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {teams.map((team: any, index: number) => {
            const player1 = getPlayerNameAndSeed(team.playerIds[0]);
            const player2 = getPlayerNameAndSeed(team.playerIds[1]);

            return (
              <Card key={team.id} className="bg-gray-700 border-gray-600">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-gray-200">
                    Dupla {index + 1}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-gray-300 space-y-2">
                  <div className="flex items-center gap-2">
                    {player1.isSeeded && <ShieldCheck className="h-5 w-5 text-yellow-400" />}
                    <p>{player1.name}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {player2.isSeeded && <ShieldCheck className="h-5 w-5 text-yellow-400" />}
                    <p>{player2.name}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
        <div className="flex justify-center items-center gap-4">
          {/* CORREÇÃO AQUI: Mudamos a variante do botão para "secondary" para que ele tenha contraste */}
          <Button variant="secondary" onClick={onRedrawTeams}>
            <Shuffle className="mr-2 h-4 w-4" />
            Refazer Sorteio
          </Button>
          <Button onClick={onStartTournament} className="bg-green-600 hover:bg-green-700">
            <Play className="mr-2 h-4 w-4" />
            Iniciar Torneio
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default TeamPreview;