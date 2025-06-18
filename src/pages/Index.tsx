// Conteúdo completo e corrigido para: src/pages/Index.tsx

import React, { useState } from 'react';
import { useTournamentData } from '@/hooks/useTournamentData';
import TournamentSetup from '@/components/TournamentSetup';
import ParticipantManager from '@/components/ParticipantManager';
import MatchManager from '@/components/MatchManager';
import Leaderboard from '@/components/Leaderboard';
import TournamentReport from '@/components/TournamentReport';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import TournamentSidebar from '@/components/TournamentSidebar';
import TeamPreview from '@/components/TeamPreview';
import { generateMatches } from '@/utils/tournamentLogic';

// Tipo para controlar a visão ativa
type ActiveView = 'games' | 'leaderboard' | 'report';

const IndexPage = () => {
  const {
    tournamentData,
    updateTournament,
    createTournament,
    clearTournament,
    loadTournament,
    isLoading,
  } = useTournamentData();
  
  // MUDANÇA: Estado para controlar qual tela principal é exibida
  const [activeView, setActiveView] = useState<ActiveView>('games');

  const handleCreateTournament = (data: any) => {
    createTournament(data);
  };

  const handleStartTournament = React.useCallback(() => {
    if (!tournamentData) return;
    
    let phase = 'group_stage';
    if (tournamentData.format === 'super8') phase = 'playing';
    else if (tournamentData.format === 'king_of_the_court') phase = 'phase1_groups';

    const updatedTournamentData = { ...tournamentData, status: phase };
    const matches = generateMatches(updatedTournamentData);
    
    updateTournament({ ...updatedTournamentData, matches });
  }, [tournamentData, updateTournament]);

  const handleRedrawTeams = React.useCallback(() => {
    if (!tournamentData) return;
    updateTournament({ teams: [], status: 'registration' });
  }, [tournamentData, updateTournament]);

  if (isLoading) {
    return <div className="text-white text-center p-10">Carregando dados do torneio...</div>;
  }

  if (!tournamentData) {
    return (
      <div className="container mx-auto p-4 bg-gray-900 min-h-screen">
        <TournamentSetup onCreateTournament={handleCreateTournament} />
      </div>
    );
  }

  // MUDANÇA: O renderContent agora usa o estado 'activeView' em vez de Tabs
  const renderContent = () => {
    // Telas iniciais (cadastro, preview de duplas) continuam como antes
    if (tournamentData.status === 'registration') {
      return <ParticipantManager tournamentData={tournamentData} updateTournament={updateTournament} onStartTournament={handleStartTournament} />;
    }
    if (tournamentData.status === 'teams_defined' && tournamentData.format === 'super16') {
      return <TeamPreview tournamentData={tournamentData} onStartTournament={handleStartTournament} onRedrawTeams={handleRedrawTeams} />;
    }

    // Renderização condicional baseada no estado 'activeView'
    switch (activeView) {
      case 'games':
        return <MatchManager tournamentData={tournamentData} updateTournament={updateTournament} />;
      case 'leaderboard':
        return <Leaderboard tournamentData={tournamentData} />;
      case 'report':
        return <TournamentReport tournamentData={tournamentData} />;
      default:
        return <MatchManager tournamentData={tournamentData} updateTournament={updateTournament} />;
    }
  };

  return (
    <SidebarProvider>
      <Sidebar>
          <TournamentSidebar
              tournamentData={tournamentData}
              onLoadTournament={loadTournament}
              onClearTournament={clearTournament}
              activeView={activeView}
              setActiveView={setActiveView}
          />
      </Sidebar>
      <SidebarInset className="bg-gray-900">
          <main className="p-4 md:p-6 lg:p-8">
              {renderContent()}
          </main>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default IndexPage;