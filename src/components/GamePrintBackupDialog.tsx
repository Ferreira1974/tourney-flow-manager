
import React from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";

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
        className="w-full max-w-5xl bg-white border border-blue-500 p-0 print:!block print:!static print:w-full print:!max-w-full print:border-none"
        style={{ fontFamily: "inherit" }}
      >
        {/* Close button (hidden on print) */}
        <button
          type="button"
          aria-label="Fechar"
          onClick={() => onOpenChange(false)}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 print:hidden"
        >
          <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none"><path d="M3.5 3.5l9 9m-9 0l9-9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
          <span className="sr-only">Fechar</span>
        </button>

        {/* Header */}
        <div className="w-full pb-2 pt-7 border-b border-blue-500 flex flex-col items-center">
          <h1 className="text-2xl font-bold text-blue-700 mb-0">{tournamentName}</h1>
          <div className="font-semibold text-black text-lg mt-1 mb-0">Backup de Jogos do Torneio</div>
          <div className="text-sm text-black mt-2 mb-1">
            Data de Geração: {generationDate}
          </div>
        </div>

        {/* Grupos */}
        {groups && groups.length > 0 && (
          <div className="pt-4 px-3 pb-2">
            <h2 className="text-xl font-bold text-blue-700 text-center mb-5">Formação das Chaves</h2>
            <div className="flex flex-col md:flex-row gap-6 justify-center items-stretch">
              {groups.map((group) => (
                <div
                  key={group.id}
                  className="border border-blue-300 rounded-xl bg-white px-6 py-4 min-w-[220px] flex-1 flex-shrink"
                  style={{maxWidth: 350}}
                >
                  <div className="text-lg font-bold text-blue-700 mb-3 text-center">{group.name}</div>
                  <ol className="list-decimal pl-4">
                    {group.teamIds.map((tid, idx) => (
                      <li
                        key={tid}
                        className="text-base text-black font-semibold mb-1 flex items-center"
                      >
                        <span className="font-bold text-lg mr-1">{idx + 1}.</span>
                        <span>
                          {getTeamDisplayName(tid)}
                        </span>
                      </li>
                    ))}
                  </ol>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Lista de jogos */}
        <div className="w-full mt-6 px-3 pb-7">
          <h2 className="text-2xl font-bold text-blue-700 text-center border-b border-blue-500 pb-2 mb-7">Lista de Jogos</h2>
          <div className="flex flex-col gap-5">
            {matches.map((match, idx) => (
              <div
                key={match.id}
                className="border border-blue-200 rounded-xl bg-white flex flex-col md:flex-row justify-between items-center py-5 px-0 md:px-5 shadow-none"
                style={{borderWidth: 2}}
              >
                <div className="text-lg font-bold text-blue-700 min-w-[120px] px-4 py-1 text-center">
                  Jogo {idx + 1}
                </div>
                <div className="flex-1 flex flex-col md:flex-row items-center justify-center gap-2 text-lg">
                  <span className="font-semibold text-black min-w-[120px] text-center">
                    {getTeamDisplayName(match.teamIds[0])}
                  </span>
                  <span className="font-medium text-gray-700 mx-2">vs</span>
                  <span className="font-semibold text-black min-w-[120px] text-center">
                    {getTeamDisplayName(match.teamIds[1])}
                  </span>
                </div>
                <div className="flex flex-row gap-3 items-center min-w-[150px] justify-end px-4 mt-2 md:mt-0">
                  <span className="text-lg border-b border-blue-300 px-7 text-[#bbb] tracking-wide">_____ x _____</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Print button (hidden on print) */}
        <div className="mt-8 text-center print:hidden pb-6">
          <Button
            onClick={handlePrint}
            className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
          >
            <Printer className="w-5 h-5" />
            Imprimir lista de jogos
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GamePrintBackupDialog;

