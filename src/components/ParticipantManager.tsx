
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Users, Plus, Trash2, Edit2, Crown, Shuffle, Play, Printer, List } from 'lucide-react';

interface ParticipantManagerProps {
  tournamentData: any;
  onUpdate: (updates: any) => void;
}

const ParticipantManager = ({ tournamentData, onUpdate }: ParticipantManagerProps) => {
  const [playerName, setPlayerName] = useState('');
  const [player1Name, setPlayer1Name] = useState('');
  const [player2Name, setPlayer2Name] = useState('');
  const [isHeadOfKey, setIsHeadOfKey] = useState(false);
  const { toast } = useToast();

  const isDoublesFormat = tournamentData.format === 'doubles_groups';
  const isSuper16 = tournamentData.format === 'super16';
  const isKingOfCourt = tournamentData.format === 'king_of_the_court';
  const requiredCount = getRequiredParticipantCount();
  const currentParticipants = getCurrentParticipants();
  const isFull = currentParticipants.length >= requiredCount;

  function getRequiredParticipantCount() {
    const fixedSizes = { super8: 8, super16: 16, king_of_the_court: 16 };
    return fixedSizes[tournamentData.format] || tournamentData.size || 0;
  }

  function getCurrentParticipants() {
    if (isDoublesFormat || ((isSuper16 || isKingOfCourt) && tournamentData.teams?.length > 0)) {
      return tournamentData.teams || [];
    }
    return tournamentData.players || [];
  }

  const handleAddPlayer = () => {
    if (!playerName.trim()) return;

    const isDuplicate = (tournamentData.players || []).some(
      p => p.name.toLowerCase() === playerName.trim().toLowerCase()
    );

    if (isDuplicate) {
      toast({
        title: "Erro",
        description: `O jogador ${playerName} já está cadastrado.`,
        variant: "destructive",
      });
      return;
    }

    const newPlayer = {
      id: `p_${Date.now()}`,
      name: playerName.trim(),
      isHeadOfKey: (isSuper16 || isKingOfCourt) ? isHeadOfKey : false,
      gamesPlayed: 0,
      wins: 0,
      pointsFor: 0,
      pointsAgainst: 0
    };

    onUpdate({
      players: [...(tournamentData.players || []), newPlayer]
    });

    setPlayerName('');
    setIsHeadOfKey(false);
    
    toast({
      title: "Jogador adicionado",
      description: `${newPlayer.name} foi adicionado ao torneio.`,
    });
  };

  const handleAddTeam = () => {
    if (!player1Name.trim() || !player2Name.trim()) {
      toast({
        title: "Erro",
        description: "Preencha os nomes dos dois jogadores.",
        variant: "destructive",
      });
      return;
    }

    if (player1Name.trim().toLowerCase() === player2Name.trim().toLowerCase()) {
      toast({
        title: "Erro",
        description: "Os nomes dos jogadores devem ser diferentes.",
        variant: "destructive",
      });
      return;
    }

    const allPlayersInTeams = (tournamentData.teams || []).flatMap(t => 
      t.players.map(pl => pl.toLowerCase())
    );

    if (allPlayersInTeams.includes(player1Name.trim().toLowerCase()) || 
        allPlayersInTeams.includes(player2Name.trim().toLowerCase())) {
      toast({
        title: "Erro",
        description: "Um ou ambos os jogadores já estão em outra dupla.",
        variant: "destructive",
      });
      return;
    }

    const newTeam = {
      id: `t_${Date.now()}`,
      name: `${player1Name.trim()} / ${player2Name.trim()}`,
      players: [player1Name.trim(), player2Name.trim()],
      gamesPlayed: 0,
      wins: 0,
      pointsFor: 0,
      pointsAgainst: 0
    };

    onUpdate({
      teams: [...(tournamentData.teams || []), newTeam]
    });

    setPlayer1Name('');
    setPlayer2Name('');
    
    toast({
      title: "Dupla adicionada",
      description: `${newTeam.name} foi adicionada ao torneio.`,
    });
  };

  const handleDrawDoubles = () => {
    const players = [...(tournamentData.players || [])];
    const heads = players.filter(p => p.isHeadOfKey);
    const others = players.filter(p => !p.isHeadOfKey);

    if (heads.length > players.length / 2) {
      toast({
        title: "Erro",
        description: `Não é possível ter mais de ${players.length / 2} cabeças de chave.`,
        variant: "destructive",
      });
      return;
    }

    // Shuffle arrays
    const shuffledOthers = [...others].sort(() => Math.random() - 0.5);
    const teams = [];
    let teamCounter = 1;

    // Pair heads with non-heads first
    while (heads.length > 0 && shuffledOthers.length > 0) {
      const head = heads.pop();
      const partner = shuffledOthers.pop();
      teams.push({
        id: `t_${Date.now()}_${teamCounter}`,
        name: `Dupla ${teamCounter}`,
        players: [head.name, partner.name],
        playerIds: [head.id, partner.id],
        gamesPlayed: 0,
        wins: 0,
        pointsFor: 0,
        pointsAgainst: 0
      });
      teamCounter++;
    }

    // Pair remaining players
    const remaining = [...heads, ...shuffledOthers];
    while (remaining.length >= 2) {
      const p1 = remaining.shift();
      const p2 = remaining.shift();
      teams.push({
        id: `t_${Date.now()}_${teamCounter}`,
        name: `Dupla ${teamCounter}`,
        players: [p1.name, p2.name],
        playerIds: [p1.id, p2.id],
        gamesPlayed: 0,
        wins: 0,
        pointsFor: 0,
        pointsAgainst: 0
      });
      teamCounter++;
    }

    onUpdate({ teams });
    
    toast({
      title: "Duplas sorteadas",
      description: `${teams.length} duplas foram formadas com sucesso.`,
    });
  };

  const handleGenerateMatches = () => {
    // This will be implemented in the MatchManager component
    // For now, just switch to matches tab and trigger generation
    onUpdate({ 
      status: tournamentData.format === 'super8' ? 'playing' : 
              tournamentData.format === 'king_of_the_court' ? 'phase1_groups' : 'group_stage',
      matchesGenerated: true 
    });
    
    toast({
      title: "Jogos gerados",
      description: "Os jogos foram gerados com sucesso!",
    });
  };

  const handlePrintMatches = () => {
    // Open matches in new window for printing
    const matchesWindow = window.open('', '_blank');
    if (matchesWindow) {
      const matches = tournamentData.matches || [];
      let matchesHTML = `
        <html>
          <head>
            <title>Lista de Jogos - ${tournamentData.name}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              .header { text-align: center; margin-bottom: 30px; }
              .match { margin: 10px 0; padding: 10px; border: 1px solid #ccc; }
              @media print { body { margin: 0; } }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>${tournamentData.name}</h1>
              <h2>Lista de Jogos</h2>
            </div>
      `;

      matches.forEach((match, index) => {
        const team1Name = getTeamDisplayName(match.teamIds[0]);
        const team2Name = getTeamDisplayName(match.teamIds[1]);
        matchesHTML += `
          <div class="match">
            <strong>Jogo ${index + 1}:</strong> ${team1Name} vs ${team2Name}
            ${match.score1 !== null ? `<br>Resultado: ${match.score1} x ${match.score2}` : ''}
          </div>
        `;
      });

      matchesHTML += '</body></html>';
      matchesWindow.document.write(matchesHTML);
      matchesWindow.document.close();
      matchesWindow.print();
    }
  };

  const getTeamDisplayName = (teamId: any) => {
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

  const handleDeleteParticipant = (id: string, type: 'player' | 'team') => {
    const key = type === 'team' ? 'teams' : 'players';
    const list = tournamentData[key] || [];
    onUpdate({ [key]: list.filter(p => p.id !== id) });
    
    toast({
      title: `${type === 'team' ? 'Dupla' : 'Jogador'} removido`,
      description: "Participante removido com sucesso.",
    });
  };

  const canDrawDoubles = (isSuper16 || isKingOfCourt) && isFull && (tournamentData.teams || []).length === 0;
  const canGenerateMatches = isFull && ((isSuper16 || isKingOfCourt) ? (tournamentData.teams || []).length > 0 : true);

  return (
    <div className="space-y-6">
      {/* Registration Form */}
      {tournamentData.status === 'registration' && (
        <Card className="bg-gray-800 border-gray-700 p-6">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Plus className="w-5 h-5" />
            {isDoublesFormat ? 'Cadastrar Dupla' : 'Cadastrar Jogador'}
          </h3>

          {isDoublesFormat ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  value={player1Name}
                  onChange={(e) => setPlayer1Name(e.target.value)}
                  placeholder="Nome do Jogador 1"
                  disabled={isFull}
                  className="bg-gray-700 border-gray-600 text-white"
                />
                <Input
                  value={player2Name}
                  onChange={(e) => setPlayer2Name(e.target.value)}
                  placeholder="Nome do Jogador 2"
                  disabled={isFull}
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-400">
                  Duplas: {currentParticipants.length} / {requiredCount}
                </div>
                <Button
                  onClick={handleAddTeam}
                  disabled={isFull}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Adicionar Dupla
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-3">
                <Input
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder="Nome do Jogador"
                  disabled={isFull}
                  className="bg-gray-700 border-gray-600 text-white"
                  onKeyPress={(e) => e.key === 'Enter' && handleAddPlayer()}
                />
                {(isSuper16 || isKingOfCourt) && (
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="head-of-key"
                      checked={isHeadOfKey}
                      onCheckedChange={(checked) => setIsHeadOfKey(checked === true)}
                      disabled={isFull}
                      className="border-yellow-400 data-[state=checked]:bg-yellow-500"
                    />
                    <label htmlFor="head-of-key" className="text-sm text-yellow-400 font-medium">
                      Cabeça de Chave
                    </label>
                  </div>
                )}
              </div>
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-400">
                  Jogadores: {currentParticipants.length} / {requiredCount}
                </div>
                <Button
                  onClick={handleAddPlayer}
                  disabled={isFull}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Adicionar Jogador
                </Button>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          {isFull && (
            <div className="mt-6 pt-6 border-t border-gray-700 space-y-3">
              <h4 className="text-lg font-semibold text-gray-300 text-center mb-4">
                Ações do Torneio
              </h4>
              
              {canDrawDoubles && (
                <Button
                  onClick={handleDrawDoubles}
                  className="w-full bg-purple-600 hover:bg-purple-700 font-bold"
                >
                  <Shuffle className="w-4 h-4 mr-2" />
                  Sortear Duplas
                </Button>
              )}
              
              <Button
                onClick={handleGenerateMatches}
                disabled={!canGenerateMatches}
                className="w-full bg-orange-600 hover:bg-orange-700 font-bold disabled:opacity-50"
              >
                <Play className="w-4 h-4 mr-2" />
                Gerar Jogos
              </Button>
            </div>
          )}
        </Card>
      )}

      {/* Print and View Matches Buttons for Super 8 */}
      {tournamentData.format === 'super8' && tournamentData.matches && tournamentData.matches.length > 0 && (
        <Card className="bg-gray-800 border-gray-700 p-4">
          <h4 className="text-lg font-semibold text-white mb-3">Opções de Jogos</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Button
              onClick={handlePrintMatches}
              className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
            >
              <Printer className="w-4 h-4" />
              Imprimir Lista de Jogos
            </Button>
            <Button
              onClick={() => window.open('#', '_self')} // Switch to matches tab
              className="bg-green-600 hover:bg-green-700 flex items-center gap-2"
            >
              <List className="w-4 h-4" />
              Consultar Jogos
            </Button>
          </div>
        </Card>
      )}

      {/* Participants List */}
      <Card className="bg-gray-800 border-gray-700 p-6">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <Users className="w-5 h-5" />
          Participantes Cadastrados
        </h3>

        {currentParticipants.length === 0 ? (
          <p className="text-gray-400 text-center py-8">
            Nenhum participante cadastrado ainda.
          </p>
        ) : (
          <div className="space-y-3">
            {currentParticipants.map((participant, index) => (
              <div
                key={participant.id}
                className="flex items-center justify-between bg-gray-700 p-4 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <span className="text-gray-400 font-bold w-8">
                    {index + 1}.
                  </span>
                  <div>
                    <span className="text-white font-medium">
                      {participant.name}
                    </span>
                    {participant.isHeadOfKey && (
                      <span className="inline-flex items-center ml-2" title="Cabeça de Chave">
                        <Crown className="w-4 h-4 text-yellow-400" />
                      </span>
                    )}
                    {participant.players && (
                      <div className="text-sm text-gray-400">
                        {participant.players.join(' / ')}
                      </div>
                    )}
                  </div>
                </div>

                {tournamentData.status === 'registration' && (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteParticipant(
                        participant.id, 
                        participant.players ? 'team' : 'player'
                      )}
                      className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="mt-4 text-sm text-gray-400 text-center">
          Total: {currentParticipants.length} / {requiredCount}
        </div>
      </Card>
    </div>
  );
};

export default ParticipantManager;
