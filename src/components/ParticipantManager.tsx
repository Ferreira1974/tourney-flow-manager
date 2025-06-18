import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserPlus, Trash2, Edit, Shuffle, Check, ShieldCheck, Play } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { shuffleArray } from '@/utils/tournamentLogic';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';


interface ParticipantManagerProps {
  tournamentData: any;
  updateTournament: (data: any) => void;
  onStartTournament: () => void;
}

const ParticipantManager = ({ tournamentData, updateTournament, onStartTournament }: ParticipantManagerProps) => {
  const [newPlayerName, setNewPlayerName] = useState('');
  const [seededPlayerIds, setSeededPlayerIds] = useState<string[]>([]);
  const [editingPlayer, setEditingPlayer] = useState<any>(null);
  const [editedName, setEditedName] = useState('');
  const { toast } = useToast();

  const players = useMemo(() => tournamentData.players || [], [tournamentData.players]);
  const teams = useMemo(() => tournamentData.teams || [], [tournamentData.teams]);
  const isSuper16 = tournamentData.format === 'super16';
  const playerLimit = tournamentData.size;
  const isPlayerLimitReached = players.length >= playerLimit;

  const handleAddPlayer = () => {
    if (newPlayerName.trim() && !isPlayerLimitReached) {
      const newPlayer = {
        id: `p_${new Date().getTime()}`,
        name: newPlayerName.trim(),
      };
      updateTournament({
        ...tournamentData,
        players: [...players, newPlayer],
      });
      setNewPlayerName('');
    }
  };

  const handleRemovePlayer = (playerId: string) => {
    updateTournament({
      ...tournamentData,
      players: players.filter((p: any) => p.id !== playerId),
    });
    setSeededPlayerIds(prev => prev.filter(id => id !== playerId));
  };
  
  const handleEditPlayer = () => {
    if(!editingPlayer || !editedName.trim()) return;

    updateTournament({
        ...tournamentData,
        players: players.map((p: any) => p.id === editingPlayer.id ? { ...p, name: editedName.trim() } : p)
    });
    setEditingPlayer(null);
    setEditedName('');
  }

  const handleSeedToggle = (playerId: string) => {
    setSeededPlayerIds(prev =>
      prev.includes(playerId)
        ? prev.filter(id => id !== playerId)
        : [...prev, playerId]
    );
  };

  const handleDrawTeams = () => {
    if (!isSuper16 || !isPlayerLimitReached) return;

    const seeds = players.filter((p: any) => seededPlayerIds.includes(p.id));
    const nonSeeds = players.filter((p: any) => !seededPlayerIds.includes(p.id));

    if (seeds.length > players.length / 2) {
      toast({
        title: "Erro no Sorteio",
        description: `Não é possível ter mais que ${players.length / 2} cabeças de chave.`,
        variant: "destructive",
      });
      return;
    }
    
    const shuffledSeeds = shuffleArray(seeds);
    const shuffledNonSeeds = shuffleArray(nonSeeds);
    
    const newTeams: any[] = [];
    let teamIdCounter = 0;

    shuffledSeeds.forEach((seed: any) => {
        const partner = shuffledNonSeeds.pop();
        if (partner) {
            newTeams.push({
                id: `t_${teamIdCounter++}`,
                playerIds: [seed.id, partner.id],
                name: `${seed.name} / ${partner.name}`
            });
        }
    });

    while (shuffledNonSeeds.length > 0) {
        const player1 = shuffledNonSeeds.pop();
        const player2 = shuffledNonSeeds.pop();
        if (player1 && player2) {
            newTeams.push({
                id: `t_${teamIdCounter++}`,
                playerIds: [player1.id, player2.id],
                name: `${player1.name} / ${player2.name}`
            });
        }
    }

    updateTournament({
      ...tournamentData,
      teams: newTeams,
      status: 'teams_defined',
    });

    toast({
        title: "Duplas Sorteadas!",
        description: `${newTeams.length} duplas foram formadas com sucesso.`,
    });
  };

  // Lógica para determinar se o botão de iniciar deve estar habilitado
  const canStart = isSuper16 ? isPlayerLimitReached && teams.length > 0 : isPlayerLimitReached;

  return (
    <TooltipProvider>
        <Card className="bg-gray-800 border-gray-700 text-white">
        <CardHeader>
            <CardTitle className="flex items-center gap-2">
            <UserPlus />
            Cadastro de Participantes ({players.length} / {playerLimit || 'N/A'})
            </CardTitle>
        </CardHeader>
        <CardContent>
            {/* Formulário de Adição */}
            <div className="flex gap-2 mb-4">
            <Input
                value={newPlayerName}
                onChange={(e) => setNewPlayerName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddPlayer()}
                placeholder="Nome do participante"
                className="bg-gray-700 border-gray-600 text-white"
                disabled={isPlayerLimitReached}
            />
            <Button onClick={handleAddPlayer} disabled={isPlayerLimitReached || !newPlayerName.trim()}>
                <Check className="mr-2 h-4 w-4"/> Adicionar
            </Button>
            </div>
            {isPlayerLimitReached && (
                <p className="text-sm text-yellow-400 mb-4 text-center">
                    Limite de {playerLimit} participantes atingido.
                </p>
            )}

            {/* Lista de Jogadores */}
            <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
            {players.map((player: any, index: number) => (
                <div key={player.id} className="flex items-center justify-between bg-gray-700 p-3 rounded-md">
                <div className="flex items-center gap-3">
                    <span className="font-mono text-sm text-gray-400">{index + 1}.</span>
                    {isSuper16 && (
                        <div className="flex items-center">
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <div className="flex items-center">
                                        <Checkbox
                                            id={`seed-${player.id}`}
                                            checked={seededPlayerIds.includes(player.id)}
                                            onCheckedChange={() => handleSeedToggle(player.id)}
                                        />
                                        <Label htmlFor={`seed-${player.id}`} className="ml-2 flex items-center gap-1 cursor-pointer">
                                            <ShieldCheck className={`h-4 w-4 ${seededPlayerIds.includes(player.id) ? 'text-yellow-400' : 'text-gray-500'}`}/>
                                        </Label>
                                    </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Marcar como cabeça de chave</p>
                                </TooltipContent>
                            </Tooltip>
                        </div>
                    )}
                    <span className="font-medium">{player.name}</span>
                </div>
                <div className="flex items-center gap-2">
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button variant="ghost" size="icon" onClick={() => { setEditingPlayer(player); setEditedName(player.name); }}>
                                <Edit className="h-4 w-4 text-blue-400" />
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-gray-800 border-gray-700 text-white">
                            <DialogHeader>
                                <DialogTitle>Editar Participante</DialogTitle>
                            </DialogHeader>
                            <Input 
                                value={editedName}
                                onChange={e => setEditedName(e.target.value)}
                                className="bg-gray-700 border-gray-600 text-white"
                            />
                            <DialogFooter>
                                <DialogClose asChild>
                                    <Button type="button" onClick={handleEditPlayer}>Salvar Alterações</Button>
                                </DialogClose>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                    
                    <Button variant="ghost" size="icon" onClick={() => handleRemovePlayer(player.id)}>
                    <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                </div>
                </div>
            ))}
            </div>
            
            {/* Botões de Ação */}
            <div className="mt-6 text-center space-x-4">
                {isSuper16 && (
                    <Button onClick={handleDrawTeams} disabled={!isPlayerLimitReached || teams.length > 0} size="lg">
                        <Shuffle className="mr-2 h-5 w-5" />
                        Sortear Duplas
                    </Button>
                )}

                <Tooltip>
                    <TooltipTrigger asChild>
                        {/* O div é necessário para o tooltip funcionar em um botão desabilitado */}
                        <div> 
                            <Button onClick={onStartTournament} disabled={!canStart} size="lg" className="bg-green-600 hover:bg-green-700">
                                <Play className="mr-2 h-5 w-5" />
                                Iniciar Torneio
                            </Button>
                        </div>
                    </TooltipTrigger>
                    {!canStart && isSuper16 && (
                        <TooltipContent>
                            <p>Complete os jogadores e sorteie as duplas para iniciar.</p>
                        </TooltipContent>
                    )}
                </Tooltip>
            </div>
        </CardContent>
        </Card>
    </TooltipProvider>
  );
};

export default ParticipantManager;