export type Team = 'Alpha' | 'Bravo';

export type UnitStatus = 'idle' | 'moving' | 'attacking' | 'healing' | 'destroyed';

export interface Unit {
  id: string;
  team: Team;
  status: UnitStatus;
  x: number;
  y: number;
  health: number;
  lastAction: string;
}

export interface BattleEvent {
  tick: number;
  type: 'move' | 'attack' | 'heal' | 'destroy';
  unitId: string;
  targetId?: string;
  description: string;
}

export interface DeltaUpdate {
  tick: number;
  changed: Unit[];
  destroyed: string[];
  events: BattleEvent[];
}
