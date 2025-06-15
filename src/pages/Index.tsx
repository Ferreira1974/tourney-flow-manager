
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

  const handlePrintMatches = () => {
    // Open matches in new window for printing without scores
    const matchesWindow = window.open('', '_blank');
    if (matchesWindow) {
      const matches = tournamentData.matches || [];
      let matchesHTML = `
        <html>
          <head>
            <title>Lista de Jogos - ${tournamentData.name}</title>
            <style>
              body { 
                font-family: Arial, sans-serif; 
                margin: 20px; 
                line-height: 1.4;
                color: #333;
              }
              .header { 
                text-align: center; 
                margin-bottom: 30px; 
                border-bottom: 2px solid #333;
                padding-bottom: 20px;
              }
              .header h1 {
                font-size: 28px;
                margin: 0 0 10px 0;
                color: #2563eb;
              }
              .header h2 {
                font-size: 20px;
                margin: 0 0 15px 0;
                color: #666;
              }
              .header p {
                font-size: 14px;
                color: #888;
                margin: 0;
              }
              .match-list {
                max-width: 800px;
                margin: 0 auto;
              }
              .match { 
                display: flex;
                align-items: center;
                justify-content: space-between;
                margin: 8px 0; 
                padding: 12px 16px; 
                border: 1px solid #ddd; 
                border-radius: 6px;
                background-color: #f8f9fa;
                min-height: 50px;
              }
              .match:nth-child(even) {
                background-color: #ffffff;
              }
              .match-number {
                font-weight: bold;
                color: #2563eb;
                font-size: 16px;
                min-width: 80px;
              }
              .teams {
                flex: 1;
                text-align: center;
                font-size: 15px;
                font-weight: 500;
              }
              .vs {
                color: #666;
                font-weight: normal;
                margin: 0 8px;
              }
              .result-box {
                min-width: 120px;
                text-align: center;
                border: 1px solid #ccc;
                border-radius: 4px;
                padding: 8px 12px;
                background-color: white;
                font-size: 14px;
                color: #666;
              }
              @media print { 
                body { 
                  margin: 0; 
                  font-size: 12px;
                }
                .match { 
                  break-inside: avoid; 
                  margin: 4px 0;
                  padding: 8px 12px;
                }
                .header h1 { font-size: 24px; }
                .header h2 { font-size: 18px; }
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>${tournamentData.name}</h1>
              <h2>Lista de Jogos para Acompanhamento</h2>
              <p>Data de Geração: ${new Date().toLocaleDateString('pt-BR')}</p>
            </div>
            <div class="match-list">
      `;

      matches.forEach((match, index) => {
        const team1Name = getTeamDisplayName(match.teamIds[0]);
        const team2Name = getTeamDisplayName(match.teamIds[1]);
        matchesHTML += `
          <div class="match">
            <div class="match-number">Jogo ${index + 1}</div>
            <div class="teams">
              ${team1Name} <span class="vs">vs</span> ${team2Name}
            </div>
            <div class="result-box">
              _____ x _____
            </div>
          </div>
        `;
      });

      matchesHTML += `
            </div>
            <div style="margin-top: 30px; text-align: center; font-size: 14px; color: #666;">
              <strong>Total de jogos:</strong> ${matches.length}
            </div>
          </body>
        </html>
      `;
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

  const getStatusBadgeComponent = () => {
    const status = getStatusBadge(tournamentData.status);
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
              {getStatusBadgeComponent()}
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
              {/* Game Options Card */}
              {tournamentData.matches && tournamentData.matches.length > 0 && (
                <Card className="bg-gray-800 border-gray-700 p-6">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Opções de Jogos
                  </h3>
                  {/* Removido o botão azul grande aqui */}

                  {/* Centralizar os botões menores, se houver */}
                  <div className="flex justify-center gap-3">
                    {/* Exemplo: Botão pequeno de impressão */}
                    <Button
                      onClick={handlePrintMatches}
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
                    >
                      <Printer className="w-4 h-4" />
                      Imprimir Jogos
                    </Button>
                    {/* Adicione outros botões pequenos aqui, se necessário */}
                  </div>
                </Card>
              )}

              <MatchManager 
                tournamentData={tournamentData} 
                onUpdate={updateTournament}
              />
            </div>
          </TabsContent>

          <TabsContent value="leaderboard">
            <div className="space-y-6">
              <TournamentOverview tournamentData={tournamentData} />
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
    <Card className="bg-gray-800 border-gray-700 p-6 mb-6">
      <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <Trophy className="w-6 h-6 text-blue-400" />
        Visão Geral do Torneio
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gray-700 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">Formato</p>
              <p className="text-lg font-bold text-white">{getFormatName(tournamentData.format)}</p>
            </div>
            <Trophy className="w-6 h-6 text-blue-400" />
          </div>
        </div>

        <div className="bg-gray-700 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">Participantes</p>
              <p className="text-lg font-bold text-white">{getParticipantCount()}</p>
            </div>
            <Users className="w-6 h-6 text-green-400" />
          </div>
        </div>

        <div className="bg-gray-700 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">Jogos Concluídos</p>
              <p className="text-lg font-bold text-white">{stats.completed} / {stats.total}</p>
            </div>
            <Crown className="w-6 h-6 text-yellow-400" />
          </div>
        </div>

        <div className="bg-gray-700 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">Progresso</p>
              <p className="text-lg font-bold text-green-400">
                {stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}%
              </p>
            </div>
            <FileText className="w-6 h-6 text-purple-400" />
          </div>
        </div>
      </div>
    </Card>
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

