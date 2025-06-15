
import React from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Printer, Download, X } from "lucide-react";

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

  const handleDownload = () => {
    // A solução mais simples e multiplataforma para download do "arquivo" é instruir o usuário a usar o print-to-pdf do navegador.
    // Opcionalmente você pode implementar uma exportação de PDF com jsPDF aqui.
    window.print();
  };

  const handleClose = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="w-full max-w-3xl bg-white border border-blue-500 p-0 print:!block print:!static print:w-full print:!max-w-full print:border-none text-sm"
        style={{ fontFamily: "inherit" }}
      >
        {/* DialogTitle para acessibilidade */}
        <DialogTitle className="text-blue-700 text-lg font-bold text-center pt-8 pb-2 border-b border-blue-500">
          {tournamentName}
        </DialogTitle>
        {/* Descrição e Data */}
        <div className="font-semibold text-black text-center text-base mt-1 mb-0">
          Backup de Jogos do Torneio
        </div>
        <div className="text-xs text-black text-center mb-1 mt-1">
          Data de Geração: {generationDate}
        </div>

        {/* Grupos */}
        {groups && groups.length > 0 && (
          <div className="pt-4 px-3 pb-2">
            <h2 className="text-base font-bold text-blue-700 text-center mb-4">Formação das Chaves</h2>
            <div className="flex flex-col md:flex-row gap-4 justify-center items-stretch">
              {groups.map((group) => (
                <div
                  key={group.id}
                  className="border border-blue-200 rounded-xl bg-white px-4 py-3 min-w-[160px] flex-1 flex-shrink"
                  style={{ maxWidth: 260 }}
                >
                  <div className="text-sm font-bold text-blue-700 mb-2 text-center">{group.name}</div>
                  <ol className="list-decimal pl-3">
                    {group.teamIds.map((tid, idx) => (
                      <li
                        key={tid}
                        className="text-xs text-black font-semibold mb-1 flex items-center"
                      >
                        <span className="font-bold mr-1">{idx + 1}.</span>
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
        <div className="w-full mt-5 px-3 pb-2">
          <h2 className="text-lg font-bold text-blue-700 text-center border-b border-blue-500 pb-2 mb-5">Lista de Jogos</h2>
          <div className="flex flex-col gap-3">
            {matches.map((match, idx) => (
              <div
                key={match.id}
                className="border border-blue-100 rounded-xl bg-white flex flex-col md:flex-row justify-between items-center py-3 px-0 md:px-5 shadow-none text-xs"
                style={{ borderWidth: 2 }}
              >
                <div className="font-bold text-blue-700 min-w-[84px] px-2 py-1 text-center text-xs">
                  Jogo {idx + 1}
                </div>
                <div className="flex-1 flex flex-col md:flex-row items-center justify-center gap-1 text-xs">
                  <span className="font-semibold text-black min-w-[92px] text-center">
                    {getTeamDisplayName(match.teamIds[0])}
                  </span>
                  <span className="font-medium text-gray-700 mx-2">vs</span>
                  <span className="font-semibold text-black min-w-[92px] text-center">
                    {getTeamDisplayName(match.teamIds[1])}
                  </span>
                </div>
                <div className="flex flex-row gap-2 items-center min-w-[120px] justify-end px-2 mt-2 md:mt-0">
                  <span className="text-xs border-b border-blue-200 px-5 text-[#bbb] tracking-wide">_____ x _____</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Botões de Ação - escondidos na impressão */}
        <div className="mt-7 flex flex-col sm:flex-row gap-3 items-center justify-center print:hidden pb-5">
          <Button
            onClick={handlePrint}
            className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2 min-w-[150px]"
          >
            <Printer className="w-4 h-4" />
            Imprimir lista de jogos
          </Button>
          <Button
            onClick={handleDownload}
            className="bg-green-600 hover:bg-green-700 flex items-center gap-2 min-w-[170px]"
          >
            <Download className="w-4 h-4" />
            Download do Arquivo
          </Button>
          <Button
            onClick={handleClose}
            variant="outline"
            className="flex items-center gap-2 min-w-[140px] border border-blue-500"
          >
            <X className="w-4 h-4" />
            Fechar Arquivo
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GamePrintBackupDialog;

