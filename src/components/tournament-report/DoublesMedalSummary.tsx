
import React from "react";
import { Trophy, Crown, Medal } from "lucide-react";

function getTeamName(teamId: any, tournamentData: any) {
  if (Array.isArray(teamId)) {
    const playerNames = teamId.map((playerId: string) => {
      const player = (tournamentData.players || []).find((p: any) => p.id === playerId);
      return player ? player.name : "Jogador";
    });
    return playerNames.join(" / ");
  }
  const team = (tournamentData.teams || []).find((t: any) => t.id === teamId);
  return team ? team.name : "Time";
}

interface DoublesMedalSummaryProps {
  tournamentData: any;
}

export default function DoublesMedalSummary({ tournamentData }: DoublesMedalSummaryProps) {
  const matches = tournamentData.matches || [];
  const finalMatch = matches.find((m: any) => m.phase === 'final' && m.winnerId);
  const thirdPlaceMatch = matches.find((m: any) => m.phase === 'third_place' && m.winnerId);

  if (!finalMatch || !thirdPlaceMatch) return null;

  const champion = (tournamentData.teams || []).find((t: any) => t.id === finalMatch.winnerId);
  const finalist = (tournamentData.teams || []).find((t: any) =>
    t.id === finalMatch.teamIds.find((id: any) => id !== finalMatch.winnerId)
  );
  const thirdPlace = (tournamentData.teams || []).find((t: any) => t.id === thirdPlaceMatch.winnerId);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-6">
      {/* Campeão */}
      <div className="bg-yellow-500 rounded-lg p-6 text-center">
        <Crown className="w-12 h-12 text-yellow-900 mx-auto mb-3" />
        <h3 className="text-xl font-bold text-yellow-900 mb-2">CAMPEÃO</h3>
        <p className="text-2xl font-bold text-yellow-900">{champion?.name || 'Dupla'}</p>
        <div className="mt-2 text-lg font-semibold text-yellow-800">
          {finalMatch.score1} x {finalMatch.score2}
        </div>
      </div>

      {/* Finalista */}
      <div className="bg-gray-300 rounded-lg p-6 text-center">
        <Medal className="w-12 h-12 text-gray-700 mx-auto mb-3" />
        <h3 className="text-xl font-bold text-gray-700 mb-2">FINALISTA</h3>
        <p className="text-2xl font-bold text-gray-700">{finalist?.name || 'Dupla'}</p>
        <div className="mt-2 text-lg font-semibold text-gray-600">Vice-Campeão</div>
      </div>

      {/* Terceiro Lugar */}
      <div className="bg-orange-400 rounded-lg p-6 text-center">
        <Trophy className="w-12 h-12 text-orange-800 mx-auto mb-3" />
        <h3 className="text-xl font-bold text-orange-800 mb-2">3º LUGAR</h3>
        <p className="text-2xl font-bold text-orange-800">{thirdPlace?.name || 'Dupla'}</p>
        <div className="mt-2 text-lg font-semibold text-orange-700">
          {thirdPlaceMatch.score1} x {thirdPlaceMatch.score2}
        </div>
      </div>
    </div>
  );
}
