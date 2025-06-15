
import React from "react";

interface TournamentReportHeaderProps {
  tournamentName: string;
  createdAt?: string;
}

const TournamentReportHeader = ({
  tournamentName,
  createdAt,
}: TournamentReportHeaderProps) => (
  <div className="text-center mt-1 mb-3">
    <h1 className="font-extrabold text-2xl sm:text-3xl text-blue-800 print:text-blue-800 mb-1 uppercase tracking-tight">
      {tournamentName}
    </h1>
    <h2 className="text-[1.35rem] font-bold text-indigo-700 print:text-indigo-700 mb-1">
      Relatório Final do Torneio
    </h2>
    <p className="text-[1.1rem] font-semibold text-indigo-700 print:text-indigo-700 mt-0">
      Data:{" "}
      {createdAt
        ? new Date(createdAt).toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          })
        : ""}
    </p>
  </div>
);

export default TournamentReportHeader;
