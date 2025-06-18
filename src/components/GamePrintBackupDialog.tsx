// Conteúdo completo para: src/components/GamePrintBackupDialog.tsx

import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Printer, X } from "lucide-react";
import { getParticipantDisplayName } from "@/utils/tournamentLogic";

interface GamePrintBackupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tournamentData: any;
}

const GamePrintBackupDialog: React.FC<GamePrintBackupDialogProps> = ({
  open,
  onOpenChange,
  tournamentData,
}) => {

  const handlePrint = () => {
    const printContent = document.getElementById("printable-content");
    if (printContent) {
      const printWindow = window.open('', '', 'height=800,width=800');
      if (printWindow) {
        printWindow.document.write('<html><head><title>Folha de Jogos</title>');
        printWindow.document.write('<style>body { font-family: sans-serif; } table { width: 100%; border-collapse: collapse; } th, td { border: 1px solid #ccc; padding: 8px; text-align: left; } .header { text-align: center; margin-bottom: 20px; } .vs { font-weight: bold; padding: 0 10px; } .score { width: 120px; } </style>');
        printWindow.document.write('</head><body>');
        printWindow.document.write(printContent.innerHTML);
        printWindow.document.write('</body></html>');
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
        printWindow.close();
      }
    }
  };

  const { name, groups = [], matches = [] } = tournamentData;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Imprimir Folha de Jogos</DialogTitle>
          <DialogDescription>
            Use esta folha para marcar os resultados manualmente durante o torneio.
          </DialogDescription>
        </DialogHeader>
        <div id="printable-content" className="max-h-[60vh] overflow-y-auto p-4 border rounded">
          <div className="header">
            <h1>{name}</h1>
            <h2>Folha de Anotação de Jogos</h2>
          </div>
          {groups.length > 0 && (
            <div className="mb-6">
              <h3 className="font-bold text-lg mb-2">Chaves / Grupos</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
                {groups.map((group: any) => (
                  <div key={group.id} style={{ border: '1px solid #eee', padding: '1rem', borderRadius: '8px' }}>
                    <h4 className="font-bold">{group.name}</h4>
                    <ol style={{ listStyle: 'decimal', paddingLeft: '20px' }}>
                      {group.teamIds.map((tid: string) => (
                        <li key={tid}>{getParticipantDisplayName(tid, tournamentData)}</li>
                      ))}
                    </ol>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div>
            <h3 className="font-bold text-lg mb-2">Jogos</h3>
            <table>
              <tbody>
                {matches.map((match: any, index: number) => (
                  <tr key={match.id}>
                    <td>JOGO {index + 1}</td>
                    <td style={{ textAlign: 'right' }}>{getParticipantDisplayName(match.teamIds[0], tournamentData)}</td>
                    <td className="vs">vs</td>
                    <td>{getParticipantDisplayName(match.teamIds[1], tournamentData)}</td>
                    <td className="score">____ x ____</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}><X className="mr-2 h-4 w-4"/> Fechar</Button>
          <Button onClick={handlePrint}><Printer className="mr-2 h-4 w-4"/> Imprimir</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default GamePrintBackupDialog;