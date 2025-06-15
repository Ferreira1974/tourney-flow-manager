
import React from "react";
import { Target } from "lucide-react";

interface TournamentStatisticsProps {
  stats: {
    totalParticipants: number;
    completedMatches: number;
    totalPoints: number;
    highestScore: number;
  }
}

export default function TournamentStatistics({ stats }: TournamentStatisticsProps) {
  return (
    <div>
      <div className="flex items-center gap-3 mb-3">
        <Target className="w-5 h-5 text-green-400 print:text-green-600" />
        <h3 className="text-base print:text-lg font-bold text-white print:text-black">Estatísticas do Torneio</h3>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="text-center">
          <div className="text-lg print:text-xl font-bold text-white print:text-black">{stats.totalParticipants}</div>
          <div className="text-xs text-gray-400 print:text-gray-700 mt-1">Participantes</div>
        </div>
        <div className="text-center">
          <div className="text-lg print:text-xl font-bold text-white print:text-black">{stats.completedMatches}</div>
          <div className="text-xs text-gray-400 print:text-gray-700 mt-1">Jogos Realizados</div>
        </div>
        <div className="text-center">
          <div className="text-lg print:text-xl font-bold text-white print:text-black">{stats.totalPoints}</div>
          <div className="text-xs text-gray-400 print:text-gray-700 mt-1">Total de Pontos</div>
        </div>
        <div className="text-center">
          <div className="text-lg print:text-xl font-bold text-white print:text-black">{stats.highestScore}</div>
          <div className="text-xs text-gray-400 print:text-gray-700 mt-1">Maior Pontuação</div>
        </div>
      </div>
    </div>
  );
}
