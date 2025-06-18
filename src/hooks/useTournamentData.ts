// Conteúdo completo para: src/hooks/useTournamentData.ts

import { useState, useEffect, useCallback } from 'react';

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
  seededPlayerIds: string[]; // <-- MUDANÇA: Adicionado
}

export const useTournamentData = () => {
  const [tournamentData, setTournamentData] = useState<TournamentData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (!isLoading) {
      if (tournamentData) {
        localStorage.setItem('tournamentData', JSON.stringify(tournamentData));
      } else {
        localStorage.removeItem('tournamentData');
      }
    }
  }, [tournamentData, isLoading]);

  const updateTournament = useCallback((updates: Partial<TournamentData>) => {
    setTournamentData(prevData => {
      if (!prevData) return null;
      return { ...prevData, ...updates };
    });
  }, []);

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
      seededPlayerIds: [], // <-- MUDANÇA: Adicionado
      createdAt: new Date().toISOString(),
      ...data,
    };
    setTournamentData(dataWithDefaults);
  }, []);

  const clearTournament = useCallback(() => {
    if (window.confirm("Tem certeza que deseja apagar este torneio? Essa ação não pode ser desfeita.")) {
      setTournamentData(null);
    }
  }, []);
  
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