import React, { useRef } from "react";

// Shadcn dialog para o modal
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";

// Tipos básicos esperados
interface GroupType {
  id: string;
  name: string;
  teamIds: string[];
}
interface MatchType {
  id: string;
  teamIds: any[];
}

interface GamePrintBackupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tournamentName: string;
  generationDate: string;
  groups: GroupType[];
  getTeamDisplayName: (teamId: any) => string;
  matches: MatchType[];
}

const GamePrintBackupDialog: React.FC<GamePrintBackupDialogProps> = ({
  open,
  onOpenChange,
  tournamentName,
  generationDate,
  groups,
  getTeamDisplayName,
  matches,
}) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="w-full max-w-4xl bg-white border border-blue-400 print:!block print:!static print:w-full print:!max-w-full print:border-none"
      >
        {/* Hide the close button on print using print:hidden */}
        <button
          type="button"
          aria-label="Close"
          onClick={() => onOpenChange(false)}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground print:hidden"
        >
          <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none"><path d="M3.5 3.5l9 9m-9 0l9-9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
          <span className="sr-only">Close</span>
        </button>
        <div className="p-0 print:p-0">
          {/* Cabeçalho do backup */}
          <div className="text-center border-b border-blue-500 pb-2 mb-6">
            <h1 className="text-3xl font-bold text-blue-700 mb-0">{tournamentName}</h1>
            <div className="font-semibold text-black text-lg">
              Backup de Jogos do Torneio
            </div>
            <div className="text-sm mt-1 text-black">
              Data de Geração: {generationDate}
            </div>
          </div>

          {/* Formação das chaves */}
          {groups && groups.length > 0 && (
            <div>
              <h2 className="text-xl font-bold text-blue-700 text-center mb-3">Formação das Chaves</h2>
              <div className="flex flex-col sm:flex-row gap-5 justify-center mb-8">
                {groups.map(group => (
                  <div
                    key={group.id}
                    className="bg-white border border-blue-300 rounded-lg p-4 min-w-[220px] flex-1"
                  >
                    <div className="text-lg font-bold text-blue-600 mb-1">{group.name}</div>
                    <ol className="list-decimal ml-5">
                      {group.teamIds.map((tid, idx) => (
                        <li key={tid} className="text-base text-black font-medium">
                          {getTeamDisplayName(tid)}
                        </li>
                      ))}
                    </ol>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Lista de Jogos */}
          <h2 className="text-xl font-bold text-blue-700 text-center mb-4">Lista de Jogos</h2>
          <div className="flex flex-col gap-4">
            {matches.map((match, idx) => (
              <div
                key={match.id}
                className="border border-blue-200 rounded-lg bg-white px-5 py-3 flex flex-col sm:flex-row justify-between items-center gap-2"
              >
                <div className="font-bold text-blue-600 text-lg min-w-[110px]">
                  Jogo {idx + 1}
                </div>
                <div className="flex-1 flex flex-col sm:flex-row gap-2 items-center justify-center">
                  <div className="font-semibold text-black text-base min-w-[120px] text-center">
                    {getTeamDisplayName(match.teamIds[0])}
                    <span className="font-normal text-gray-700 mx-2">vs</span>
                    {getTeamDisplayName(match.teamIds[1])}
                  </div>
                </div>
                <div className="flex flex-row gap-3 items-center min-w-[120px]">
                  <span className="border-b border-blue-300 px-6 py-1 inline-block text-transparent">____ x ____</span>
                </div>
              </div>
            ))}
          </div>

          {/* Botão Imprimir, só aparece fora do modo print */}
          <div className="mt-8 text-center print:hidden">
            <Button
              onClick={handlePrint}
              className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
            >
              <Printer className="w-5 h-5" />
              Imprimir lista de jogos
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GamePrintBackupDialog;
