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
                  body { margin: 0; font-family: 'Inter', Arial, sans-serif; color: #1e40af; background: #fff; }
                  .print-container { box-shadow: none !important; background: #fff; }
                  .no-print { display: none !important; }
                  html, body { background: #fff !important; }
                }
                body {
                  font-family: 'Inter', Arial, sans-serif;
                  background: #fff;
                  color: #1e40af;
                  margin: 0;
                }
                .print-container {
                  width: 98vw;
                  max-width: 1100px;
                  margin: 0 auto;
                  background: #fff;
                  padding: 8px 0 32px 0;
                }
                .report-title {
                  font-size: 2.1rem;
                  font-weight: 800;
                  text-align: center;
                  color: #2563eb;
                  letter-spacing: 0.05em;
                  margin: 12px 0 0 0;
                }
                .backup-title {
                  font-size: 1.23rem;
                  font-weight: 600;
                  text-align: center;
                  color: #222;
                  margin: 6px 0 0 0;
                }
                .generation-date {
                  text-align: center;
                  color: #222;
                  font-size: 1rem;
                  margin: 0 0 6px 0;
                }
                .section-divisor {
                  border-bottom: 2px solid #2563eb;
                  margin: 13px 0 18px 0;
                }
                .groups-section-title {
                  font-size: 1.34rem;
                  font-weight: 700;
                  color: #2563eb;
                  text-align: center;
                  margin-bottom: 15px;
                }
                .groups-flex {
                  display: flex;
                  flex-wrap: wrap;
                  gap: 20px;
                  justify-content: center;
                  margin-bottom: 25px;
                }
                .group-box-new {
                  min-width: 220px;
                  max-width: 290px;
                  background: #fff;
                  border: 2px solid #60a5fa;
                  border-radius: 12px;
                  padding: 12px 18px 12px 18px;
                  margin: 0 9px 0 9px;
                  color: #222;
                }
                .group-box-title {
                  font-weight: 700;
                  color: #2563eb;
                  font-size: 1.11em;
                  margin-bottom: 5px;
                }
                .group-box-list {
                  font-size: 1.12em;
                  color: #364152;
                  margin: 0;
                  padding-left: 19px;
                }
                .group-box-list li {
                  margin-bottom: 2px;
                  font-weight: 500;
                  color: #222;
                }
                .group-box-list span {
                  font-weight: bold;
                  color: #2563eb;
                  margin-right: 2px;
                }
                .games-section-title {
                  font-size: 1.23rem;
                  font-weight: 700;
                  color: #2563eb;
                  text-align: center;
                  margin-bottom: 15px;
                  margin-top: 6px;
                }
                .games-list-block {
                  display: flex;
                  flex-direction: column;
                  gap: 13px;
                  width: 100%;
                }
                .game-row-new {
                  display: flex;
                  flex-direction: row;
                  align-items: center;
                  justify-content: space-between;
                  border: 2px solid #60a5fa;
                  border-radius: 12px;
                  background: #fff;
                  padding: 16px 28px 16px 28px;
                  font-size: 1.05rem;
                  margin: 0 auto;
                  width: 90%;
                  min-width: 220px;
                  max-width: 600px;
                  box-sizing: border-box;
                }
                .game-title {
                  font-weight: 700;
                  color: #2563eb;
                  min-width: 95px;
                  font-size: 1.10em;
                }
                .team-desc {
                  font-weight: 500;
                  color: #222;
                  flex: 1;
                  text-align: left;
                  margin-left: 12px;
                  margin-right: 14px;
                  font-size: 1.06em;
                }
                .game-dashes {
                  color: #2563eb;
                  border-radius: 3px;
                  font-size: 1.07em;
                  background: #f3faff;
                  border: none;
                  min-width: 145px;
                  text-align: center;
                  font-weight: 600;
                  letter-spacing: 2px;
                  padding: 3px 0 3px 0;
                  margin-right: 3px;
                }
                @media (max-width: 900px) {
                  .game-row-new {
                    padding: 10px 5vw 10px 5vw;
                  }
                  .groups-flex {
                    gap: 8px;
                  }
                  .group-box-new {
                    margin: 0 2vw 4vw 2vw;
                    min-width: 140px;
                  }
                }
                @media (max-width: 600px) {
                  .print-container {
                    width: 99vw;
                    padding: 0px 1vw;
                  }
                  .group-box-new {
                    min-width: 98vw;
                    max-width: 99vw;
                    padding: 8px 1vw 8px 3vw;
                  }
                  .game-row-new {
                    min-width: unset;
                    width: 99vw;
                    max-width: 99vw;
                    padding: 10px 2vw;
                    font-size: 0.97rem;
                  }
                }
              </style>
            </head>
            <body>
              <div class="print-container">
                <div class="report-title">${tournamentName}</div>
                <div class="backup-title">Backup de Jogos do Torneio</div>
                <div class="generation-date">Data de Geração: ${generationDate}</div>
                <div class="section-divisor"></div>

                <div class="groups-section-title">Formação das Chaves</div>
                <div class="groups-flex">
                  ${groups.map(group => `
                    <div class="group-box-new">
                      <div class="group-box-title">${group.name}</div>
                      <ol class="group-box-list">
                        ${group.teamIds.map((tid: string, idx: number) => `
                          <li>
                            <span>${idx + 1}.</span> ${getTeamDisplayName(tid)}
                          </li>
                        `).join('')}
                      </ol>
                    </div>
                  `).join('')}
                </div>
                <div class="section-divisor"></div>

                <div class="games-section-title">Lista de Jogos</div>
                <div class="games-list-block">
                  ${matches.map((match, idx) => `
                    <div class="game-row-new">
                      <div class="game-title">Jogo ${idx + 1}</div>
                      <div class="team-desc">${getTeamDisplayName(match.teamIds[0])} <span style="color:#2563eb;font-weight:700">&nbsp;vs&nbsp;</span> ${getTeamDisplayName(match.teamIds[1])}</div>
                      <div class="game-dashes">______ x ______</div>
                    </div>
                  `).join('')}
                </div>
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
          {/* Layout do modal segue como referência visual para print */}
          {/* ... conteúdo visual pode ser mantido para o preview/modal ... */}
          {/* ... keep existing code (conteúdo visual do modal/preview) ... */}
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
