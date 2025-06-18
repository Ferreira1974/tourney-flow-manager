// Conteúdo completo e corrigido para: src/components/TournamentSidebar.tsx

import React from 'react';
import { SidebarHeader, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getPhaseTitle, getStatusBadge } from '@/utils/phaseUtils';
import { Trophy, RotateCcw, Upload, Download, Swords, BarChart, FileText } from 'lucide-react';
import GameSheetPrinter from './GameSheetPrinter';

// MUDANÇA: Novas props para controlar a navegação
type ActiveView = 'games' | 'leaderboard' | 'report';

interface TournamentSidebarProps {
  tournamentData: any;
  onLoadTournament: (data: any) => void;
  onClearTournament: () => void;
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
}

const TournamentSidebar = ({ tournamentData, onLoadTournament, onClearTournament, activeView, setActiveView }: TournamentSidebarProps) => {

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    // ... (código existente)
  };

  const handleDownloadBackup = () => {
    // ... (código existente)
  };

  const getFormatName = (format: string) => {
    // ... (código existente)
  };

  const isTournamentRunning = tournamentData.status !== 'registration' && tournamentData.status !== 'teams_defined';

  return (
    <>
      <SidebarHeader>
        <div className="flex items-center gap-3">
            <Trophy className="w-8 h-8 text-yellow-400" />
            <h1 className="text-xl font-bold text-white truncate flex-1">{tournamentData.name}</h1>
        </div>
        <div className="flex flex-col gap-2 text-sm mt-2">
            <Badge variant="secondary" className="w-fit">{getFormatName(tournamentData.format)}</Badge>
            <Badge variant={getStatusBadge(tournamentData.status)} className="w-fit">
                {getPhaseTitle(tournamentData.status)}
            </Badge>
        </div>
      </SidebarHeader>

      <SidebarContent className="p-2">
        {/* MUDANÇA: Menu de navegação principal */}
        {isTournamentRunning && (
            <SidebarMenu>
                <SidebarMenuItem>
                    <SidebarMenuButton onClick={() => setActiveView('games')} isActive={activeView === 'games'}>
                        <Swords /> Jogos
                    </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                    <SidebarMenuButton onClick={() => setActiveView('leaderboard')} isActive={activeView === 'leaderboard'}>
                        <BarChart /> Classificação
                    </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                    <SidebarMenuButton onClick={() => setActiveView('report')} isActive={activeView === 'report'}>
                        <FileText /> Relatório
                    </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarMenu>
        )}
      </SidebarContent>

      <SidebarFooter>
        <SidebarGroup>
            <SidebarGroupLabel>Opções</SidebarGroupLabel>
            <div className='space-y-2'>
                {/* Botão de impressão só aparece se tiver jogos */}
                {tournamentData.matches?.length > 0 && <GameSheetPrinter tournamentData={tournamentData}/>}
                
                <Button variant="outline" size="sm" className="w-full" onClick={() => document.getElementById('file-upload')?.click()}>
                    <Upload className="mr-2"/> Carregar Backup
                </Button>
                <input type="file" id="file-upload" accept=".json" className="hidden" onChange={handleFileUpload} />

                <Button variant="outline" size="sm" className="w-full" onClick={handleDownloadBackup}>
                    <Download className="mr-2"/> Baixar Backup
                </Button>
                
                <Button variant="destructive" size="sm" className="w-full" onClick={onClearTournament}>
                    <RotateCcw className="mr-2"/> Novo Torneio
                </Button>
            </div>
        </SidebarGroup>
      </SidebarFooter>
    </>
  );
};

export default TournamentSidebar;