
import React from "react";
import { Trophy } from "lucide-react";

interface TournamentGamesByPhaseProps {
  phasesOrder: { key: string; label: string }[];
  gamesByPhase: Record<string, any[]>;
  getTeamName: (teamId: any) => string;
}

const TournamentGamesByPhase = ({
  phasesOrder,
  gamesByPhase,
  getTeamName,
}: TournamentGamesByPhaseProps) => (
  <div className="mt-5">
    {phasesOrder.map(
      (phase) =>
        gamesByPhase[phase.key] &&
        gamesByPhase[phase.key].length > 0 && (
          <div key={phase.key} className="mb-4">
            <div className="flex items-center gap-2 mb-1">
              <Trophy className="w-4 h-4 text-blue-600" />
              <span className="text-base font-bold text-blue-700">{phase.label}</span>
            </div>
            <div className="space-y-1 pl-2">
              {gamesByPhase[phase.key].map((match: any, i: number) => (
                <div
                  key={match.id}
                  className="flex flex-row items-center justify-between rounded border border-blue-100 px-2 py-1 bg-sky-50 text-[13px]"
                >
                  <span className="font-bold text-blue-700 min-w-[60px]">{`Jogo ${i + 1}`}</span>
                  <span className="flex-1 text-center text-blue-950 font-semibold">
                    {getTeamName(match.teamIds[0])}
                    <span className="mx-2 text-blue-500 font-normal">vs</span>
                    {getTeamName(match.teamIds[1])}
                  </span>
                  <span className="font-bold text-blue-800 px-2 min-w-[60px] text-center">
                    {match.score1 !== null && match.score2 !== null ? (
                      <span>
                        {match.score1} x {match.score2}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400">Pendente</span>
                    )}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )
    )}
  </div>
);

export default TournamentGamesByPhase;
