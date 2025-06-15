
import React from "react";

interface TournamentMedalHighlightsProps {
  champion: string;
  vice: string;
  third: string;
}

const TournamentMedalHighlights = ({
  champion,
  vice,
  third,
}: TournamentMedalHighlightsProps) => (
  <div className="my-5 flex flex-col items-center">
    <div className="border-2 border-blue-700 rounded-xl bg-blue-50 p-3 w-full max-w-xl">
      <h3 className="text-[1.35rem] font-black text-indigo-700 text-center uppercase mb-2">
        Destaques Finais
      </h3>
      <div className="flex flex-col sm:flex-row justify-between gap-3">
        <div className="flex-1 text-center">
          <span className="block text-blue-800 font-semibold text-base mb-1">Campeão</span>
          <span className="block font-black text-base text-blue-900">{champion || "-"}</span>
        </div>
        <div className="flex-1 text-center">
          <span className="block text-blue-800 font-semibold text-base mb-1">Finalista</span>
          <span className="block font-black text-base text-blue-900">{vice || "-"}</span>
        </div>
        <div className="flex-1 text-center">
          <span className="block text-blue-800 font-semibold text-base mb-1">3º Lugar</span>
          <span className="block font-black text-base text-blue-900">{third || "-"}</span>
        </div>
      </div>
    </div>
  </div>
);

export default TournamentMedalHighlights;
