
import React from "react";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getStatusBadge } from "@/utils/phaseUtils";

interface TournamentHeaderProps {
  name: string;
  format: string;
  status: string;
  onReset: () => void;
}

const getFormatName = (format: string) => {
  const formats = {
    super8: "Super 8",
    doubles_groups: "Torneio de Duplas",
    super16: "Super 16",
    king_of_the_court: "Rei da Quadra",
  };
  return formats[format] || format;
};

const TournamentHeader: React.FC<TournamentHeaderProps> = ({
  name,
  format,
  status,
  onReset,
}) => {
  const badge = getStatusBadge(status);
  return (
    <header className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{name}</h1>
        <div className="flex items-center gap-4 text-sm text-gray-400">
          <span>Formato: {getFormatName(format)}</span>
          <Badge className={`${badge.color} text-white`}>{badge.label}</Badge>
        </div>
      </div>
      <Button
        onClick={onReset}
        variant="outline"
        className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
      >
        <RotateCcw className="w-4 h-4 mr-2" />
        Novo Torneio
      </Button>
    </header>
  );
};

export default TournamentHeader;
