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

const IndexPage = () => {
  const {
    tournamentData,
    updateTournament,
    createTournament,
    clearTournament,
    loadTournament,
  } = useTournamentData();

  // LÓGICA RESTAURADA: Prepara o estado inicial do torneio corretamente
  const handleCreateTournament = (data: any) => {
    let initialStatus = 'registration';
    let teams = [];

    if (data.format === 'super8') {
      initialStatus = 'teams_defined';
    } else if (data.format === 'doubles_groups') {
        teams = Array.from({ length: data.size }, (_, i) => ({
            id: `t_${i}`,
            name: `Dupla ${i + 1}`,
            playerIds: [],
        }));
        initialStatus = 'teams_defined';
    }

    createTournament({ ...data, status: initialStatus, teams });
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

  // LÓGICA RESTAURADA: useMemo para o ícone da fase
  const CurrentPhaseIcon = useMemo(() => {
    if (tournamentData?.status) {
      return getPhaseIcon(tournamentData.status);
    }
    return null;
  }, [tournamentData?.status]);

  if (!tournamentData) {
    return (
      <div className="container mx-auto p-4">
        <TournamentSetup onCreateTournament={handleCreateTournament} />
      </div>
    );
  }
  
  const renderContent = () => {
    if (['registration', 'teams_defined'].includes(tournamentData.status)) {
        return (
            <ParticipantManager
                tournamentData={tournamentData}
                updateTournament={updateTournament}
                onStartTournament={handleStartTournament}
            />
        );
    }

    return (
      <Tabs defaultValue="games" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="games">Jogos</TabsTrigger>
          <TabsTrigger value="leaderboard">Classificação</TabsTrigger>
          <TabsTrigger value="report">Relatório</TabsTrigger>
          <TabsTrigger value="settings">Configurações</TabsTrigger>
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
      <Card className="bg-gray-800/50 border-gray-700 text-white mb-4">
        <CardContent className="p-4">
          <TournamentHeader
              tournamentData={tournamentData}
              onLoadTournament={loadTournament}
              onClearTournament={clearTournament}
            />
        </CardContent>
      </Card>
      {renderContent()}
    </div>
  );
};

export default IndexPage;