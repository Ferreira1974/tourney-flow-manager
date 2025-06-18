// Crie este novo arquivo em: src/components/GameSheetPrinter.tsx

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import GamePrintBackupDialog from "./GamePrintBackupDialog"; // Ajuste o caminho se necessário

interface GameSheetPrinterProps {
  tournamentData: any;
}

const GameSheetPrinter: React.FC<GameSheetPrinterProps> = ({ tournamentData }) => {
  const [isPrintDialogOpen, setPrintDialogOpen] = useState(false);

  if (!tournamentData.matches || tournamentData.matches.length === 0) {
    return null;
  }

  return (
    <>
      <Button
        onClick={() => setPrintDialogOpen(true)}
        variant="ghost"
        className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
      >
        <Printer className="mr-2" />
        Imprimir Folha de Jogos
      </Button>
      <GamePrintBackupDialog
        open={isPrintDialogOpen}
        onOpenChange={setPrintDialogOpen}
        tournamentData={tournamentData}
      />
    </>
  );
};

export default GameSheetPrinter;