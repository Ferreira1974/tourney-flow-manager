// Conteúdo completo para: src/utils/tournamentLogic.ts

export const generateMatches = (tournamentData: any) => {
  const { format, teams, players, status } = tournamentData;
  
  let matches: any[] = [];
  
  switch (format) {
    case 'super8':
      matches = generateSuper8Matches(players || []);
      break;
    case 'doubles_groups':
      const result = generateDoublesChampionshipMatches(teams || [], status);
      matches = result.matches;
      if (result.groups && result.groups.length > 0) {
        tournamentData.groups = result.groups;
      }
      break;
    case 'super16':
      const super16Result = generateSuper16ChampionshipMatches(tournamentData);
      matches = super16Result.matches;
      if (super16Result.groups && super16Result.groups.length > 0) {
        tournamentData.groups = super16Result.groups;
      }
      break;
    case 'king_of_the_court':
      matches = generateKingOfCourtMatches(teams || [], status);
      break;
  }
  
  return matches;
};

const generateSuper8Matches = (players: any[]) => {
  if (players.length !== 8) return [];
  
  const pairings = [
    [[0,1],[2,3],[4,5],[6,7]],
    [[0,2],[1,3],[4,6],[5,7]],  
    [[0,3],[1,2],[4,7],[5,6]],
    [[0,4],[1,5],[2,6],[3,7]],
    [[0,5],[1,4],[2,7],[3,6]],
    [[0,6],[1,7],[2,4],[3,5]],
    [[0,7],[1,6],[2,5],[3,4]]
  ];

  const matches: any[] = [];
  let matchIdCounter = 0;

  pairings.forEach((round, roundIndex) => {
    const match1Players = [players[round[0][0]].id, players[round[0][1]].id, players[round[1][0]].id, players[round[1][1]].id];
    const match2Players = [players[round[2][0]].id, players[round[2][1]].id, players[round[3][0]].id, players[round[3][1]].id];
    
    matches.push({
      id: `m_playing_${matchIdCounter++}`, phase: 'playing', round: roundIndex + 1,
      teamIds: [match1Players.slice(0, 2), match1Players.slice(2, 4)],
      score1: null, score2: null, winnerId: null
    });
    
    matches.push({
      id: `m_playing_${matchIdCounter++}`, phase: 'playing', round: roundIndex + 1,
      teamIds: [match2Players.slice(0, 2), match2Players.slice(2, 4)],
      score1: null, score2: null, winnerId: null
    });
  });

  return matches;
};

const generateDoublesChampionshipMatches = (teams: any[], status: string) => {
  if (status === 'group_stage') {
    return generateDoublesGroupStageMatches(teams);
  }
  // Para fases eliminatórias, reutiliza a lógica genérica
  return { matches: generateEliminationMatches(teams, status), groups: [] };
};

const generateDoublesGroupStageMatches = (teams: any[]) => {
  const shuffledTeams = [...teams].sort(() => Math.random() - 0.5);
  const numTeams = shuffledTeams.length;
  let groupSize = 4;
  let numGroups = Math.ceil(numTeams / groupSize);
  
  if (numTeams % numGroups < 3 && numGroups > 1) {
    groupSize = 3;
    numGroups = Math.ceil(numTeams / groupSize);
  }
  
  const groups: any[] = [];
  for (let i = 0; i < numGroups; i++) {
    groups.push({ id: `g_group_stage_${i}`, name: `Chave ${String.fromCharCode(65 + i)}`, teamIds: [] });
  }
  
  shuffledTeams.forEach((team, index) => {
    groups[index % numGroups].teamIds.push(team.id);
  });

  const matches = generateRoundRobinMatches(groups, 'group_stage');
  return { matches, groups };
};

const generateSuper16ChampionshipMatches = (tournamentData: any) => {
  const { teams, status } = tournamentData;
  
  if (status === 'group_stage') {
    return generateSuper16GroupStageMatches(teams);
  }
  
  // Para fases eliminatórias, qualificados são determinados e passados para a geração dos jogos
  const qualifiedTeams = getQualifiedTeams(tournamentData, status);
  return { matches: generateSuper16EliminationMatches(qualifiedTeams, status, tournamentData), groups: [] };
};

const generateSuper16GroupStageMatches = (teams: any[]) => {
  const shuffledTeams = [...teams].sort(() => Math.random() - 0.5);
  const numTeams = shuffledTeams.length;
  let numGroups = 0;
  const teamsPerGroup = 4;
  
  if (numTeams === 12) { // 24 jogadores = 12 duplas = 3 grupos de 4
    numGroups = 3;
  } else if (numTeams === 16) { // 32 jogadores = 16 duplas = 4 grupos de 4
    numGroups = 4;
  } else {
    throw new Error(`Super 16 requer 12 ou 16 duplas, mas foram fornecidas ${numTeams}.`);
  }
  
  const groups: any[] = [];
  for (let i = 0; i < numGroups; i++) {
    groups.push({ id: `g_group_stage_${i}`, name: `Grupo ${String.fromCharCode(65 + i)}`, teamIds: [] });
  }
  
  shuffledTeams.forEach((team, index) => {
    const groupIndex = Math.floor(index / teamsPerGroup);
    if (groupIndex < numGroups) {
      groups[groupIndex].teamIds.push(team.id);
    }
  });

  const matches = generateRoundRobinMatches(groups, 'group_stage');
  return { matches, groups };
};

const generateSuper16EliminationMatches = (qualifiedTeams: any[], phase: string, tournamentData: any) => {
    let matches: any[] = [];
    let matchIdCounter = 0;

    if (phase === 'quarterfinals') {
        if (qualifiedTeams.length === 8) {
            // Cenário padrão com 8 duplas: quartas de final completas
            return generateEliminationMatches(qualifiedTeams, 'quarterfinals');
        } else if (qualifiedTeams.length === 6) {
            // Cenário com 6 duplas: 2 melhores vão direto para a semi (bye)
            // As outras 4 disputam as 2 vagas restantes
            const teamsInPlayoffs = qualifiedTeams.slice(2); // Pega do 3º ao 6º qualificado
            const pairs = createOlympicCrossing(teamsInPlayoffs); // [3º vs 6º], [4º vs 5º]
            
            pairs.forEach(pair => {
                matches.push({
                    id: `m_quarterfinals_${matchIdCounter++}`,
                    phase: 'quarterfinals',
                    teamIds: [pair[0].id, pair[1].id],
                    score1: null, score2: null, winnerId: null
                });
            });
            return matches;
        }
    } else if (phase === 'semifinals') {
        // Para as semis, precisamos dos vencedores das quartas + os times que tiveram 'bye'
        const semifinalists = getQualifiedTeams(tournamentData, 'semifinals');
        return generateEliminationMatches(semifinalists, 'semifinals');

    } else if (phase === 'final') {
        // A final e a disputa de 3º lugar são geradas da mesma forma
        const finalists = getQualifiedTeams(tournamentData, 'final');
        const thirdPlaceContenders = getQualifiedTeams(tournamentData, 'third_place');
        
        const finalMatches = generateEliminationMatches(finalists, 'final');
        const thirdPlaceMatches = generateEliminationMatches(thirdPlaceContenders, 'third_place');

        return [...finalMatches, ...thirdPlaceMatches];
    }
    
    // Fallback para outros casos
    return generateEliminationMatches(qualifiedTeams, phase);
};

// Lógica genérica para mata-mata
const generateEliminationMatches = (teams: any[], phase: string) => {
  const matches: any[] = [];
  if (!teams || teams.length === 0) return matches;
  let matchIdCounter = 0;

  if (phase === 'final' && teams.length === 2) {
    matches.push({
      id: `m_final_${matchIdCounter++}`, phase: 'final', teamIds: [teams[0].id, teams[1].id],
      score1: null, score2: null, winnerId: null
    });
  } else if (phase === 'third_place' && teams.length === 2) {
    matches.push({
      id: `m_third_place_${matchIdCounter++}`, phase: 'third_place', teamIds: [teams[0].id, teams[1].id],
      score1: null, score2: null, winnerId: null
    });
  } else {
    const pairedTeams = createOlympicCrossing(teams);
    pairedTeams.forEach(pair => {
      matches.push({
        id: `m_${phase}_${matchIdCounter++}`, phase: phase, teamIds: [pair[0].id, pair[1].id],
        score1: null, score2: null, winnerId: null
      });
    });
  }
  return matches;
};

const createOlympicCrossing = (teams: any[]) => {
  const pairs: any[] = [];
  const numTeams = teams.length;
  for (let i = 0; i < numTeams / 2; i++) {
    pairs.push([teams[i], teams[numTeams - 1 - i]]);
  }
  return pairs;
};

const generateKingOfCourtMatches = (teams: any[], phase: string) => {
  if (phase === 'phase1_groups') {
    const groups: any[] = [];
    const shuffledTeams = [...teams].sort(() => Math.random() - 0.5);
    for (let i = 0; i < 4; i++) {
      groups.push({
        id: `g_phase1_groups_${i}`, name: `Grupo ${String.fromCharCode(65 + i)}`,
        teamIds: shuffledTeams.slice(i * 4, (i + 1) * 4).map(t => t.id)
      });
    }
    return generateRoundRobinMatches(groups, 'phase1_groups');
  } else if (phase === 'phase2_playoffs') {
    const groups = [
      { id: 'g_phase2_playoffs_0', name: 'Grupo Semifinal A', teamIds: teams.slice(0, 4).map(t => t.id) },
      { id: 'g_phase2_playoffs_1', name: 'Grupo Semifinal B',  teamIds: teams.slice(4, 8).map(t => t.id) }
    ];
    return generateRoundRobinMatches(groups, 'phase2_playoffs');
  } else if (phase === 'phase3_final') {
    const groups = [{ id: 'g_phase3_final_0', name: 'Grupo Final', teamIds: teams.map(t => t.id) }];
    return generateRoundRobinMatches(groups, 'phase3_final');
  }
  return [];
};

const generateRoundRobinMatches = (groups: any[], phase: string) => {
  const matches: any[] = [];
  let matchIdCounter = 0;
  groups.forEach(group => {
    const teamIds = group.teamIds;
    for (let i = 0; i < teamIds.length; i++) {
      for (let j = i + 1; j < teamIds.length; j++) {
        matches.push({
          id: `m_${phase}_${matchIdCounter++}`, phase: phase, groupId: group.id,
          teamIds: [teamIds[i], teamIds[j]], score1: null, score2: null, winnerId: null
        });
      }
    }
  });
  return matches;
};

export const getQualifiedTeams = (tournamentData: any, phase: string) => {
  const allTeams = tournamentData.teams || [];
  const allMatches = tournamentData.matches || [];

  const getTeamById = (id: string) => allTeams.find(t => t.id === id);
  
  if (phase === 'group_stage' || status === 'registration' || status === 'group_stage') {
    const groups = tournamentData.groups || [];
    const qualifiedTeams: any[] = [];
    
    groups.forEach(group => {
      const groupTeams = group.teamIds.map(getTeamById);
      const groupMatches = allMatches.filter(match => match.groupId === group.id && match.winnerId);
      
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
              team.groupPoints += 3;
              team.groupWins += 1;
            }
          }
        });
      });
      
      groupTeams.sort((a, b) => {
        if (b.groupPoints !== a.groupPoints) return b.groupPoints - a.groupPoints;
        const aDiff = a.groupPointsFor - a.groupPointsAgainst;
        const bDiff = b.groupPointsFor - b.groupPointsAgainst;
        if (bDiff !== aDiff) return bDiff - aDiff;
        return b.groupPointsFor - a.groupPointsFor;
      });
      
      qualifiedTeams.push(...groupTeams.slice(0, 2));
    });
    
    qualifiedTeams.sort((a, b) => {
        if (a.groupName < b.groupName) return -1;
        if (a.groupName > b.groupName) return 1;
        if (b.groupPoints !== a.groupPoints) return b.groupPoints - a.groupPoints;
        const aDiff = a.groupPointsFor - a.groupPointsAgainst;
        const bDiff = b.groupPointsFor - b.groupPointsAgainst;
        if (bDiff !== aDiff) return bDiff - aDiff;
        return b.groupPointsFor - a.groupPointsFor;
    });
    
    return qualifiedTeams;
  }
  
  if (tournamentData.format === 'super16' && phase === 'semifinals') {
    const quarterFinalMatches = allMatches.filter(m => m.phase === 'quarterfinals' && m.winnerId);
    const quarterFinalWinners = quarterFinalMatches.map(m => getTeamById(m.winnerId));
    
    // Se tivemos 6 qualificados, os 2 melhores tiveram 'bye'
    const groupStageQualified = getQualifiedTeams(tournamentData, 'group_stage');
    if (groupStageQualified.length === 6) {
        const teamsWithBye = groupStageQualified.slice(0, 2);
        const semifinalists = [...teamsWithBye, ...quarterFinalWinners];
        
        // Re-ordenar para cruzamento correto (melhor com 'bye' vs pior vencedor, etc.)
        return semifinalists.sort((a, b) => {
            return groupStageQualified.indexOf(a) - groupStageQualified.indexOf(b);
        });
    }
    return quarterFinalWinners; // Se eram 8, só os vencedores
  }

  if (phase === 'final') {
    const semifinalMatches = allMatches.filter(m => m.phase === 'semifinals' && m.winnerId);
    return semifinalMatches.map(m => getTeamById(m.winnerId));
  }

  if (phase === 'third_place') {
    const semifinalMatches = allMatches.filter(m => m.phase === 'semifinals' && m.winnerId);
    const winnerIds = semifinalMatches.map(m => m.winnerId);
    const allSemifinalistIds = semifinalMatches.flatMap(m => m.teamIds);
    const loserIds = allSemifinalistIds.filter(id => !winnerIds.includes(id));
    return loserIds.map(id => getTeamById(id));
  }

  // Fallback genérico para vencedores de uma fase
  const phaseMatches = allMatches.filter(m => m.phase === tournamentData.status && m.winnerId);
  return phaseMatches.map(m => getTeamById(m.winnerId));
};

export const getNextPhase = (currentPhase: string, numQualifiedTeams: number, format: string) => {
  if (currentPhase === 'group_stage') {
    if (format === 'super16') {
        // Para 12 ou 16 duplas, classificam 6 ou 8, respectivamente. Ambas vão para 'quartas'.
        if (numQualifiedTeams === 6 || numQualifiedTeams === 8) return 'quarterfinals';
    }
    // Lógica para outros formatos
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

export const shuffleArray = (array: any[]) => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

// ===================================================================
// NOVA FUNÇÃO CENTRALIZADA
// ===================================================================
/**
 * Obtém o nome de exibição de um participante (jogador ou time).
 * @param participantId - O ID do time, ou um array de IDs de jogadores.
 * @param tournamentData - O objeto completo com os dados do torneio.
 * @returns O nome formatado do participante ou uma mensagem de erro.
 */
export function getParticipantDisplayName(participantId: any, tournamentData: any): string {
  const { players, teams, format } = tournamentData;

  if (!players || !participantId) {
    return 'Participante inválido';
  }

  // Formatos individuais onde o ID é do próprio jogador
  if (format === 'super8' && Array.isArray(participantId)) {
    return participantId.map(pId => players.find((p: any) => p.id === pId)?.name || 'N/A').join(' / ');
  }

  // Formatos de duplas
  if (teams) {
    const team = teams.find((t: any) => t.id === participantId);
    if (team) {
      // Se o time tem `playerIds`, constrói o nome a partir deles (padrão para super16 e doubles_groups)
      if (team.playerIds && team.playerIds.length > 0) {
        return team.playerIds.map((pId: string) => players.find((p: any) => p.id === pId)?.name || 'N/A').join(' / ');
      }
      // Se não, usa o nome do time (pode ser um fallback)
      if (team.name) {
        return team.name;
      }
    }
  }
  
  // Fallback para IDs que não são de time (ex: jogador individual em um formato de duplas antes do sorteio)
  const player = players.find((p: any) => p.id === participantId);
  if (player) {
    return player.name;
  }

  return 'Nome não encontrado';
}