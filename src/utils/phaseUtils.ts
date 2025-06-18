import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  UserPlus, 
  LayoutGrid, 
  Shield, 
  Swords, 
  Crown, 
  Medal, 
  CheckCircle,
  Icon as LucideIcon // Importação genérica para o tipo
} from 'lucide-react';

// Função para obter o título da fase
export const getPhaseTitle = (phase: string): string => {
  switch (phase) {
    case 'registration':
      return 'Cadastro';
    case 'teams_defined':
        return 'Definição de Duplas';
    case 'group_stage':
    case 'phase1_groups':
      return 'Fase de Grupos';
    case 'phase2_playoffs':
        return 'Playoffs'
    case 'round_of_16':
      return 'Oitavas de Final';
    case 'quarterfinals':
      return 'Quartas de Final';
    case 'semifinals':
      return 'Semifinais';
    case 'final':
      return 'Final';
    case 'third_place':
        return 'Disputa de 3º Lugar'
    case 'finished':
      return 'Finalizado';
    default:
      return 'Fase Desconhecida';
  }
};

// NOVA FUNÇÃO: Retorna o ícone correspondente à fase
export const getPhaseIcon = (phase: string): LucideIcon => {
    switch (phase) {
      case 'registration':
        return UserPlus;
      case 'teams_defined':
        return Users;
      case 'group_stage':
      case 'phase1_groups':
      case 'phase2_playoffs':
        return LayoutGrid;
      case 'round_of_16':
      case 'quarterfinals':
        return Shield;
      case 'semifinals':
        return Swords;
      case 'final':
        return Crown;
      case 'third_place':
        return Medal;
      case 'finished':
        return CheckCircle;
      default:
        return Users; // Ícone padrão
    }
};

// Função para o estilo do badge (opcional, mas bom ter)
export const getPhaseBadgeVariant = (phase: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (phase) {
        case 'registration':
        case 'teams_defined':
          return 'secondary';
        case 'finished':
          return 'default';
        case 'final':
        case 'third_place':
          return 'destructive'
        default:
          return 'outline';
      }
}