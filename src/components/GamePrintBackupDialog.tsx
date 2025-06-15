
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
  // Chama impressão apenas do dialog
  const handlePrint = () => {
    // Cria um iframe invisível, imprime só o conteúdo do modal
    const printContent = document.getElementById("printable-games-list");
    if (printContent) {
      const printWindow = window.open("", "_blank", "width=900,height=700");
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Imprimir lista de jogos</title>
              <style>
                @media print {
                  body { margin: 0; font-family: 'Inter', Arial, sans-serif; color: #111; }
                  .print-container { width: 100vw; max-width: 800px; margin: 0 auto; font-size: 12px; background: #fff; }
                  .blue-border { border: 1px solid #3899e3 !important; }
                  .game-row { border: 1.5px solid #b7d6f7 !important; border-radius: 12px; margin-bottom: 16px; }
                  .jogo-title { color: #2a7bd6; font-weight: 600; }
                  .versus { color: #686868; }
                }
                .print-container { padding: 24px 0 24px 0; width: 98%; max-width: 830px; margin: 0 auto;}
                .section-title { color: #2a7bd6; font-weight: 900; text-align: center; letter-spacing: 0.01em; font-size: 1rem;}
                .group-box { background: #f6faff; border: 1px solid #b7d6f7; border-radius: 12px; padding: 8px 16px; margin: 0 6px 10px 6px;}
                .group-box-name { color: #2a7bd6; font-size: 0.95em; font-weight: bold;}
                .game-row { display: flex; align-items: center; justify-content: space-between; padding: 10px 14px; border: 1.5px solid #b7d6f7; border-radius: 12px; background: #fff; margin-bottom: 10px; font-size: 0.93em;}
                .jogo-title { min-width: 64px; color: #2196f3; font-weight: 700; text-align: left; }
                .team-names { font-weight: bold; color: #222; text-align: center;}
                .versus { color: #777; margin: 0 7px;}
                .score-dash { border-bottom: 1px solid #b7d6f7; color: #b7b7b7; font-weight: 700; min-width: 70px; text-align: center;}
                .game-list-wrap { margin: 0 0 0 0; }
                @media print {
                  .no-print { display: none !important; }
                  .print-container { box-shadow: none !important; }
                  html, body { background: #fff !important; }
                }
              </style>
            </head>
            <body>
              <div class="print-container">
                ${printContent.innerHTML}
              </div>
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
        printWindow.close();
      }
    }
  };

  const handleDownload = () => {
    handlePrint();
  };

  const handleClose = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="w-full max-w-3xl bg-white border border-sky-400 p-0 print:!block print:!static print:w-full print:!max-w-full print:border-none text-[13px] md:text-sm leading-tight"
        style={{ fontFamily: "inherit" }}
        id="game-print-dialog"
        aria-describedby="print-desc"
      >
        {/* Modal print content wrapper */}
        <div id="printable-games-list" className="w-full">
          {/* Cabeçalho */}
          <DialogTitle className="text-sky-700 text-[1.13rem] font-bold text-center pt-6 pb-1 border-b border-sky-400">
            {tournamentName}
          </DialogTitle>
          <div className="font-semibold text-black text-center text-base mb-0 mt-2 section-title">
            Backup de Jogos do Torneio
          </div>
          <div id="print-desc" className="text-xs text-black text-center mb-1 mt-1">
            Data de Geração: {generationDate}
          </div>

          {/* Grupos */}
          {groups && groups.length > 0 && (
            <div className="pt-3 px-3 pb-2 flex flex-row flex-wrap justify-center gap-4">
              {groups.map((group) => (
                <div
                  key={group.id}
                  className="group-box"
                  style={{ minWidth: 130, maxWidth: 220 }}
                >
                  <div className="group-box-name mb-1 text-center">{group.name}</div>
                  <ol className="list-decimal pl-3 m-0">
                    {group.teamIds.map((tid, idx) => (
                      <li
                        key={tid}
                        className="text-[11px] text-black font-semibold mb-1 flex items-center"
                      >
                        <span className="font-bold mr-1">{idx + 1}.</span>
                        <span>{getTeamDisplayName(tid)}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              ))}
            </div>
          )}

          {/* Lista de jogos */}
          <div className="w-full mt-3 px-1 pb-2 game-list-wrap">
            <div className="text-[1.06rem] font-bold section-title border-b border-sky-300 pb-2 mb-4">
              Lista de Jogos
            </div>
            <div>
              {matches.map((match, idx) => (
                <div
                  key={match.id}
                  className="game-row"
                >
                  <div className="jogo-title">
                    Jogo {idx + 1}
                  </div>
                  <div className="flex flex-row items-center gap-1 flex-1 justify-center">
                    <span className="team-names">{getTeamDisplayName(match.teamIds[0])}</span>
                    <span className="versus">vs</span>
                    <span className="team-names">{getTeamDisplayName(match.teamIds[1])}</span>
                  </div>
                  <span className="score-dash ml-1">
                    _____&nbsp;&nbsp;x&nbsp;&nbsp;_____
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
        {/* Botões de Ação - escondidos na impressão */}
        <div className="mt-6 flex flex-col sm:flex-row gap-3 items-center justify-center no-print pb-5">
          <Button
            onClick={handlePrint}
            className="bg-sky-700 hover:bg-sky-800 text-white flex items-center gap-2 min-w-[165px] text-[13px] font-semibold"
          >
            <Printer className="w-4 h-4" />
            Imprimir lista de jogos
          </Button>
          <Button
            onClick={handleDownload}
            className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2 min-w-[165px] text-[13px] font-semibold"
          >
            <Download className="w-4 h-4" />
            Download do Arquivo
          </Button>
          <Button
            onClick={handleClose}
            variant="outline"
            className="flex items-center gap-2 min-w-[120px] border border-sky-500 text-[13px]"
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
