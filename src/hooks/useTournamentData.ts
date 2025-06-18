import { useState, useEffect, useCallback } from 'react';

export const useTournamentData = () => {
  const [tournamentData, setTournamentData] = useState<any>(() => {
    try {
      const saved = localStorage.getItem('tournamentData');
      return saved ? JSON.parse(saved) : null;
    } catch (error) {
      console.error("Failed to parse tournament data from localStorage", error);
      return null;
    }
  });

  useEffect(() => {
    if (tournamentData) {
      localStorage.setItem('tournamentData', JSON.stringify(tournamentData));
    } else {
      localStorage.removeItem('tournamentData');
    }
  }, [tournamentData]);

  const updateTournamentData = useCallback((data: any) => {
    setTournamentData(data);
  }, []);

  const createTournament = useCallback((data: any) => {
    const dataWithDefaults = {
        ...data,
        players: data.players || [],
        teams: data.teams || [],
        matches: data.matches || [],
        groups: data.groups || [],
        createdAt: new Date().toISOString()
    };
    setTournamentData(dataWithDefaults);
  }, []);

  const clearTournament = useCallback(() => {
    if (window.confirm("Tem certeza que deseja apagar este torneio? Essa ação não pode ser desfeita.")) {
        setTournamentData(null);
    }
  }, []);
  
  const loadTournament = useCallback((data: any) => {
    setTournamentData(data);
  }, [])

  return {
    tournamentData,
    updateTournament: updateTournamentData,
    createTournament,
    clearTournament,
    loadTournament,
  };
};