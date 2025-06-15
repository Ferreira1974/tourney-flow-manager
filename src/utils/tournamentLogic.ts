export const generateMatches = (tournamentData: any) => {
  const { format, teams, players, status } = tournamentData;
  
  let matches: any[] = [];
  
  switch (format) {
    case 'super8':
      matches = generateSuper8Matches(players || []);
      break;
    case 'doubles_groups':
      matches = generateDoublesChampionshipMatches(teams || [], status);
      break;
    case 'super16':
      matches = generateSuper16Matches(teams || []);
      break;
    case 'king_of_the_court':
      matches = generateKingOfCourtMatches(teams || [], status);
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

const generateDoublesChampionshipMatches = (teams: any[], status: string) => {
  if (status === 'group_stage') {
    return generateDoublesGroupStageMatches(teams);
  } else if (status === 'round_of_16') {
    return generateDoublesEliminationMatches(teams, 'round_of_16');
  } else if (status === 'quarterfinals') {
    return generateDoublesEliminationMatches(teams, 'quarterfinals');
  } else if (status === 'semifinals') {
    return generateDoublesEliminationMatches(teams, 'semifinals');
  } else if (status === 'final') {
    return generateDoublesEliminationMatches(teams, 'final');
  } else if (status === 'third_place') {
    return generateDoublesEliminationMatches(teams, 'third_place');
  }
  
  return [];
};

const generateDoublesGroupStageMatches = (teams: any[]) => {
  // Embaralhar times para sorteio das chaves
  const shuffledTeams = [...teams].sort(() => Math.random() - 0.5);
  
  // Calcular número de grupos (3-4 times por grupo)
  const numTeams = shuffledTeams.length;
  let groupSize = 4;
  let numGroups = Math.ceil(numTeams / groupSize);
  
  // Ajustar para evitar grupos com menos de 3 times
  if (numTeams % numGroups < 3 && numGroups > 1) {
    groupSize = 3;
    numGroups = Math.ceil(numTeams / groupSize);
  }
  
  // Criar grupos
  const groups: any[] = [];
  for (let i = 0; i < numGroups; i++) {
    groups.push({
      id: `g_group_stage_${i}`,
      name: `Chave ${String.fromCharCode(65 + i)}`,
      teamIds: []
    });
  }
  
  // Distribuir times nos grupos
  shuffledTeams.forEach((team, index) => {
    groups[index % numGroups].teamIds.push(team.id);
  });

  return generateRoundRobinMatches(groups, 'group_stage');
};

const generateDoublesEliminationMatches = (qualifiedTeams: any[], phase: string) => {
  const matches: any[] = [];
  let matchIdCounter = 0;

  if (phase === 'final') {
    // Final - 2 times
    if (qualifiedTeams.length === 2) {
      matches.push({
        id: `m_final_${matchIdCounter++}`,
        phase: 'final',
        round: 'final',
        teamIds: [qualifiedTeams[0].id, qualifiedTeams[1].id],
        score1: null,
        score2: null,
        winnerId: null
      });
    }
  } else if (phase === 'third_place') {
    // Disputa de 3º lugar - 2 perdedores da semifinal
    if (qualifiedTeams.length === 2) {
      matches.push({
        id: `m_third_place_${matchIdCounter++}`,
        phase: 'third_place',
        round: 'third_place',
        teamIds: [qualifiedTeams[0].id, qualifiedTeams[1].id],
        score1: null,
        score2: null,
        winnerId: null
      });
    }
  } else {
    // Fases eliminatórias com cruzamento olímpico
    const pairedTeams = createOlympicCrossing(qualifiedTeams);
    
    pairedTeams.forEach(pair => {
      matches.push({
        id: `m_${phase}_${matchIdCounter++}`,
        phase: phase,
        round: phase,
        teamIds: [pair[0].id, pair[1].id],
        score1: null,
        score2: null,
        winnerId: null
      });
    });
  }

  return matches;
};

const createOlympicCrossing = (teams: any[]) => {
  // Cruzamento olímpico: 1º vs 8º, 2º vs 7º, 3º vs 6º, 4º vs 5º (para oitavas)
  // Para outras fases: 1º vs 4º, 2º vs 3º
  const pairs: any[] = [];
  const numTeams = teams.length;
  
  for (let i = 0; i < numTeams / 2; i++) {
    const team1 = teams[i];
    const team2 = teams[numTeams - 1 - i];
    pairs.push([team1, team2]);
  }
  
  return pairs;
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

const generateKingOfCourtMatches = (teams: any[], phase: string) => {
  if (phase === 'phase1_groups') {
    // Create 4 groups of 4 teams each
    const groups = [];
    const shuffledTeams = [...teams].sort(() => Math.random() - 0.5);
    
    for (let i = 0; i < 4; i++) {
      groups.push({
        id: `g_phase1_groups_${i}`,
        name: `Grupo ${String.fromCharCode(65 + i)}`,
        teamIds: shuffledTeams.slice(i * 4, (i + 1) * 4).map(t => t.id)
      });
    }
    
    return generateRoundRobinMatches(groups, 'phase1_groups');
  } else if (phase === 'phase2_playoffs') {
    // 8 qualified teams (2 from each group) play in 2 groups of 4
    const groups = [
      {
        id: 'g_phase2_playoffs_0',
        name: 'Grupo Semifinal A',
        teamIds: teams.slice(0, 4).map(t => t.id)
      },
      {
        id: 'g_phase2_playoffs_1',
        name: 'Grupo Semifinal B', 
        teamIds: teams.slice(4, 8).map(t => t.id)
      }
    ];
    
    return generateRoundRobinMatches(groups, 'phase2_playoffs');
  } else if (phase === 'phase3_final') {
    // Final 4 teams all play each other
    const groups = [{
      id: 'g_phase3_final_0',
      name: 'Grupo Final',
      teamIds: teams.map(t => t.id)
    }];
    
    return generateRoundRobinMatches(groups, 'phase3_final');
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

export const getQualifiedTeams = (tournamentData: any, phase: string) => {
  const teams = tournamentData.teams || [];
  const matches = tournamentData.matches || [];
  
  if (phase === 'group_stage') {
    // Get top 2 teams from each group for doubles championship
    const groups = tournamentData.groups || [];
    const qualifiedTeams: any[] = [];
    
    groups.forEach(group => {
      const groupTeams = teams.filter(team => group.teamIds.includes(team.id));
      const groupMatches = matches.filter(match => match.groupId === group.id && match.winnerId);
      
      // Calculate points for each team in the group
      groupTeams.forEach(team => {
        team.groupPoints = 0;
        team.groupWins = 0;
        team.groupPointsFor = 0;
        team.groupPointsAgainst = 0;
        
        groupMatches.forEach(match => {
          if (match.teamIds.includes(team.id)) {
            const isTeam1 = match.teamIds[0] === team.id;
            const teamScore = isTeam1 ? match.score1 : match.score2;
            const opponentScore = isTeam1 ? match.score2 : match.score1;
            
            team.groupPointsFor += teamScore;
            team.groupPointsAgainst += opponentScore;
            
            if (match.winnerId === team.id) {
              team.groupPoints += 3; // 3 points for win
              team.groupWins += 1;
            }
          }
        });
      });
      
      // Sort teams by points, then by point difference, then by points scored
      groupTeams.sort((a, b) => {
        if (b.groupPoints !== a.groupPoints) return b.groupPoints - a.groupPoints;
        const aDiff = a.groupPointsFor - a.groupPointsAgainst;
        const bDiff = b.groupPointsFor - b.groupPointsAgainst;
        if (bDiff !== aDiff) return bDiff - aDiff;
        return b.groupPointsFor - a.groupPointsFor;
      });
      
      // Qualify top 2 teams from each group
      qualifiedTeams.push(...groupTeams.slice(0, 2));
    });
    
    // Sort qualified teams by overall performance for seeding
    qualifiedTeams.sort((a, b) => {
      if (b.groupPoints !== a.groupPoints) return b.groupPoints - a.groupPoints;
      const aDiff = a.groupPointsFor - a.groupPointsAgainst;
      const bDiff = b.groupPointsFor - b.groupPointsAgainst;
      if (bDiff !== aDiff) return bDiff - aDiff;
      return b.groupPointsFor - a.groupPointsFor;
    });
    
    return qualifiedTeams;
  } else if (phase === 'elimination') {
    // Get winners from current elimination phase
    const currentPhaseMatches = matches.filter(match => 
      ['round_of_16', 'quarterfinals', 'semifinals'].includes(match.phase) && match.winnerId
    );
    
    const winnerIds = currentPhaseMatches.map(match => match.winnerId);
    return teams.filter(team => winnerIds.includes(team.id));
  }
  
  return [];
};

export const getNextPhase = (currentPhase: string, numQualifiedTeams: number) => {
  if (currentPhase === 'group_stage') {
    if (numQualifiedTeams >= 16) return 'round_of_16';
    if (numQualifiedTeams >= 8) return 'quarterfinals';
    if (numQualifiedTeams >= 4) return 'semifinals';
    if (numQualifiedTeams === 2) return 'final';
  }
  
  if (currentPhase === 'round_of_16') return 'quarterfinals';
  if (currentPhase === 'quarterfinals') return 'semifinals';
  if (currentPhase === 'semifinals') return 'final';
  
  return 'finished';
};

export const shouldCreateThirdPlaceMatch = (currentPhase: string) => {
  return currentPhase === 'semifinals';
};

export const shuffleArray = (array: any[]) => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};
