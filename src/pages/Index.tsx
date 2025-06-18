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
  // CORREÇÃO: Alterado de desestruturação de objeto para array
  const [
    tournamentData,
    updateTournament,
    createTournament,
    clearTournament,
    loadTournament,
  ] = useTournamentData();

  const handleCreateTournament = (data: any) => {
    let initialStatus = 'registration';
    let teams = [];

    // Para o formato Super 8, os jogadores já são as "equipes"
    if (data.format === 'super8') {
      initialStatus = 'teams_defined';
    }
    // Para o formato de duplas pré-definidas (não Super 16)
    else if (data.format === 'doubles_groups') {
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
    
    let phase = 'group_stage'; // Padrão para formatos de grupo
    if (tournamentData.format === 'super8') {
      phase = 'playing';
    } else if (tournamentData.format === 'king_of_the_court') {
      phase = 'phase1_groups';
    }

    const matches = generateMatches({ ...tournamentData, status: phase });
    updateTournament({
      ...tournamentData,
      status: phase,
      matches: matches,
      groups: tournamentData.groups || [],
    });
  }, [tournamentData, updateTournament]);

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
    // Fase de Registro ou Definição de Duplas
    if (['registration', 'teams_defined'].includes(tournamentData.status)) {
        if(tournamentData.format === 'doubles_groups') {
            // Se for duplas, podemos ir direto pra tela de jogos para definir os jogadores por dupla
             return (
                <Tabs defaultValue="participants" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="participants">Participantes</TabsTrigger>
                    <TabsTrigger value="settings">Configurações</TabsTrigger>
                </TabsList>
                <TabsContent value="participants">
                    <ParticipantManager
                        tournamentData={tournamentData}
                        updateTournament={updateTournament}
                        onStartTournament={handleStartTournament}
                    />
                </TabsContent>
                <TabsContent value="settings">
                    <p>Configurações Gerais</p>
                </TabsContent>
                </Tabs>
             )
        }
        return (
            <ParticipantManager
                tournamentData={tournamentData}
                updateTournament={updateTournament}
                onStartTournament={handleStartTournament}
            />
        );
    }

    // Torneio em andamento
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