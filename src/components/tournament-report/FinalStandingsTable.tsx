
import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Crown } from "lucide-react";

interface FinalStandingsTableProps {
  standings: any[];
}

export default function FinalStandingsTable({ standings }: FinalStandingsTableProps) {
  return (
    <>
      <div className="flex items-center gap-3 mb-3">
        <Crown className="w-5 h-5 text-yellow-400 print:text-yellow-600" />
        <h3 className="text-base print:text-lg font-bold text-white print:text-black">Classificação Final</h3>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-gray-600 print:border-gray-300">
              <TableHead className="text-gray-300 print:text-gray-700 w-12 text-xs font-bold p-1">Pos.</TableHead>
              <TableHead className="text-gray-300 print:text-gray-700 text-xs font-bold p-1">Nome</TableHead>
              <TableHead className="text-gray-300 print:text-gray-700 text-center text-xs font-bold p-1">Jogos</TableHead>
              <TableHead className="text-gray-300 print:text-gray-700 text-center text-xs font-bold p-1">Vitórias</TableHead>
              <TableHead className="text-gray-300 print:text-gray-700 text-center text-xs font-bold p-1">Pontos Pró</TableHead>
              <TableHead className="text-gray-300 print:text-gray-700 text-center text-xs font-bold p-1">Pontos Contra</TableHead>
              <TableHead className="text-gray-300 print:text-gray-700 text-center text-xs font-bold p-1">Saldo</TableHead>
              <TableHead className="text-gray-300 print:text-gray-700 text-center text-xs font-bold p-1">Aproveitamento</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {standings.map((participant) => (
              <TableRow key={participant.id} className="border-gray-600 print:border-gray-300">
                <TableCell className="font-bold text-white print:text-black text-xs p-1">
                  <div className="flex items-center gap-1">
                    <span className="text-xs">{participant.position}º</span>
                    {participant.position <= 3 && (
                      <div className={`w-2 h-2 rounded-full ${
                        participant.position === 1 ? 'bg-yellow-500' : 
                        participant.position === 2 ? 'bg-gray-400' : 'bg-amber-600'
                      }`} />
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-white print:text-black p-1">
                  <div>
                    <div className="font-bold text-xs">{participant.name}</div>
                    {participant.players && (
                      <div className="text-xs text-gray-400 print:text-gray-600">
                        {participant.players.join(' / ')}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-center text-white print:text-black text-xs p-1">{participant.gamesPlayed || 0}</TableCell>
                <TableCell className="text-center text-white print:text-black font-bold text-xs p-1">{participant.wins || 0}</TableCell>
                <TableCell className="text-center text-white print:text-black text-xs p-1">{participant.pointsFor || 0}</TableCell>
                <TableCell className="text-center text-white print:text-black text-xs p-1">{participant.pointsAgainst || 0}</TableCell>
                <TableCell className={`text-center font-bold text-xs p-1 ${participant.pointsDiff >= 0 ? 'text-green-400 print:text-green-700' : 'text-red-400 print:text-red-700'}`}>
                  {participant.pointsDiff >= 0 ? '+' : ''}{participant.pointsDiff}
                </TableCell>
                <TableCell className="text-center text-white print:text-black text-xs p-1">{participant.winRate}%</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {standings.length > 0 && (
        <div className="mt-2 text-xs text-gray-400 print:text-gray-600">
          <strong>Critérios de Desempate:</strong> 1º Número de vitórias, 2º Saldo de pontos (pontos pró - pontos contra)
        </div>
      )}
    </>
  );
}
