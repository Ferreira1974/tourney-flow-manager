import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Crown, Users, Trophy, Zap } from 'lucide-react';

interface TournamentSetupProps {
  onCreateTournament: (tournamentData: any) => void;
}

const TournamentSetup = ({ onCreateTournament }: TournamentSetupProps) => {
  const [selectedFormat, setSelectedFormat] = useState('');
  const [tournamentName, setTournamentName] = useState('');
  const [tournamentSize, setTournamentSize] = useState('');

  const formats = [
    {
      id: 'super8',
      name: 'Super 8',
      description: 'Individual Rotativo',
      icon: Crown,
      details: '8 jogadores, todos jogam contra todos em duplas rotativas.',
      color: 'from-purple-500 to-blue-500'
    },
    {
      id: 'doubles_groups',
      name: 'Torneio Duplas',
      description: 'Grupos + Mata-Mata',
      icon: Users,
      details: 'Duplas fixas, fase de grupos seguida de eliminatórias.',
      color: 'from-green-500 to-teal-500'
    },
    {
      id: 'super16',
      name: 'Super 16',
      description: 'Fase de Grupos + Mata-Mata',
      icon: Trophy,
      details: '12 ou 16 duplas. Grupos de 4, 2 classificam por grupo.',
      color: 'from-yellow-500 to-orange-500'
    },
    {
      id: 'king_of_the_court',
      name: 'Rei da Quadra',
      description: '3 Fases',
      icon: Zap,
      details: 'Grupos, playoffs e final - formato eliminatório progressivo.',
      color: 'from-red-500 to-pink-500'
    }
  ];

  const handleFormatSelect = (formatId: string) => {
    setSelectedFormat(formatId);
    setTournamentSize('');
    
    if (formatId === 'super8' || formatId === 'king_of_the_court') {
      setTournamentSize('16'); // Ajuste para king_of_the_court, se necessário
      if(formatId === 'super8') setTournamentSize('8');
    }
  };

  const handleCreateTournament = () => {
    if (!isValid) return;

    const tournamentData = {
      name: tournamentName.trim(),
      format: selectedFormat,
      size: parseInt(tournamentSize),
      status: 'registration',
    };

    onCreateTournament(tournamentData);
  };

  const isValid = selectedFormat && tournamentName.trim() && !!tournamentSize;

  return (
    <Card className="bg-gray-800 border-gray-700 p-8 max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">Configurar Torneio</h2>
        <p className="text-gray-400">Escolha o formato e configure seu torneio</p>
      </div>

      <div className="mb-8">
        <h3 className="text-xl font-semibold text-white mb-4">1. Nome do Torneio</h3>
        <Input
          value={tournamentName}
          onChange={(e) => setTournamentName(e.target.value)}
          placeholder="Digite o nome do torneio"
          className="bg-gray-700 border-gray-600 text-white text-lg p-4"
        />
      </div>

      <div className="mb-8">
        <h3 className="text-xl font-semibold text-white mb-4">2. Escolha o Formato</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {formats.map((format) => (
            <button
              key={format.id}
              onClick={() => handleFormatSelect(format.id)}
              className={`relative p-6 rounded-lg border-2 transition-all duration-200 text-left ${selectedFormat === format.id ? 'border-blue-500 bg-gradient-to-r ' + format.color + ' text-white shadow-lg scale-105' : 'border-gray-600 bg-gray-700 hover:border-gray-500 text-gray-300'}`}
            >
              {/* ... conteúdo do botão ... */}
            </button>
          ))}
        </div>
      </div>

      {selectedFormat && (
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-white mb-4">3. Número de Participantes</h3>
          {selectedFormat === 'super16' ? (
            <Select value={tournamentSize} onValueChange={setTournamentSize}>
              <SelectTrigger className="bg-gray-700 border-gray-600 text-white text-lg p-4">
                <SelectValue placeholder="Selecione o número de jogadores" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="24">24 jogadores (12 duplas)</SelectItem>
                <SelectItem value="32">32 jogadores (16 duplas)</SelectItem>
              </SelectContent>
            </Select>
          ) : (
            <Input
              type="number"
              value={tournamentSize}
              onChange={e => setTournamentSize(e.target.value)}
              placeholder="Nº de jogadores ou duplas"
              className="bg-gray-700 border-gray-600 text-white text-lg p-4"
              // Para formatos com tamanho fixo, poderia ser readOnly
              readOnly={selectedFormat === 'super8' || selectedFormat === 'king_of_the_court'}
            />
          )}
        </div>
      )}

      <div className="text-center">
        <Button
          onClick={handleCreateTournament}
          disabled={!isValid}
          size="lg"
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Criar Torneio
        </Button>
      </div>
    </Card>
  );
};

export default TournamentSetup;