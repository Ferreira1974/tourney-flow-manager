import { useState, useEffect, useCallback } from 'react';

// A interface ajuda a manter a consistência dos dados
interface TournamentData {
  name: string;
  format: string;
  size: number;
  status: string;
  players: any[];
  teams: any[];
  matches: any[];
  groups: any[];
  createdAt: string;
}

export const useTournamentData = () => {
  const [tournamentData, setTournamentData] = useState<TournamentData | null>(null);
  const [isLoading, setIsLoading] = useState(true); // isLoading foi reintroduzido

  // Efeito para carregar os dados iniciais do localStorage
  useEffect(() => {
    try {
      const savedData = localStorage.getItem('tournamentData');
      if (savedData) {
        setTournamentData(JSON.parse(savedData));
      }
    } catch (error) {
      console.error('Falha ao carregar dados do torneio do localStorage:', error);
      setTournamentData(null);
    }
    setIsLoading(false); // Finaliza o carregamento
  }, []);

  // Efeito para salvar os dados no localStorage sempre que eles mudarem
  useEffect(() => {
    if (!isLoading) { // Só salva depois que o carregamento inicial terminar
      if (tournamentData) {
        localStorage.setItem('tournamentData', JSON.stringify(tournamentData));
      } else {
        localStorage.removeItem('tournamentData');
      }
    }
  }, [tournamentData, isLoading]);

  // A melhor versão do update: mescla dados parciais com o estado existente
  const updateTournament = useCallback((updates: Partial<TournamentData>) => {
    setTournamentData(prevData => {
      if (!prevData) return null; // Não deve acontecer se um torneio já existe
      return { ...prevData, ...updates };
    });
  }, []);

  // Mantém a função de criação dedicada, que é uma boa prática
  const createTournament = useCallback((data: Partial<TournamentData>) => {
    const dataWithDefaults: TournamentData = {
      name: '',
      format: '',
      size: 0,
      status: 'registration',
      players: [],
      teams: [],
      matches: [],
      groups: [],
      createdAt: new Date().toISOString(),
      ...data,
    };
    setTournamentData(dataWithDefaults);
  }, []);

  // Mantém a função de limpar com a confirmação
  const clearTournament = useCallback(() => {
    if (window.confirm("Tem certeza que deseja apagar este torneio? Essa ação não pode ser desfeita.")) {
      setTournamentData(null);
    }
  }, []);
  
  // A função 'loadTournament' é redundante se tivermos um 'update' que substitui tudo
  // Mas se a ideia é carregar um backup, podemos fazer assim:
  const loadTournament = useCallback((data: TournamentData) => {
    if (window.confirm("Isso irá substituir o torneio atual. Deseja continuar?")) {
        setTournamentData(data);
    }
  }, []);

  return {
    tournamentData,
    isLoading,
    createTournament,
    updateTournament,
    clearTournament,
    loadTournament,
  };
};