
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
import { Crown, Users, Trophy, FileText, Settings, RotateCcw } from 'lucide-react';

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

  if (!tournamentData || tournamentData.status === 'setup') {
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
    if (window.confirm('Tem certeza que deseja criar um novo torneio? Todos os dados atuais serão perdidos.')) {
      resetTournament();
      toast({
        title: "Torneio resetado",
        description: "Um novo torneio pode ser criado agora.",
      });
    }
  };

  const getStatusBadge = () => {
    const statusMap = {
      registration: { label: 'Inscrições', color: 'bg-yellow-500' },
      playing: { label: 'Em Andamento', color: 'bg-green-500' },
      finished: { label: 'Finalizado', color: 'bg-blue-500' },
      group_stage: { label: 'Fase de Grupos', color: 'bg-orange-500' },
      phase1_groups: { label: 'Fase 1 - Grupos', color: 'bg-orange-500' },
      phase2_playoffs: { label: 'Fase 2 - Playoffs', color: 'bg-purple-500' },
      phase3_final: { label: 'Fase 3 - Final', color: 'bg-red-500' },
    };
    
    const status = statusMap[tournamentData.status] || { label: 'Desconhecido', color: 'bg-gray-500' };
    return (
      <Badge className={`${status.color} text-white`}>
        {status.label}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto p-4 max-w-7xl">
        {/* Header */}
        <header className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
              {tournamentData.name}
            </h1>
            <div className="flex items-center gap-4 text-sm text-gray-400">
              <span>Formato: {getFormatName(tournamentData.format)}</span>
              {getStatusBadge()}
            </div>
          </div>
          <Button 
            onClick={handleReset}
            variant="outline"
            className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Novo Torneio
          </Button>
        </header>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 bg-gray-800 mb-6">
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
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Visão Geral</span>
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
            <MatchManager 
              tournamentData={tournamentData} 
              onUpdate={updateTournament}
            />
          </TabsContent>

          <TabsContent value="leaderboard">
            <Leaderboard tournamentData={tournamentData} />
          </TabsContent>

          <TabsContent value="overview">
            <TournamentOverview tournamentData={tournamentData} />
          </TabsContent>

          <TabsContent value="report">
            <TournamentReport tournamentData={tournamentData} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

const TournamentOverview = ({ tournamentData }) => {
  const getParticipantCount = () => {
    if (['doubles_groups', 'super16'].includes(tournamentData.format)) {
      return (tournamentData.teams || []).length;
    }
    return (tournamentData.players || []).length;
  };

  const getMatchStats = () => {
    const matches = tournamentData.matches || [];
    const completed = matches.filter(m => m.winnerId).length;
    return { total: matches.length, completed };
  };

  const stats = getMatchStats();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card className="bg-gray-800 border-gray-700 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-400">Formato</p>
            <p className="text-2xl font-bold text-white">{getFormatName(tournamentData.format)}</p>
          </div>
          <Trophy className="w-8 h-8 text-blue-400" />
        </div>
      </Card>

      <Card className="bg-gray-800 border-gray-700 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-400">Participantes</p>
            <p className="text-2xl font-bold text-white">{getParticipantCount()}</p>
          </div>
          <Users className="w-8 h-8 text-green-400" />
        </div>
      </Card>

      <Card className="bg-gray-800 border-gray-700 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-400">Jogos Concluídos</p>
            <p className="text-2xl font-bold text-white">{stats.completed} / {stats.total}</p>
          </div>
          <Crown className="w-8 h-8 text-yellow-400" />
        </div>
      </Card>

      <Card className="bg-gray-800 border-gray-700 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-400">Progresso</p>
            <p className="text-2xl font-bold text-white">
              {stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}%
            </p>
          </div>
          <FileText className="w-8 h-8 text-purple-400" />
        </div>
      </Card>
    </div>
  );
};

const getFormatName = (format) => {
  const formats = {
    super8: 'Super 8',
    doubles_groups: 'Torneio de Duplas',
    super16: 'Super 16',
    king_of_the_court: 'Rei da Quadra'
  };
  return formats[format] || format;
};

export default Index;
