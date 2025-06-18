import React from 'react';
import { Button } from './ui/button';
import { RotateCcw, Upload, Trash2, Trophy } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { getPhaseTitle, getStatusBadge } from '@/utils/phaseUtils';

interface TournamentHeaderProps {
  tournamentData: any;
  onLoadTournament: (data: any) => void;
  onClearTournament: () => void;
}

const TournamentHeader = ({ tournamentData, onLoadTournament, onClearTournament }: TournamentHeaderProps) => {
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result;
          if (typeof content === 'string') {
            const data = JSON.parse(content);
            onLoadTournament(data);
          }
        } catch (error) {
          console.error("Failed to parse backup file", error);
        }
      };
      reader.readAsText(file);
    }
  };

  const handleDownloadBackup = () => {
    const dataStr = JSON.stringify(tournamentData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `${tournamentData.name.replace(/\s+/g, '_')}_backup.json`;
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };
  
  return (
    <header className="bg-gray-800 p-4 rounded-lg border border-gray-700 shadow-lg">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex-1">
                <div className='flex items-center gap-3 mb-2'>
                    <Trophy className="w-8 h-8 text-yellow-400" />
                    <h1 className="text-2xl font-bold text-white truncate">{tournamentData.name}</h1>
                </div>
                <div className="flex items-center gap-2">
                    <Badge variant="secondary">{tournamentData.format.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</Badge>
                    <Badge variant={getStatusBadge(tournamentData.status)}>
                        {getPhaseTitle(tournamentData.status)}
                    </Badge>
                </div>
            </div>

            <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => document.getElementById('file-upload')?.click()}>
                    <Upload className="mr-2 h-4 w-4"/> Carregar Backup
                </Button>
                <input type="file" id="file-upload" accept=".json" className="hidden" onChange={handleFileUpload} />

                <Button variant="outline" size="sm" onClick={handleDownloadBackup}>
                    Baixar Backup
                </Button>
                
                <Button variant="destructive" size="sm" onClick={onClearTournament}>
                    <RotateCcw className="mr-2 h-4 w-4"/> Resetar
                </Button>
            </div>
        </div>
    </header>
  );
};

export default TournamentHeader;