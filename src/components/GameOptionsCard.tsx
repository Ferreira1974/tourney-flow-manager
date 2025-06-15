import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Printer, FileText } from "lucide-react";
import GamePrintBackupDialog from "./GamePrintBackupDialog";

interface GameOptionsCardProps {
  matches: any[];
  tournamentName: string;
  getTeamDisplayName: (teamId: any) => string;
  handlePrintMatches: () => void;
  handlePrintMatchesBackup: () => void;
}

const GameOptionsCard: React.FC<GameOptionsCardProps> = ({
  matches,
  tournamentName,
  getTeamDisplayName,
  handlePrintMatches,
  handlePrintMatchesBackup,
}) => {
  const [openModal, setOpenModal] = useState(false);

  if (!matches || matches.length === 0) return null;

  // Descobrir as chaves se existirem
  // Checar se a lista da store tem groups ou teams divididos
  const tournamentData = (window as any).tournamentDataForBackup || {};
  // Fallback para evitar erro se não estiver lá (dev only)
  const groups =
    tournamentData.groups ||
    [];

  // Date format para o backup (DD/MM/YYYY)
  const now = new Date();
  const generationDate = new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(now);

  return (
    <>
      <Card className="bg-gray-800 border-gray-700 p-6">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Opções de Jogos
        </h3>
        <div className="flex flex-row justify-center gap-3 flex-wrap">
          <Button
            onClick={() => setOpenModal(true)}
            size="sm"
            className="bg-emerald-700 hover:bg-emerald-800 flex items-center gap-2"
          >
            <Printer className="w-4 h-4" />
            Imprimir lista de jogos
          </Button>
        </div>
      </Card>
      {/* Modal de impressão backup */}
      <GamePrintBackupDialog
        open={openModal}
        onOpenChange={setOpenModal}
        tournamentName={tournamentName}
        generationDate={generationDate}
        groups={groups}
        getTeamDisplayName={getTeamDisplayName}
        matches={matches}
      />
    </>
  );
};

export default GameOptionsCard;
