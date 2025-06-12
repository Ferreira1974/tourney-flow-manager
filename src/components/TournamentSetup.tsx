
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
      details: '8 jogadores, todos jogam contra todos em duplas rotativas',
      color: 'from-purple-500 to-blue-500'
    },
    {
      id: 'doubles_groups',
      name: 'Torneio Duplas',
      description: 'Grupos + Mata-Mata',
      icon: Users,
      details: 'Duplas fixas, fase de grupos seguida de eliminatórias',
      color: 'from-green-500 to-teal-500'
    },
    {
      id: 'super16',
      name: 'Super 16',
      description: 'Duplas Sorteadas',
      icon: Trophy,
      details: '16 jogadores sorteados em 8 duplas para competição',
      color: 'from-yellow-500 to-orange-500'
    },
    {
      id: 'king_of_the_court',
      name: 'Rei da Quadra',
      description: '3 Fases',
      icon: Zap,
      details: 'Grupos, playoffs e final - formato eliminatório progressivo',
      color: 'from-red-500 to-pink-500'
    }
  ];

  const getSizeOptions = (format: string) => {
    switch (format) {
      case 'super8':
        return [{ value: '8', label: '8 jogadores' }];
      case 'super16':
        return [{ value: '16', label: '16 jogadores' }];
      case 'king_of_the_court':
        return [{ value: '16', label: '16 jogadores' }];
      case 'doubles_groups':
        return [
          { value: '8', label: '8 duplas (16 jogadores)' },
          { value: '9', label: '9 duplas (18 jogadores)' },
          { value: '12', label: '12 duplas (24 jogadores)' }
        ];
      default:
        return [];
    }
  };

  const handleFormatSelect = (formatId: string) => {
    setSelectedFormat(formatId);
    setTournamentSize(''); // Reset size when format changes
  };

  const handleCreateTournament = () => {
    if (!selectedFormat || !tournamentName.trim()) return;

    const sizeOptions = getSizeOptions(selectedFormat);
    const size = tournamentSize || sizeOptions[0]?.value;

    const tournamentData = {
      name: tournamentName.trim(),
      format: selectedFormat,
      size: parseInt(size),
      status: 'registration',
      players: [],
      teams: [],
      matches: [],
      groups: [],
      createdAt: new Date().toISOString()
    };

    onCreateTournament(tournamentData);
  };

  const isValid = selectedFormat && tournamentName.trim();

  return (
    <Card className="bg-gray-800 border-gray-700 p-8 max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">Configurar Torneio</h2>
        <p className="text-gray-400">Escolha o formato e configure seu torneio</p>
      </div>

      {/* Format Selection */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-white mb-4">1. Escolha o Formato</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {formats.map((format) => {
            const Icon = format.icon;
            const isSelected = selectedFormat === format.id;
            
            return (
              <button
                key={format.id}
                onClick={() => handleFormatSelect(format.id)}
                className={`
                  relative p-6 rounded-lg border-2 transition-all duration-200 text-left
                  ${isSelected 
                    ? 'border-blue-500 bg-gradient-to-r ' + format.color + ' text-white shadow-lg scale-105' 
                    : 'border-gray-600 bg-gray-700 hover:border-gray-500 text-gray-300'
                  }
                `}
              >
                <div className="flex items-start gap-4">
                  <Icon className={`w-8 h-8 ${isSelected ? 'text-white' : 'text-gray-400'}`} />
                  <div className="flex-1">
                    <h4 className="text-lg font-bold mb-1">{format.name}</h4>
                    <p className={`text-sm mb-2 ${isSelected ? 'text-white/80' : 'text-gray-400'}`}>
                      {format.description}
                    </p>
                    <p className={`text-xs ${isSelected ? 'text-white/70' : 'text-gray-500'}`}>
                      {format.details}
                    </p>
                  </div>
                </div>
                {isSelected && (
                  <div className="absolute top-2 right-2">
                    <Badge className="bg-white text-gray-900">Selecionado</Badge>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tournament Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            2. Nome do Torneio
          </label>
          <Input
            value={tournamentName}
            onChange={(e) => setTournamentName(e.target.value)}
            placeholder="Digite o nome do torneio"
            className="bg-gray-700 border-gray-600 text-white"
          />
        </div>

        {selectedFormat && (
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              3. Número de Participantes
            </label>
            <Select value={tournamentSize} onValueChange={setTournamentSize}>
              <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                <SelectValue placeholder="Selecione o tamanho" />
              </SelectTrigger>
              <SelectContent className="bg-gray-700 border-gray-600">
                {getSizeOptions(selectedFormat).map((option) => (
                  <SelectItem key={option.value} value={option.value} className="text-white">
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* Create Button */}
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
