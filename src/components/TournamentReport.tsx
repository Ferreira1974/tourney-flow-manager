import React from "react";
import { Button } from "@/components/ui/button";
import { Printer, Download } from "lucide-react";
import jsPDF from "jspdf";
import TournamentReportHeader from "./TournamentReportHeader";
import TournamentFinalStandings from "./TournamentFinalStandings";
import TournamentGamesByPhase from "./TournamentGamesByPhase";
import TournamentMedalHighlights from "./TournamentMedalHighlights";
import { Card } from "@/components/ui/card";

interface TournamentReportProps {
  tournamentData: any;
}

const TournamentReport = ({ tournamentData }: TournamentReportProps) => {
  if (!tournamentData || !tournamentData.name) {
    return (
      <div className="space-y-8">
        <Card className="bg-gray-800 border-gray-700 p-8">
          <div className="text-center">
            <Printer className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-2">Relatório não disponível</h3>
            <p className="text-gray-400">
              Nenhum dado de torneio encontrado para gerar o relatório.
            </p>
          </div>
        </Card>
      </div>
    );
  }

  // Enhanced team name function for Super 16 format
  const getTeamName = (teamId: any) => {
    console.log('TournamentReport - Processing teamId:', teamId, 'Tournament format:', tournamentData.format);
    
    if (tournamentData?.format === 'super16') {
      // For Super 16, teamId should be an array of player IDs
      if (Array.isArray(teamId)) {
        console.log('TournamentReport - teamId is array:', teamId);
        const playerNames = teamId.map(playerId => {
          const player = (tournamentData.players || []).find(p => p.id === playerId);
          console.log('TournamentReport - Found player:', player);
          return player ? player.name : 'Jogador';
        });
        const result = playerNames.join(' / ');
        console.log('TournamentReport - Final team name:', result);
        return result;
      }
      
      // If it's a string, might be a team ID - check teams first
      const team = (tournamentData.teams || []).find(t => t.id === teamId);
      if (team && Array.isArray(team.playerIds)) {
        console.log('TournamentReport - Found team with playerIds:', team);
        const playerNames = team.playerIds.map(playerId => {
          const player = (tournamentData.players || []).find(p => p.id === playerId);
          return player ? player.name : 'Jogador';
        });
        return playerNames.join(' / ');
      }
      
      // Last fallback - might be a single player ID
      const player = (tournamentData.players || []).find(p => p.id === teamId);
      if (player) {
        return player.name;
      }
      
      return 'Dupla';
    }
    
    // For other formats
    if (Array.isArray(teamId)) {
      const playerNames = teamId.map((playerId: any) => {
        const player = (tournamentData.players || []).find((p: any) => p.id === playerId);
        return player ? player.name : "Jogador";
      });
      return playerNames.join(" / ");
    }
    const team = (tournamentData.teams || []).find((t: any) => t.id === teamId);
    return team ? team.name : "Time";
  };

  const getFinalStandings = () => {
    const teams = tournamentData.teams?.length > 0 ? tournamentData.teams : tournamentData.players || [];
    const matches = tournamentData.matches || [];
    
    // Calculate stats from matches for each team
    const teamStats = teams.map(team => ({
      ...team,
      gamesPlayed: 0,
      wins: 0,
      pointsFor: 0,
      pointsAgainst: 0,
      name: getTeamName(team.id)
    }));

    // Calculate stats from completed matches
    matches.forEach(match => {
      if (match.score1 !== null && match.score2 !== null && match.winnerId) {
        match.teamIds.forEach((teamId, index) => {
          const team = teamStats.find(t => {
            if (tournamentData.format === 'super16') {
              // For super16, compare arrays or IDs properly
              if (Array.isArray(teamId) && Array.isArray(t.playerIds)) {
                return JSON.stringify(teamId.sort()) === JSON.stringify(t.playerIds.sort());
              }
              return t.id === teamId;
            }
            return t.id === teamId;
          });
          
          if (team) {
            team.gamesPlayed += 1;
            team.pointsFor += index === 0 ? match.score1 : match.score2;
            team.pointsAgainst += index === 0 ? match.score2 : match.score1;
            
            if (match.winnerId === teamId || 
                (Array.isArray(teamId) && Array.isArray(match.winnerId) && 
                 JSON.stringify(teamId.sort()) === JSON.stringify(match.winnerId.sort()))) {
              team.wins += 1;
            }
          }
        });
      }
    });

    const sorted = [...teamStats].sort((a: any, b: any) => {
      if ((b.wins || 0) !== (a.wins || 0)) return (b.wins || 0) - (a.wins || 0);
      const aDiff = (a.pointsFor || 0) - (a.pointsAgainst || 0);
      const bDiff = (b.pointsFor || 0) - (b.pointsAgainst || 0);
      return bDiff - aDiff;
    });
    
    return sorted.map((participant: any, index: number) => ({
      ...participant,
      position: index + 1,
      pointsDiff: (participant.pointsFor || 0) - (participant.pointsAgainst || 0),
      winRate:
        participant.gamesPlayed > 0
          ? ((participant.wins || 0) / participant.gamesPlayed * 100).toFixed(1)
          : "0.0",
    }));
  };

  const phasesOrder = [
    { key: "group_stage", label: "Fase de Grupos" },
    { key: "round_of_16", label: "Oitavas de Final" },
    { key: "quarterfinals", label: "Quartas de Final" },
    { key: "semifinals", label: "Semifinais" },
    { key: "final", label: "Final" },
    { key: "third_place", label: "Disputa 3º Lugar" },
  ];

  const gamesByPhase: Record<string, any[]> = {};
  (tournamentData.matches || []).forEach((match: any) => {
    if (!gamesByPhase[match.phase]) gamesByPhase[match.phase] = [];
    gamesByPhase[match.phase].push(match);
  });

  const getFinalMedalists = () => {
    const finalMatch = (tournamentData.matches || []).find(
      (m: any) => m.phase === "final" && m.winnerId
    );
    const thirdMatch = (tournamentData.matches || []).find(
      (m: any) => m.phase === "third_place" && m.winnerId
    );

    let champion = "";
    let vice = "";
    let third = "";

    if (finalMatch) {
      champion = getTeamName(finalMatch.winnerId);
      const teamLoser = finalMatch.teamIds.find((tid: any) => {
        if (Array.isArray(tid) && Array.isArray(finalMatch.winnerId)) {
          return JSON.stringify(tid.sort()) !== JSON.stringify(finalMatch.winnerId.sort());
        }
        return tid !== finalMatch.winnerId;
      });
      vice = getTeamName(teamLoser);
    }
    if (thirdMatch) {
      third = getTeamName(thirdMatch.winnerId);
    }

    // If no matches completed, get from standings
    if (!champion && !vice && !third) {
      const standings = getFinalStandings();
      if (standings.length >= 1) champion = standings[0].name || "-";
      if (standings.length >= 2) vice = standings[1].name || "-";
      if (standings.length >= 3) third = standings[2].name || "-";
    }

    return { champion, vice, third };
  };

  const { champion, vice, third } = getFinalMedalists();
  const finalStandings = getFinalStandings();

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "px",
      format: "a4",
    });

    let y = 30;
    doc.setFontSize(20);
    doc.text(`${tournamentData.name}`, 25, y);
    y += 22;
    doc.setFontSize(12);
    doc.text("Relatório Final do Torneio", 25, y);
    y += 10;

    // Tabela de classificação
    y += 18;
    doc.setFontSize(13);
    doc.text("Classificação Final", 25, y);
    y += 10;
    const tableStartY = y;
    const headers = [
      "Pos.",
      "Nome",
      "Jogos",
      "Vitórias",
      "Pró",
      "Contra",
      "Saldo",
      "Aproveit.",
    ];
    const colWidths = [25, 80, 30, 35, 30, 42, 36, 50];
    let colX = 25;
    headers.forEach((h, i) => {
      doc.text(h, colX, y);
      colX += colWidths[i];
    });
    y += 10;
    finalStandings.forEach((p: any, idx: number) => {
      colX = 25;
      const values = [
        `${p.position}º`,
        p.name,
        `${p.gamesPlayed || 0}`,
        `${p.wins || 0}`,
        `${p.pointsFor || 0}`,
        `${p.pointsAgainst || 0}`,
        `${p.pointsDiff >= 0 ? "+" : ""}${p.pointsDiff}`,
        `${p.winRate}%`,
      ];
      values.forEach((val, i) => {
        doc.text(String(val), colX, y);
        colX += colWidths[i];
      });
      y += 10;
    });

    // Fases disputadas
    phasesOrder.forEach((phase) => {
      const games = gamesByPhase[phase.key];
      if (games && games.length > 0) {
        y += 14;
        doc.setFontSize(13);
        doc.text(phase.label, 25, y);
        y += 10;
        doc.setFontSize(10);
        games.forEach((match: any, i: number) => {
          doc.text(
            `Jogo ${i + 1}: ${getTeamName(match.teamIds[0])} vs ${getTeamName(
              match.teamIds[1]
            )} - ` +
              (match.score1 != null && match.score2 != null
                ? `${match.score1} x ${match.score2}`
                : "Pendente"),
            32,
            y
          );
          y += 10;
        });
      }
    });

    // Destaques finais
    y += 16;
    doc.setFontSize(13);
    doc.text("Destaques", 25, y);
    y += 11;
    doc.setFontSize(11);
    doc.text(`Campeão: ${champion || "-"}`, 32, y);
    y += 10;
    doc.text(`Finalista: ${vice || "-"}`, 32, y);
    y += 10;
    doc.text(`3º Lugar: ${third || "-"}`, 32, y);

    doc.save(`relatorio-torneio.pdf`);
  };

  return (
    <div className="print:bg-white w-full max-w-4xl mx-auto px-1 sm:px-4 pt-2 print:p-0 text-[13px]">
      {/* Botões de ação */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-2 print:hidden mb-2">
        <div />
        <div className="flex gap-2">
          <Button
            onClick={handlePrint}
            className="bg-blue-700 hover:bg-blue-800 text-white min-w-[135px] text-[13px] font-semibold"
          >
            <Printer className="w-4 h-4" /> Imprimir
          </Button>
          <Button
            onClick={handleDownload}
            className="bg-green-600 hover:bg-green-700 text-white min-w-[135px] text-[13px] font-semibold"
          >
            <Download className="w-4 h-4" /> Download
          </Button>
        </div>
      </div>

      {/* Título do torneio, data, etc */}
      <TournamentReportHeader tournamentName={tournamentData.name} createdAt={tournamentData.createdAt} />

      {/* Tabela de classificação */}
      <TournamentFinalStandings finalStandings={finalStandings} />

      {/* Lista de jogos por fase */}
      <TournamentGamesByPhase
        phasesOrder={phasesOrder}
        gamesByPhase={gamesByPhase}
        getTeamName={getTeamName}
        tournamentData={tournamentData}
      />

      {/* Medalhistas finais */}
      <TournamentMedalHighlights champion={champion} vice={vice} third={third} />
    </div>
  );
};

export default TournamentReport;
