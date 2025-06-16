import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Users, Plus, Trash2, Edit2, Crown, Shuffle, Play } from 'lucide-react';

interface ParticipantManagerProps {
  tournamentData: any;
  onUpdate: (updates: any) => void;
}

const ParticipantManager = ({ tournamentData, onUpdate }: ParticipantManagerProps) => {
  const [playerName, setPlayerName] = useState('');
  const [player1Name, setPlayer1Name] = useState('');
  const [player2Name, setPlayer2Name] = useState('');
  const [isHeadOfKey, setIsHeadOfKey] = useState(false);
  
  // Edit modal states
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingParticipant, setEditingParticipant] = useState(null);
  const [editName, setEditName] = useState('');
  const [editPlayer1, setEditPlayer1] = useState('');
  const [editPlayer2, setEditPlayer2] = useState('');
  const [editIsHeadOfKey, setEditIsHeadOfKey] = useState(false);
  
  const { toast } = useToast();

  const isDoublesFormat = tournamentData.format === 'doubles_groups';
  const isSuper16 = tournamentData.format === 'super16';
  const isKingOfCourt = tournamentData.format === 'king_of_the_court';
  const requiredCount = getRequiredParticipantCount();
  const currentParticipants = getCurrentParticipants();
  const isFull = currentParticipants.length >= requiredCount;

  // Para Super 16: verificar se já foi feito o sorteio (se existem teams)
  const isSuper16AfterDraw = isSuper16 && (tournamentData.teams || []).length > 0;

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

  const handleEditParticipant = (participant: any) => {
    setEditingParticipant(participant);
    if (participant.players) {
      // It's a team
      setEditPlayer1(participant.players[0] || '');
      setEditPlayer2(participant.players[1] || '');
    } else {
      // It's a player
      setEditName(participant.name);
      setEditIsHeadOfKey(participant.isHeadOfKey || false);
    }
    setEditModalOpen(true);
  };

  const handleSaveEdit = () => {
    if (!editingParticipant) return;

    const isTeam = editingParticipant.players;
    
    if (isTeam) {
      if (!editPlayer1.trim() || !editPlayer2.trim()) {
        toast({
          title: "Erro",
          description: "Preencha os nomes dos dois jogadores.",
          variant: "destructive",
        });
        return;
      }

      if (editPlayer1.trim().toLowerCase() === editPlayer2.trim().toLowerCase()) {
        toast({
          title: "Erro",
          description: "Os nomes dos jogadores devem ser diferentes.",
          variant: "destructive",
        });
        return;
      }

      // Check for duplicates excluding current team
      const otherTeams = (tournamentData.teams || []).filter(t => t.id !== editingParticipant.id);
      const allPlayersInOtherTeams = otherTeams.flatMap(t => 
        t.players.map(pl => pl.toLowerCase())
      );

      if (allPlayersInOtherTeams.includes(editPlayer1.trim().toLowerCase()) || 
          allPlayersInOtherTeams.includes(editPlayer2.trim().toLowerCase())) {
        toast({
          title: "Erro",
          description: "Um ou ambos os jogadores já estão em outra dupla.",
          variant: "destructive",
        });
        return;
      }

      const updatedTeams = (tournamentData.teams || []).map(t => 
        t.id === editingParticipant.id 
          ? { 
              ...t, 
              name: `${editPlayer1.trim()} / ${editPlayer2.trim()}`,
              players: [editPlayer1.trim(), editPlayer2.trim()]
            }
          : t
      );

      onUpdate({ teams: updatedTeams });
      
      toast({
        title: "Dupla atualizada",
        description: "Dupla foi atualizada com sucesso.",
      });
    } else {
      if (!editName.trim()) {
        toast({
          title: "Erro",
          description: "Nome do jogador não pode estar vazio.",
          variant: "destructive",
        });
        return;
      }

      // Check for duplicates excluding current player
      const otherPlayers = (tournamentData.players || []).filter(p => p.id !== editingParticipant.id);
      const isDuplicate = otherPlayers.some(
        p => p.name.toLowerCase() === editName.trim().toLowerCase()
      );

      if (isDuplicate) {
        toast({
          title: "Erro",
          description: `O jogador ${editName} já está cadastrado.`,
          variant: "destructive",
        });
        return;
      }

      const updatedPlayers = (tournamentData.players || []).map(p => 
        p.id === editingParticipant.id 
          ? { ...p, name: editName.trim(), isHeadOfKey: editIsHeadOfKey }
          : p
      );

      onUpdate({ players: updatedPlayers });
      
      toast({
        title: "Jogador atualizado",
        description: "Jogador foi atualizado com sucesso.",
      });
    }

    setEditModalOpen(false);
    setEditingParticipant(null);
    setEditName('');
    setEditPlayer1('');
    setEditPlayer2('');
    setEditIsHeadOfKey(false);
  };

  const handleDeleteParticipant = (id: string, type: 'player' | 'team') => {
    const key = type === 'team' ? 'teams' : 'players';
    const list = tournamentData[key] || [];
    const participant = list.find(p => p.id === id);
    
    if (window.confirm(`Tem certeza que deseja excluir ${type === 'team' ? 'a dupla' : 'o jogador'} ${participant?.name || 'este participante'}?`)) {
      onUpdate({ [key]: list.filter(p => p.id !== id) });
      
      toast({
        title: `${type === 'team' ? 'Dupla' : 'Jogador'} removido`,
        description: "Participante removido com sucesso.",
      });
    }
  };

  const canDrawDoubles = (isSuper16 || isKingOfCourt) && isFull && (tournamentData.teams || []).length === 0;
  const canGenerateMatches = isFull && ((isSuper16 || isKingOfCourt) ? (tournamentData.teams || []).length > 0 : true);

  return (
    <div className="space-y-6">
      {/* Registration Form - Hide after draw for Super 16 */}
      {tournamentData.status === 'registration' && !isSuper16AfterDraw && (
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

          {/* Action Buttons - Show draw button only before draw */}
          {isFull && !isSuper16AfterDraw && (
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
              
              {/* Show generate matches button only for non-Super16 formats */}
              {!isSuper16 && (
                <Button
                  onClick={handleGenerateMatches}
                  disabled={!canGenerateMatches}
                  className="w-full bg-orange-600 hover:bg-orange-700 font-bold disabled:opacity-50"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Gerar Jogos
                </Button>
              )}
            </div>
          )}
        </Card>
      )}

      {/* Generate Matches Button for Super 16 after draw */}
      {isSuper16AfterDraw && tournamentData.status === 'registration' && (
        <Card className="bg-gray-800 border-gray-700 p-6">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Play className="w-5 h-5" />
            Iniciar Torneio
          </h3>
          <p className="text-gray-300 mb-6">
            As duplas foram sorteadas com sucesso! Agora você pode gerar os jogos para iniciar o torneio.
          </p>
          <Button
            onClick={handleGenerateMatches}
            className="w-full bg-orange-600 hover:bg-orange-700 font-bold"
          >
            <Play className="w-4 h-4 mr-2" />
            Gerar Jogos
          </Button>
        </Card>
      )}

      {/* Participants List */}
      <Card className="bg-gray-800 border-gray-700 p-6">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <Users className="w-5 h-5" />
          {isSuper16AfterDraw ? 'Duplas Formadas' : 'Participantes Cadastrados'}
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

                {/* Hide edit/delete buttons for Super 16 after draw */}
                {!isSuper16AfterDraw && (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditParticipant(participant)}
                      className="text-blue-400 hover:text-blue-300 hover:bg-blue-900/20"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
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

      {/* Edit Modal - Hide for Super 16 after draw */}
      {!isSuper16AfterDraw && (
        <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
          <DialogContent className="bg-gray-800 border-gray-700 text-white">
            <DialogHeader>
              <DialogTitle className="text-white">
                Editar {editingParticipant?.players ? 'Dupla' : 'Jogador'}
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              {editingParticipant?.players ? (
                <>
                  <div>
                    <label className="text-sm text-gray-400 mb-1 block">Jogador 1</label>
                    <Input
                      value={editPlayer1}
                      onChange={(e) => setEditPlayer1(e.target.value)}
                      placeholder="Nome do Jogador 1"
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-400 mb-1 block">Jogador 2</label>
                    <Input
                      value={editPlayer2}
                      onChange={(e) => setEditPlayer2(e.target.value)}
                      placeholder="Nome do Jogador 2"
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="text-sm text-gray-400 mb-1 block">Nome do Jogador</label>
                    <Input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      placeholder="Nome do Jogador"
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                  </div>
                  {(isSuper16 || isKingOfCourt) && (
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="edit-head-of-key"
                        checked={editIsHeadOfKey}
                        onCheckedChange={(checked) => setEditIsHeadOfKey(checked === true)}
                        className="border-yellow-400 data-[state=checked]:bg-yellow-500"
                      />
                      <label htmlFor="edit-head-of-key" className="text-sm text-yellow-400 font-medium">
                        Cabeça de Chave
                      </label>
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <Button
                variant="outline"
                onClick={() => setEditModalOpen(false)}
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSaveEdit}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Salvar
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default ParticipantManager;
