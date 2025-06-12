
import { useState, useEffect } from 'react';

interface TournamentData {
  name: string;
  format: string;
  size: number;
  status: string;
  players: any[];
  teams: any[];
  matches: any[];
  groups: any[];
  createdAt?: string;
}

export const useTournamentData = () => {
  const [tournamentData, setTournamentData] = useState<TournamentData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load from localStorage on component mount
    const savedData = localStorage.getItem('tournamentData');
    if (savedData) {
      try {
        setTournamentData(JSON.parse(savedData));
      } catch (error) {
        console.error('Error parsing saved tournament data:', error);
        setTournamentData(null);
      }
    }
    setIsLoading(false);
  }, []);

  const updateTournament = (updates: Partial<TournamentData>) => {
    setTournamentData(prevData => {
      const newData = prevData ? { ...prevData, ...updates } : updates as TournamentData;
      
      // Save to localStorage
      localStorage.setItem('tournamentData', JSON.stringify(newData));
      
      return newData;
    });
  };

  const resetTournament = () => {
    setTournamentData(null);
    localStorage.removeItem('tournamentData');
  };

  return {
    tournamentData,
    updateTournament,
    resetTournament,
    isLoading
  };
};
