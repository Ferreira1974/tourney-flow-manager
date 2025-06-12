
export const generateMatches = (tournamentData: any) => {
  const { format, teams, players, status } = tournamentData;
  
  let matches: any[] = [];
  
  switch (format) {
    case 'super8':
      matches = generateSuper8Matches(players || []);
      break;
    case 'doubles_groups':
      matches = generateDoublesGroupMatches(teams || [], tournamentData.size);
      break;
    case 'super16':
      matches = generateSuper16Matches(teams || []);
      break;
    case 'king_of_the_court':
      matches = generateKingOfCourtMatches(players || [], status);
      break;
  }
  
  return matches;
};

const generateSuper8Matches = (players: any[]) => {
  if (players.length !== 8) return [];
  
  // Super 8 rotation system - all players play with each other as partners
  const pairings = [
    [[0,1],[2,3],[4,5],[6,7]], // Round 1
    [[0,2],[1,3],[4,6],[5,7]], // Round 2  
    [[0,3],[1,2],[4,7],[5,6]], // Round 3
    [[0,4],[1,5],[2,6],[3,7]], // Round 4
    [[0,5],[1,4],[2,7],[3,6]], // Round 5
    [[0,6],[1,7],[2,4],[3,5]], // Round 6
    [[0,7],[1,6],[2,5],[3,4]]  // Round 7
  ];

  const matches: any[] = [];
  let matchIdCounter = 0;

  pairings.forEach((round, roundIndex) => {
    // Each round has 2 matches (4 pairs playing)
    const match1Players = [players[round[0][0]].id, players[round[0][1]].id, players[round[1][0]].id, players[round[1][1]].id];
    const match2Players = [players[round[2][0]].id, players[round[2][1]].id, players[round[3][0]].id, players[round[3][1]].id];
    
    matches.push({
      id: `m_playing_${matchIdCounter++}`,
      phase: 'playing',
      round: roundIndex + 1,
      teamIds: [match1Players.slice(0, 2), match1Players.slice(2, 4)],
      score1: null,
      score2: null,
      winnerId: null
    });
    
    matches.push({
      id: `m_playing_${matchIdCounter++}`,
      phase: 'playing', 
      round: roundIndex + 1,
      teamIds: [match2Players.slice(0, 2), match2Players.slice(2, 4)],
      score1: null,
      score2: null,
      winnerId: null
    });
  });

  return matches;
};

const generateDoublesGroupMatches = (teams: any[], size: number) => {
  const groupSize = size === 9 ? 3 : 4;
  const numGroups = Math.ceil(teams.length / groupSize);
  
  // Shuffle teams and distribute into groups
  const shuffledTeams = [...teams].sort(() => Math.random() - 0.5);
  const groups: any[] = [];
  
  for (let i = 0; i < numGroups; i++) {
    groups.push({
      id: `g_group_stage_${i}`,
      name: `Grupo ${String.fromCharCode(65 + i)}`,
      teamIds: []
    });
  }
  
  shuffledTeams.forEach((team, index) => {
    groups[index % numGroups].teamIds.push(team.id);
  });

  return generateRoundRobinMatches(groups, 'group_stage');
};

const generateSuper16Matches = (teams: any[]) => {
  if (teams.length !== 8) return []; // Should have 8 teams (16 players in doubles)
  
  // Generate group stage with 2 groups of 4 teams each
  const groups = [
    {
      id: 'g_group_stage_0',
      name: 'Grupo A',
      teamIds: teams.slice(0, 4).map(t => t.id)
    },
    {
      id: 'g_group_stage_1', 
      name: 'Grupo B',
      teamIds: teams.slice(4, 8).map(t => t.id)
    }
  ];

  return generateRoundRobinMatches(groups, 'group_stage');
};

const generateKingOfCourtMatches = (players: any[], phase: string) => {
  if (phase === 'phase1_groups') {
    // Convert players to teams for consistency
    const teams = players.map(p => ({
      id: p.id,
      name: p.name,
      players: [p.name]
    }));
    
    // Create 4 groups of 4 players each
    const groups = [];
    for (let i = 0; i < 4; i++) {
      groups.push({
        id: `g_phase1_groups_${i}`,
        name: `Grupo ${String.fromCharCode(65 + i)}`,
        teamIds: teams.slice(i * 4, (i + 1) * 4).map(t => t.id)
      });
    }
    
    return generateRoundRobinMatches(groups, 'phase1_groups');
  }
  
  return [];
};

const generateRoundRobinMatches = (groups: any[], phase: string) => {
  const matches: any[] = [];
  let matchIdCounter = 0;

  groups.forEach(group => {
    const teamIds = group.teamIds;
    
    // Generate all possible combinations within the group
    for (let i = 0; i < teamIds.length; i++) {
      for (let j = i + 1; j < teamIds.length; j++) {
        matches.push({
          id: `m_${phase}_${matchIdCounter++}`,
          phase: phase,
          groupId: group.id,
          teamIds: [teamIds[i], teamIds[j]],
          score1: null,
          score2: null,
          winnerId: null
        });
      }
    }
  });

  return matches;
};

export const shuffleArray = (array: any[]) => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};
