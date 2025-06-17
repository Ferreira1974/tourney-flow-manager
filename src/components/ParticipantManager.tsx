
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Users, UserPlus, Trash2, Play, Users2 } from 'lucide-react';
import DoublesGroupsFormation from './DoublesGroupsFormation';

interface ParticipantManagerProps {
  tournamentData: any;
  onUpdate: (data: any) => void;
}

const ParticipantManager = ({ tournamentData, onUpdate }: ParticipantManagerProps) => {
  const { toast } = useToast();
  const [newPlayerName, setNewPlayerName] = useState('');

  const addPlayer = () => {
    if (!newPlayerName.trim()) {
      toast({
        title: "Nome obrigatório",
        description: "Por favor, insira o nome do participante.",
        variant: "destructive",
      });
      return;
    }

    const newPlayer = {
      id: `player_${Date.now()}`,
      name: newPlayerName.trim(),
      gamesPlayed: 0,
      wins: 0,
      pointsFor: 0,
      pointsAgainst: 0,
    };

    const updatedData = {
      ...tournamentData,
      players: [...(tournamentData.players || []), newPlayer],
    };

    onUpdate(updatedData);
    setNewPlayerName('');
    
    toast({
      title: "Participante adicionado",
      description: `${newPlayerName} foi adicionado ao torneio.`,
    });
  };

  const removePlayer = (playerId: string) => {
    const player = tournamentData.players?.find((p: any) => p.id === playerId);
    
    if (window.confirm(`Tem certeza que deseja remover ${player?.name}?`)) {
      const updatedData = {
        ...tournamentData,
        players: tournamentData.players?.filter((p: any) => p.id !== playerId) || [],
      };
      onUpdate(updatedData);
      
      toast({
        title: "Participante removido",
        description: `${player?.name} foi removido do torneio.`,
      });
    }
  };

  const canStartTournament = () => {
    const playerCount = tournamentData.players?.length || 0;
    
    switch (tournamentData.format) {
      case 'super8':
        return playerCount === 8;
      case 'super16':
        return playerCount === 16;
      case 'doubles_groups':
        return playerCount >= 8 && playerCount % 2 === 0; // At least 8, even number
      case 'king_of_the_court':
        return playerCount === 16;
      default:
        return false;
    }
  };

  const getRequiredPlayers = () => {
    switch (tournamentData.format) {
      case 'super8':
        return 'Exatamente 8 jogadores';
      case 'super16':
        return 'Exatamente 16 jogadores';
      case 'doubles_groups':
        return 'Mínimo 8 jogadores (número par)';
      case 'king_of_the_court':
        return 'Exatamente 16 jogadores';
      default:
        return 'Número variável';
    }
  };

  const startTournament = () => {
    if (!canStartTournament()) {
      toast({
        title: "Não é possível iniciar",
        description: `Este formato requer: ${getRequiredPlayers()}`,
        variant: "destructive",
      });
      return;
    }

    const updatedData = {
      ...tournamentData,
      status: tournamentData.format === 'doubles_groups' ? 'group_stage' : 'playing',
    };

    onUpdate(updatedData);
    
    toast({
      title: "Torneio iniciado!",
      description: "Os jogos foram gerados. Vá para a aba Jogos para gerenciar as partidas.",
    });
  };

  const playerCount = tournamentData.players?.length || 0;

  return (
    <div className="space-y-6">
      <Card className="bg-gray-800 border-gray-700 p-6">
        <div className="flex items-center gap-2 mb-6">
          <Users className="w-6 h-6 text-blue-400" />
          <h2 className="text-2xl font-bold text-white">Gerenciar Participantes</h2>
          <Badge className="bg-blue-600 text-white">
            {getRequiredPlayers()}
          </Badge>
        </div>

        {/* Add Player Form */}
        <div className="flex gap-4 mb-6">
          <Input
            placeholder="Nome do participante"
            value={newPlayerName}
            onChange={(e) => setNewPlayerName(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addPlayer()}
            className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
          />
          <Button onClick={addPlayer} className="bg-blue-600 hover:bg-blue-700">
            <UserPlus className="w-4 h-4 mr-2" />
            Adicionar
          </Button>
        </div>

        {/* Players List */}
        <div className="space-y-3 mb-6">
          {tournamentData.players?.map((player: any, index: number) => (
            <div
              key={player.id}
              className="flex items-center justify-between bg-gray-700 p-4 rounded-lg"
            >
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                  {index + 1}
                </div>
                <span className="text-white font-medium">{player.name}</span>
              </div>
              
              <Button
                onClick={() => removePlayer(player.id)}
                variant="destructive"
                size="sm"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
          
          {playerCount === 0 && (
            <div className="text-center py-8 text-gray-400">
              <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>Nenhum participante adicionado ainda.</p>
              <p className="text-sm mt-2">Adicione participantes para começar o torneio.</p>
            </div>
          )}
        </div>

        {/* Start Tournament Button */}
        <div className="flex justify-center">
          <Button
            onClick={startTournament}
            disabled={!canStartTournament()}
            className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed px-8 py-3 text-lg"
          >
            <Play className="w-5 h-5 mr-2" />
            Iniciar Torneio
          </Button>
        </div>

        {!canStartTournament() && playerCount > 0 && (
          <p className="text-center text-gray-400 mt-4">
            {playerCount < 8 && tournamentData.format === 'doubles_groups' && 
              `Adicione mais ${8 - playerCount} participante(s) para atingir o mínimo.`}
            {playerCount < 8 && tournamentData.format === 'super8' && 
              `Adicione mais ${8 - playerCount} participante(s).`}
            {playerCount < 16 && tournamentData.format === 'super16' && 
              `Adicione mais ${16 - playerCount} participante(s).`}
            {playerCount < 16 && tournamentData.format === 'king_of_the_court' && 
              `Adicione mais ${16 - playerCount} participante(s).`}
            {tournamentData.format === 'doubles_groups' && playerCount >= 8 && playerCount % 2 !== 0 && 
              'Adicione mais 1 participante para ter um número par.'}
          </p>
        )}
      </Card>

      {/* Show teams formation for doubles formats */}
      {(['doubles_groups', 'super16'].includes(tournamentData.format)) && 
       tournamentData.teams && tournamentData.teams.length > 0 && (
        <Card className="bg-gray-800 border-gray-700 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Users2 className="w-6 h-6 text-green-400" />
            <h3 className="text-xl font-bold text-white">Duplas Formadas</h3>
          </div>
          <DoublesGroupsFormation tournamentData={tournamentData} />
        </Card>
      )}
    </div>
  );
};

export default ParticipantManager;
