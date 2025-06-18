import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Play, Shuffle } from 'lucide-react';

interface TeamPreviewProps {
  tournamentData: any;
  onStartTournament: () => void;
  onRedrawTeams: () => void;
}

const TeamPreview = ({ tournamentData, onStartTournament, onRedrawTeams }: TeamPreviewProps) => {
  const { teams, players } = tournamentData;

  const getPlayerName = (playerId: string) => {
    const player = players.find((p: any) => p.id === playerId);
    return player ? player.name : 'Jogador não encontrado';
  };

  return (
    <Card className="bg-gray-800 border-gray-700 text-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <Users className="text-blue-400" />
          Duplas Sorteadas
        </CardTitle>
        <CardDescription>
          Confira as duplas formadas para o torneio. Se estiver tudo certo, inicie o torneio.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {teams.map((team: any, index: number) => (
            <Card key={team.id} className="bg-gray-700 border-gray-600">
              <CardHeader>
                <CardTitle className="text-base font-semibold text-gray-200">
                  Dupla {index + 1}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-gray-300 space-y-2">
                <p>{getPlayerName(team.playerIds[0])}</p>
                <p>{getPlayerName(team.playerIds[1])}</p>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="flex justify-center items-center gap-4">
          <Button variant="outline" onClick={onRedrawTeams}>
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