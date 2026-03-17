import { Unit, Team } from './types';

const GRID_SIZE = 1000;
const TOTAL_UNITS = 20000;

function generateUnits(): Map<string, Unit> {
  const units = new Map<string, Unit>();

  for (let i = 0; i < TOTAL_UNITS; i++) {
    const team: Team = i < TOTAL_UNITS / 2 ? 'Alpha' : 'Bravo';
    const id = `${team.toLowerCase()}-${i}`;

    units.set(id, {
      id,
      team,
      status: 'idle',
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE),
      health: 100,
      lastAction: 'spawned',
    });
  }

  return units;
}

export const units: Map<string, Unit> = generateUnits();

export function resetUnits(): void {
  const fresh = generateUnits();
  units.clear();
  for (const [id, unit] of fresh) units.set(id, unit);
}

export function getSnapshot(): Unit[] {
  return Array.from(units.values());
}

export function applyDelta(changed: Unit[], destroyed: string[]): void {
  for (const unit of changed) {
    units.set(unit.id, unit);
  }
  for (const id of destroyed) {
    const unit = units.get(id);
    if (unit) {
      units.set(id, { ...unit, status: 'destroyed', health: 0 });
    }
  }
}
