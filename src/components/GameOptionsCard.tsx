
import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Printer, FileText } from "lucide-react";

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
  if (!matches || matches.length === 0) return null;

  return (
    <Card className="bg-gray-800 border-gray-700 p-6">
      <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <FileText className="w-5 h-5" />
        Opções de Jogos
      </h3>
      {/* Botões de impressão centralizados */}
      <div className="flex justify-center gap-3 flex-wrap">
        <Button
          onClick={handlePrintMatches}
          size="sm"
          className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
        >
          <Printer className="w-4 h-4" />
          Imprimir Jogos
        </Button>
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

export default GameOptionsCard;
