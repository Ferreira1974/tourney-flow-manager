
import React from "react";
import { Trophy } from "lucide-react";

interface MatchResultsProps {
  matches: any[];
  getTeamName: (id: any, tournamentData: any) => string;
  tournamentData: any;
}

export default function MatchResults({ matches, getTeamName, tournamentData }: MatchResultsProps) {
  if (!matches.length) return null;

  return (
    <div>
      <div className="flex items-center gap-3 mb-3">
        <Trophy className="w-5 h-5 text-blue-400 print:text-blue-600" />
        <h3 className="text-base print:text-lg font-bold text-white print:text-black">Resultados dos Jogos</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {matches.map((match, index) => {
          const team1Name = getTeamName(match.teamIds[0], tournamentData);
          const team2Name = getTeamName(match.teamIds[1], tournamentData);
          return (
            <div key={match.id} className="flex items-center justify-between bg-gray-700 print:bg-gray-50 p-2 rounded-lg border print:border-gray-200">
              <div className="text-sm font-semibold text-blue-400 print:text-blue-600 min-w-[50px]">
                Jogo {index + 1}
              </div>
              <div className="flex-1 text-center px-2">
                <div className="text-xs text-white print:text-black">
                  <span className="font-medium">{team1Name}</span>
                  <span className="text-gray-400 print:text-gray-600 mx-1">vs</span>
                  <span className="font-medium">{team2Name}</span>
                </div>
              </div>
              <div className="text-sm font-bold text-white print:text-black min-w-[50px] text-right">
                {match.score1} x {match.score2}
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-2 text-xs text-gray-400 print:text-gray-600">
        <strong>Total de jogos realizados:</strong> {matches.length}
      </div>
    </div>
  );
}
