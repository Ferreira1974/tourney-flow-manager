
export const getPhaseTitle = (phase: string) => {
  const phaseNames = {
    'group_stage': 'Fase de Grupos',
    'round_of_16': 'Oitavas de Final',
    'quarterfinals': 'Quartas de Final',
    'semifinals': 'Semifinais',
    'final': 'Final',
    'third_place': 'Disputa de 3º Lugar',
    'phase1_groups': 'Fase 1 - Grupos',
    'phase2_playoffs': 'Fase 2 - Playoffs',  
    'phase3_final': 'Fase 3 - Final',
    'playoffs': 'Playoffs',
    'finished': 'Torneio Finalizado',
    'registration': 'Inscrições',
    'playing': 'Em Andamento'
  };
  return phaseNames[phase] || 'Jogos do Torneio';
};

export const getStatusBadge = (status: string) => {
  const statusMap = {
    registration: { label: 'Inscrições', color: 'bg-yellow-500' },
    playing: { label: 'Em Andamento', color: 'bg-green-500' },
    finished: { label: 'Finalizado', color: 'bg-blue-500' },
    group_stage: { label: 'Fase de Grupos', color: 'bg-orange-500' },
    round_of_16: { label: 'Oitavas de Final', color: 'bg-purple-500' },
    quarterfinals: { label: 'Quartas de Final', color: 'bg-red-500' },
    semifinals: { label: 'Semifinais', color: 'bg-pink-500' },
    final: { label: 'Final', color: 'bg-gold-500' },
    third_place: { label: 'Disputa 3º Lugar', color: 'bg-amber-500' },
    phase1_groups: { label: 'Fase 1 - Grupos', color: 'bg-orange-500' },
    phase2_playoffs: { label: 'Fase 2 - Playoffs', color: 'bg-purple-500' },
    phase3_final: { label: 'Fase 3 - Final', color: 'bg-red-500' },
  };
  
  return statusMap[status] || { label: 'Desconhecido', color: 'bg-gray-500' };
};
