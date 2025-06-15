
import React from "react";
import { Card } from "@/components/ui/card";
import { Crown } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface TournamentFinalStandingsProps {
  finalStandings: any[];
}

const TournamentFinalStandings = ({ finalStandings }: TournamentFinalStandingsProps) => (
  <Card className="bg-white print:bg-white border border-blue-300 rounded-lg p-2 sm:p-4 shadow-sm">
    <div className="flex items-center gap-2 mb-2">
      <Crown className="w-5 h-5 text-yellow-500" />
      <span className="text-base font-bold text-blue-700">
        Classificação Final
      </span>
    </div>
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-blue-900 w-10 text-xs p-1">Pos.</TableHead>
            <TableHead className="text-blue-900 text-xs font-bold p-1">Nome</TableHead>
            <TableHead className="text-blue-900 text-center text-xs font-bold p-1">Jogos</TableHead>
            <TableHead className="text-blue-900 text-center text-xs font-bold p-1">Vitórias</TableHead>
            <TableHead className="text-blue-900 text-center text-xs font-bold p-1">Pontos Pró</TableHead>
            <TableHead className="text-blue-900 text-center text-xs font-bold p-1">Pontos Contra</TableHead>
            <TableHead className="text-blue-900 text-center text-xs font-bold p-1">Saldo</TableHead>
            <TableHead className="text-blue-900 text-center text-xs font-bold p-1">Aproveit.</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {finalStandings.map((participant: any, idx: number) => (
            <TableRow
              key={participant.id}
              className={
                idx === 0
                  ? "bg-yellow-50"
                  : idx === 1
                  ? "bg-gray-100"
                  : idx === 2
                  ? "bg-amber-100"
                  : ""
              }
            >
              <TableCell className="font-bold text-blue-800 text-xs p-1 align-middle flex gap-1 items-center">
                <span>{participant.position}º</span>
                {participant.position === 1 && (
                  <span className="inline-block w-3 h-3 bg-yellow-400 rounded-full" />
                )}
                {participant.position === 2 && (
                  <span className="inline-block w-3 h-3 bg-gray-400 rounded-full" />
                )}
                {participant.position === 3 && (
                  <span className="inline-block w-3 h-3 bg-amber-600 rounded-full" />
                )}
              </TableCell>
              <TableCell className="text-blue-950 p-1 font-bold text-xs">
                {participant.name}
              </TableCell>
              <TableCell className="text-center text-blue-900 text-xs p-1">
                {participant.gamesPlayed || 0}
              </TableCell>
              <TableCell className="text-center text-blue-900 font-bold text-xs p-1">
                {participant.wins || 0}
              </TableCell>
              <TableCell className="text-center text-blue-900 text-xs p-1">
                {participant.pointsFor || 0}
              </TableCell>
              <TableCell className="text-center text-blue-900 text-xs p-1">
                {participant.pointsAgainst || 0}
              </TableCell>
              <TableCell
                className={`text-center font-bold text-xs p-1 ${
                  participant.pointsDiff >= 0
                    ? "text-green-700"
                    : "text-red-700"
                }`}
              >
                {participant.pointsDiff >= 0 ? "+" : ""}
                {participant.pointsDiff}
              </TableCell>
              <TableCell className="text-center text-blue-900 text-xs p-1">
                {participant.winRate}%
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
    <div className="mt-2 text-xs text-gray-500">
      <strong>Critérios de desempate:</strong> 1º Vitórias, 2º Saldo de pontos (pró - contra)
    </div>
  </Card>
);

export default TournamentFinalStandings;
