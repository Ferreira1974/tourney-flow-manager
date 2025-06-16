
import React from "react";
import { Card } from "@/components/ui/card";
import { Trophy, Users, Crown, FileText } from "lucide-react";

const getFormatName = (format: string) => {
  const formats = {
    super8: "Super 8",
    doubles_groups: "Torneio de Duplas",
    super16: "Super 16",
    king_of_the_court: "Rei da Quadra",
  };
  return formats[format] || format;
};

interface TournamentOverviewCardProps {
  tournamentData: any;
}

const TournamentOverviewCard: React.FC<TournamentOverviewCardProps> = ({
  tournamentData,
}) => {
  const getParticipantCount = () => {
    if (["doubles_groups"].includes(tournamentData.format)) {
      return (tournamentData.teams || []).length;
    }
    
    // Para Super 16: mostrar duplas após o sorteio
    if (tournamentData.format === "super16") {
      if (tournamentData.status === "registration") {
        return (tournamentData.players || []).length;
      } else {
        // Após o sorteio, mostrar número de duplas (jogadores / 2)
        return Math.floor((tournamentData.players || []).length / 2);
      }
    }
    
    return (tournamentData.players || []).length;
  };

  const getParticipantLabel = () => {
    if (["doubles_groups"].includes(tournamentData.format)) {
      return "Duplas";
    }
    
    // Para Super 16: mostrar "Duplas" após o sorteio
    if (tournamentData.format === "super16") {
      if (tournamentData.status === "registration") {
        return "Jogadores";
      } else {
        return "Duplas";
      }
    }
    
    return "Participantes";
  };

  const getParticipantTotal = () => {
    if (["doubles_groups"].includes(tournamentData.format)) {
      return (tournamentData.teams || []).length;
    }
    
    // Para Super 16: mostrar total de duplas após o sorteio
    if (tournamentData.format === "super16") {
      if (tournamentData.status === "registration") {
        return tournamentData.size || 16;
      } else {
        // Total de duplas possíveis
        return Math.floor((tournamentData.size || 16) / 2);
      }
    }
    
    return tournamentData.size || (tournamentData.players || []).length;
  };

  const getMatchStats = () => {
    const matches = tournamentData.matches || [];
    const completed = matches.filter((m: any) => m.winnerId).length;
    return { total: matches.length, completed };
  };

  const stats = getMatchStats();

  return (
    <Card className="bg-gray-800 border-gray-700 p-6 mb-6">
      <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <Trophy className="w-6 h-6 text-blue-400" />
        Visão Geral do Torneio
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gray-700 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">Formato</p>
              <p className="text-lg font-bold text-white">
                {getFormatName(tournamentData.format)}
              </p>
            </div>
            <Trophy className="w-6 h-6 text-blue-400" />
          </div>
        </div>

        <div className="bg-gray-700 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">{getParticipantLabel()}</p>
              <p className="text-lg font-bold text-white">
                {getParticipantCount()} / {getParticipantTotal()}
              </p>
            </div>
            <Users className="w-6 h-6 text-green-400" />
          </div>
        </div>

        <div className="bg-gray-700 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">Jogos Concluídos</p>
              <p className="text-lg font-bold text-white">
                {stats.completed} / {stats.total}
              </p>
            </div>
            <Crown className="w-6 h-6 text-yellow-400" />
          </div>
        </div>

        <div className="bg-gray-700 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">Progresso</p>
              <p className="text-lg font-bold text-green-400">
                {stats.total > 0
                  ? Math.round((stats.completed / stats.total) * 100)
                  : 0}
                %
              </p>
            </div>
            <FileText className="w-6 h-6 text-purple-400" />
          </div>
        </div>
      </div>
    </Card>
  );
};

export default TournamentOverviewCard;
