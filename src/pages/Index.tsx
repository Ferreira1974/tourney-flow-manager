import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import TournamentSetup from '@/components/TournamentSetup';
import ParticipantManager from '@/components/ParticipantManager';
import MatchManager from '@/components/MatchManager';
import Leaderboard from '@/components/Leaderboard';
import TournamentReport from '@/components/TournamentReport';
import { useTournamentData } from '@/hooks/useTournamentData';
import { Crown, Users, Trophy, FileText, RotateCcw, Printer } from 'lucide-react';
import { getStatusBadge } from '@/utils/phaseUtils';
import GameOptionsCard from "@/components/GameOptionsCard";
import TournamentHeader from "@/components/TournamentHeader";
import TournamentOverviewCard from "@/components/TournamentOverviewCard";

const Index = () => {
  const { tournamentData, updateTournament, resetTournament, isLoading } = useTournamentData();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('participants');

  useEffect(() => {
    document.title = tournamentData?.name || 'Gerenciador de Torneios';
  }, [tournamentData?.name]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-300 text-lg">Carregando torneio...</p>
        </div>
      </div>
    );
  }

  if (!tournamentData || tournamentData.status === "setup") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
        <div className="container mx-auto p-4 max-w-4xl">
          <div className="text-center mb-8 pt-20">
            <Trophy className="w-20 h-20 text-blue-400 mx-auto mb-4" />
            <h1 className="text-5xl font-bold text-white mb-4">
              Gerenciador de Torneios
            </h1>
            <p className="text-xl text-gray-300">
              Organize competições esportivas com facilidade
            </p>
          </div>
          <TournamentSetup onCreateTournament={updateTournament} />
        </div>
      </div>
    );
  }

  const handleReset = () => {
    if (
      window.confirm(
        "Tem certeza que deseja criar um novo torneio? Todos os dados atuais serão perdidos."
      )
    ) {
      resetTournament();
      toast({
        title: "Torneio resetado",
        description: "Um novo torneio pode ser criado agora.",
      });
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

  const getStatusBadgeComponent = () => {
    const status = getStatusBadge(tournamentData.status);
    return (
      <Badge className={`${status.color} text-white`}>
        {status.label}
      </Badge>
    );
  };

  const handlePrintMatches = () => {
    window.print();
  };

  const handlePrintMatchesBackup = () => {
    // Lógica placeholder (caso precise customizar)
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto p-4 max-w-7xl">
        {/* Header */}
        <TournamentHeader
          name={tournamentData.name}
          format={tournamentData.format}
          status={tournamentData.status}
          onReset={handleReset}
        />

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 bg-gray-800 mb-6">
            <TabsTrigger value="participants" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Participantes</span>
            </TabsTrigger>
            <TabsTrigger value="matches" className="flex items-center gap-2">
              <Trophy className="w-4 h-4" />
              <span className="hidden sm:inline">Jogos</span>
            </TabsTrigger>
            <TabsTrigger value="leaderboard" className="flex items-center gap-2">
              <Crown className="w-4 h-4" />
              <span className="hidden sm:inline">Classificação</span>
            </TabsTrigger>
            <TabsTrigger value="report" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">Relatório</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="participants">
            <ParticipantManager 
              tournamentData={tournamentData} 
              onUpdate={updateTournament}
            />
          </TabsContent>

          <TabsContent value="matches">
            <div className="space-y-6">
              {/* Mostrar GameOptionsCard SEMPRE, inclusive quando FINALIZADO */}
              <GameOptionsCard
                matches={tournamentData.matches}
                tournamentName={tournamentData.name}
                getTeamDisplayName={getTeamDisplayName}
                handlePrintMatches={handlePrintMatches}
                handlePrintMatchesBackup={handlePrintMatchesBackup}
              />
              {/* Manter restante da aba jogos */}
              <MatchManager 
                tournamentData={tournamentData} 
                onUpdate={updateTournament}
              />
            </div>
          </TabsContent>

          <TabsContent value="leaderboard">
            <div className="space-y-6">
              <TournamentOverviewCard tournamentData={tournamentData} />
              <Leaderboard tournamentData={tournamentData} />
            </div>
          </TabsContent>

          <TabsContent value="report">
            <TournamentReport tournamentData={tournamentData} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
