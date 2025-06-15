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

  // NOVO: handler de impressão de jogos backup COM grupos/chaves no relatório
  const handlePrintMatchesBackup = () => {
    const matchesWindow = window.open('', '_blank');
    if (matchesWindow) {
      const matches = tournamentData.matches || [];
      const groups = tournamentData.groups || [];
      const teams = tournamentData.teams || [];

      // Bloco das chaves/grupos com duplas/times
      let groupsHTML = "";
      if (groups.length > 0) {
        groupsHTML += `
          <div class="groups-header" style="margin-bottom:18px;">
            <h2 style="text-align:center;font-size:18px;color:#2563eb;margin-bottom:10px;">
              Formação das Chaves
            </h2>
            <div class="groups-grid" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:14px;">
        `;
        groups.forEach(group => {
          groupsHTML += `
            <div class="group" style="background:#f1f5fa;border:1px solid #93c5fd;border-radius:8px;padding:11px;">
              <div style="font-weight:bold;color:#2563eb;margin-bottom:6px;">${group.name}</div>
              <ol style="padding-left:18px;">
                ${group.teamIds.map((tid: string, idx: number) => {
                  const team = teams.find((t: any) => t.id === tid);
                  return `<li style="margin-bottom:2px;color:#232f38;font-size:14px;">
                    <span style="font-weight:bold;">${idx + 1}.</span> ${team ? team.name : 'Dupla'}
                  </li>`
                }).join('')}
              </ol>
            </div>
          `;
        });
        groupsHTML += `
            </div>
          </div>
        `;
      }

      // Bloco dos jogos, layout aprimorado (o mesmo já existente)
      let matchesHTML = `
        <h2 style="text-align:center;font-size:18px;color:#2563eb;margin-bottom:6px;">
          Lista de Jogos
        </h2>
        <div class="matches-grid" style="display:grid;grid-template-columns:1fr 1fr;gap:16px;max-width:960px;margin:0 auto;">
      `;
      matches.forEach((match, idx) => {
        const team1Name = getTeamDisplayName(match.teamIds[0]);
        const team2Name = getTeamDisplayName(match.teamIds[1]);
        matchesHTML += `
          <div class="match-box" style="background:#f1f5fa;border:1.5px solid #93c5fd;border-radius:10px;min-height:56px;padding:10px 16px;display:flex;flex-direction:column;justify-content:center;box-shadow:0 2px 6px rgba(37,99,235,0.06);">
            <div class="match-header" style="font-weight:bold;color:#2563eb;font-size:14px;margin-bottom:5px;">Jogo ${idx + 1}</div>
            <div class="match-teams" style="font-weight:500;color:#222f;font-size:15px;margin-bottom:4px;word-break:break-word;">
              ${team1Name} <span style="margin:0 6px;color:#666;">vs</span> ${team2Name}
            </div>
            <div class="match-score" style="color:#444;font-size:13px;font-style:italic;letter-spacing:2px;margin-top:1px;">
              _____ x _____
            </div>
          </div>
        `;
      });
      matchesHTML += `
        </div>
        <div class="matches-summary" style="margin-top:30px;text-align:center;font-size:15px;color:#444;">
          <strong>Total de jogos:</strong> ${matches.length}
        </div>
      `;

      // HTML FINAL
      let html = `
        <html>
          <head>
            <title>Backup de Jogos - ${tournamentData.name}</title>
            <style>
              body { font-family: Arial,sans-serif; margin:24px 16px 18px 16px; color:#323232; background:#fafcff;}
              h1 { font-size:26px;font-weight:bold;color:#2563eb;text-align:center; margin:0 0 5px 0;}
              .header { text-align:center;margin-bottom:24px;border-bottom:2px solid #2563eb;padding-bottom:10px;}
              .header h2 { font-size:17px;color:#323232;margin:0 0 4px 0;}
              .header p { color:#888;font-size:13px;margin:0;}
              @media (max-width:700px) { .matches-grid { grid-template-columns:1fr !important;}}
              @media print {
                body { margin:0px;}
                h1 {font-size:22px;}
                .header {border-bottom:1px solid #2563eb; margin-bottom:16px;}
                .groups-header h2, .matches-header { font-size:16px; }
                .match-box { font-size:12px;padding:7px 9px;}
                .matches-grid { grid-gap:9px;}
                .matches-summary { font-size:12px;}
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>${tournamentData.name}</h1>
              <h2>Backup de Jogos do Torneio</h2>
              <p>Data de Geração: ${new Date().toLocaleDateString('pt-BR')}</p>
            </div>
            ${groupsHTML}
            ${matchesHTML}
          </body>
        </html>
      `;
      matchesWindow.document.write(html);
      matchesWindow.document.close();
      matchesWindow.print();
    }
  };

  // Mostrar apenas o botão "Imprimir Jogos Backup"
  const GameOptionsCardCustom = ({ matches, tournamentName, getTeamDisplayName, handlePrintMatchesBackup }: any) => {
    if (!matches || matches.length === 0) return null;
    return (
      <Card className="bg-gray-800 border-gray-700 p-6 mb-4">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Opções de Jogos
        </h3>
        <div className="flex justify-center gap-3 flex-wrap">
          <Button
            onClick={handlePrintMatchesBackup}
            size="sm"
            className="bg-emerald-700 hover:bg-emerald-800 flex items-center gap-2"
          >
            <Printer className="w-4 h-4" />
            Imprimir Jogos Backup
          </Button>
        </div>
      </Card>
    );
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
              {/* Só mostrar opções se NÃO FINALIZADO */}
              {tournamentData.status !== "finished" && (
                <GameOptionsCardCustom
                  matches={tournamentData.matches}
                  tournamentName={tournamentData.name}
                  getTeamDisplayName={getTeamDisplayName}
                  handlePrintMatchesBackup={handlePrintMatchesBackup}
                />
              )}
              {/* Mantém o restante da aba jogos */}
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
