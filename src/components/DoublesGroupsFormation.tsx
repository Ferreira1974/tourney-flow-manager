
import React from "react";
import { Users } from "lucide-react";

interface DoublesGroupsFormationProps {
  tournamentData: any;
}

const DoublesGroupsFormation = ({ tournamentData }: DoublesGroupsFormationProps) => {
  if (!tournamentData.groups || tournamentData.groups.length === 0) return null;

  return (
    <div className="mb-4">
      <div className="flex items-center gap-2 mb-2">
        <Users className="w-5 h-5 text-blue-400 print:text-blue-600" />
        <h3 className="text-base print:text-lg font-bold text-white print:text-black">
          Formação das Chaves
        </h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tournamentData.groups.map((group: any) => (
          <div key={group.id} className="bg-gray-700 print:bg-gray-50 border rounded-lg p-3">
            <div className="font-bold text-blue-300 mb-2">{group.name}</div>
            <ol className="space-y-1">
              {group.teamIds.map((tid: string, idx: number) => {
                const team = (tournamentData.teams || []).find((t: any) => t.id === tid);
                return (
                  <li key={tid} className="text-white print:text-black text-sm">
                    <span className="font-bold">{idx + 1}.</span> {team ? team.name : 'Dupla'}
                  </li>
                );
              })}
            </ol>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DoublesGroupsFormation;
