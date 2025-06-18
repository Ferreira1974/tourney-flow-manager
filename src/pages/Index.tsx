import React, { useCallback, useMemo } from 'react';
import { useTournamentData } from '@/hooks/useTournamentData';
import TournamentSetup from '@/components/TournamentSetup';
import ParticipantManager from '@/components/ParticipantManager';
import MatchManager from '@/components/MatchManager';
import Leaderboard from '@/components/Leaderboard';
import TournamentReport from '@/components/TournamentReport';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { getPhaseTitle, getPhaseIcon } from '@/utils/phaseUtils';
import TournamentHeader from '@/components/TournamentHeader';
import { generateMatches } from '@/utils/tournamentLogic';
import TeamPreview from '@/components/TeamPreview'; // Importação do novo componente
import { Swords, BarChart, FileText, Settings } from 'lucide-react'; // Importação dos ícones das abas

const IndexPage = () => {
  const {
    tournamentData,
    updateTournament,
    createTournament,
    clearTournament,
    loadTournament,
    isLoading
  } = useTournamentData();

  const handleCreateTournament = (data: any) => {
    createTournament(data);
  };

  const handleStartTournament = useCallback(() => {
    if (!tournamentData) return;
    
    let phase = 'group_stage';
    if (tournamentData.format === 'super8') {
      phase = 'playing';
    } else if (tournamentData.format === 'king_of_the_court') {
      phase = 'phase1_groups';
    }

    const updatedTournamentData = { ...tournamentData, status: phase };
    const matches = generateMatches(updatedTournamentData);
    
    updateTournament({
      ...updatedTournamentData,
      matches: matches,
    });
  }, [tournamentData, updateTournament]);

  const handleRedrawTeams = useCallback(() => {
    if (!tournamentData) return;
    // Volta para a fase de registro e limpa as duplas
    updateTournament({
        teams: [],
        status: 'registration'
    });
  }, [tournamentData, updateTournament]);

  if (isLoading) {
    return <div>Carregando...</div>; // Ou um componente de Skeleton
  }

  if (!tournamentData) {
    return (
      <div className="container mx-auto p-4">
        <TournamentSetup onCreateTournament={handleCreateTournament} />
      </div>
    );
  }
  
  const renderContent = () => {
    // RENDERIZAÇÃO DA NOVA TELA DE PREVIEW
    if (tournamentData.status === 'teams_defined') {
      if (tournamentData.format === 'super16') {
        return (
          <TeamPreview
            tournamentData={tournamentData}
            onStartTournament={handleStartTournament}
            onRedrawTeams={handleRedrawTeams}
          />
        );
      }
    }
    
    if (tournamentData.status === 'registration') {
        return (
            <ParticipantManager
                tournamentData={tournamentData}
                updateTournament={updateTournament}
            />
        );
    }

    return (
      <Tabs defaultValue="games" className="w-full">
        {/* ÍCONES ADICIONADOS ÀS ABAS */}
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="games"><Swords className="w-4 h-4 mr-2" />Jogos</TabsTrigger>
          <TabsTrigger value="leaderboard"><BarChart className="w-4 h-4 mr-2" />Classificação</TabsTrigger>
          <TabsTrigger value="report"><FileText className="w-4 h-4 mr-2" />Relatório</TabsTrigger>
          <TabsTrigger value="settings"><Settings className="w-4 h-4 mr-2" />Configurações</TabsTrigger>
        </TabsList>
        <TabsContent value="games">
          <MatchManager 
            tournamentData={tournamentData}
            updateTournament={updateTournament}
          />
        </TabsContent>
        <TabsContent value="leaderboard">
          <Leaderboard tournamentData={tournamentData} />
        </TabsContent>
        <TabsContent value="report">
            <TournamentReport tournamentData={tournamentData}/>
        </TabsContent>
        <TabsContent value="settings">
          <p>Configurações Gerais</p>
        </TabsContent>
      </Tabs>
    );
  };

  return (
    <div className="container mx-auto p-4">
      <TournamentHeader
          tournamentData={tournamentData}
          onLoadTournament={loadTournament}
          onClearTournament={clearTournament}
        />
      <div className="mt-6">
        {renderContent()}
      </div>
    </div>
  );
};

export default IndexPage;