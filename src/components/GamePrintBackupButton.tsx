
import React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Printer, FileText } from "lucide-react";

interface GamePrintBackupButtonProps {
  matches: any[];
  groups: any[];
  teams: any[];
  tournamentName: string;
  getTeamDisplayName: (teamId: any) => string;
  tournamentData?: any;
}

const GamePrintBackupButton: React.FC<GamePrintBackupButtonProps> = ({
  matches,
  groups,
  teams,
  tournamentName,
  getTeamDisplayName,
  tournamentData,
}) => {
  if (!matches || matches.length === 0) return null;

  // Enhanced team name function for Super 16 format
  const getEnhancedTeamName = (teamId: any) => {
    if (tournamentData?.format === 'super16') {
      // For Super 16, teamId should be an array of player IDs
      if (Array.isArray(teamId)) {
        const playerNames = teamId.map(playerId => {
          const player = (tournamentData.players || []).find(p => p.id === playerId);
          return player ? player.name : 'Jogador';
        });
        return playerNames.join(' / ');
      }
      // If it's not an array, try to find the team
      const team = (tournamentData.teams || []).find(t => t.id === teamId);
      if (team) {
        return team.name;
      }
      // Last fallback
      return 'Dupla';
    }
    
    // For other formats, use the provided getTeamDisplayName function
    return getTeamDisplayName(teamId);
  };

  const handlePrintMatchesBackup = () => {
    const matchesWindow = window.open('', '_blank');
    if (matchesWindow) {
      // Bloco das chaves/grupos com duplas/times
      let groupsHTML = "";
      if (groups && groups.length > 0) {
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
                  const teamName = getEnhancedTeamName(tid);
                  return `<li style="margin-bottom:2px;color:#232f38;font-size:14px;">
                    <span style="font-weight:bold;">${idx + 1}.</span> ${teamName}
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

      // Bloco dos jogos, lista sequencial "um por linha"
      let matchesHTML = `
        <h2 style="text-align:center;font-size:18px;color:#2563eb;margin-bottom:6px;">
          Lista de Jogos
        </h2>
        <div class="matches-list" style="max-width:700px;margin:0 auto;">
      `;
      matches.forEach((match, idx) => {
        const team1Name = getEnhancedTeamName(match.teamIds[0]);
        const team2Name = getEnhancedTeamName(match.teamIds[1]);
        matchesHTML += `
          <div class="match-row" style="background:#f1f5fa;border:1.5px solid #93c5fd;border-radius:8px;min-height:44px;padding:10px 20px;display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;">
            <div class="match-number" style="font-weight:bold;color:#2563eb;font-size:15px;">Jogo ${idx + 1}</div>
            <div class="match-teams" style="font-weight:500;color:#222f;font-size:15px;flex:1;text-align:center;">
              ${team1Name} <span style="margin:0 6px;color:#666;">vs</span> ${team2Name}
            </div>
            <div class="match-score" style="color:#444;font-size:13px;font-style:italic;letter-spacing:2px;min-width:92px;text-align:right;">
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
            <title>Backup de Jogos - ${tournamentName}</title>
            <style>
              body { font-family: Arial,sans-serif; margin:24px 16px 18px 16px; color:#323232; background:#fafcff;}
              h1 { font-size:26px;font-weight:bold;color:#2563eb;text-align:center; margin:0 0 5px 0;}
              .header { text-align:center;margin-bottom:24px;border-bottom:2px solid #2563eb;padding-bottom:10px;}
              .header h2 { font-size:17px;color:#323232;margin:0 0 4px 0;}
              .header p { color:#888;font-size:13px;margin:0;}
              .matches-list { max-width:700px; margin:0 auto; }
              .match-row { background:#f1f5fa;border:1.5px solid #93c5fd;border-radius:8px;min-height:44px;padding:10px 20px;display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;}
              .match-number { font-weight:bold;color:#2563eb;font-size:15px; }
              .match-teams { font-weight:500;color:#222f;font-size:15px;flex:1;text-align:center; }
              .match-score { color:#444;font-size:13px;font-style:italic;letter-spacing:2px;min-width:92px;text-align:right; }
              @media (max-width:700px) {
                .matches-list { max-width:98vw; }
                .match-row { padding:7px 4vw; flex-direction:column; align-items:flex-start; gap:3px;}
                .match-teams { text-align:left; }
                .match-score { text-align:left; min-width:unset;}
              }
              @media print {
                body { margin:0px;}
                h1 {font-size:22px;}
                .header {border-bottom:1px solid #2563eb; margin-bottom:16px;}
                .groups-header h2, .matches-header { font-size:16px; }
                .match-row { font-size:11.5px;padding:6px 7px;margin-bottom:5px; }
                .matches-list { max-width:100vw; }
                .matches-summary { font-size:12px;margin-top:20px;}
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>${tournamentName}</h1>
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

export default GamePrintBackupButton;
