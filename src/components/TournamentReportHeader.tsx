// Conteúdo completo e corrigido para: src/components/TournamentReportHeader.tsx

import React from 'react';

interface TournamentReportHeaderProps {
  tournamentName: string;
  createdAt: string;
}

// CORREÇÃO: O componente agora recebe as props 'tournamentName' e 'createdAt' diretamente.
const TournamentReportHeader = ({ tournamentName, createdAt }: TournamentReportHeaderProps) => {
  const formattedDate = new Date(createdAt).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });

  return (
    <header className="mb-4 text-center border-b-2 border-blue-200 pb-3">
        <h1 className="text-2xl font-black text-blue-800 uppercase tracking-wide">{tournamentName}</h1>
        <p className="text-sm text-gray-500">Relatório gerado em: {formattedDate}</p>
    </header>
  );
};

export default TournamentReportHeader;