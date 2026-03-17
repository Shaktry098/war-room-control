import { Unit, BattleEvent, DeltaUpdate } from './types';
import { units, applyDelta } from './state';

let tick = 0;
let onDelta: ((delta: DeltaUpdate) => void) | null = null;
let currentInterval: ReturnType<typeof setInterval> | null = null;

export function setDeltaHandler(handler: (delta: DeltaUpdate) => void): void {
  onDelta = handler;
}

function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function runTick(): void {
  tick++;
  const allUnits = Array.from(units.values());
  const alive = allUnits.filter(u => u.status !== 'destroyed');

  if (alive.length === 0) return;

  // Track health changes within this tick so damage accumulates correctly
  const healthMap = new Map<string, number>();
  for (const u of alive) healthMap.set(u.id, u.health);

  const countPerTeam = randomBetween(200, 300);
  const alphaAlive = alive.filter(u => u.team === 'Alpha');
  const bravoAlive = alive.filter(u => u.team === 'Bravo');
  const selectedAlpha = alphaAlive.sort(() => Math.random() - 0.5).slice(0, countPerTeam);
  const selectedBravo = bravoAlive.sort(() => Math.random() - 0.5).slice(0, countPerTeam);
  const selected = [...selectedAlpha, ...selectedBravo];

  const changedMap = new Map<string, Unit>();
  const destroyedSet = new Set<string>();
  const events: BattleEvent[] = [];

  for (const unit of selected) {
    if (destroyedSet.has(unit.id)) continue;

    const roll = Math.random();

    if (roll < 0.35) {
      // Move
      const dx = randomBetween(-10, 10);
      const dy = randomBetween(-10, 10);
      changedMap.set(unit.id, {
        ...unit,
        status: 'moving',
        x: clamp(unit.x + dx, 0, 1000),
        y: clamp(unit.y + dy, 0, 1000),
        lastAction: 'moved',
      });

    } else if (roll < 0.80) {
      // Attack nearest living enemy
      const enemies = alive.filter(u => u.team !== unit.team && !destroyedSet.has(u.id));
      if (enemies.length === 0) continue;

      const target = enemies.reduce((nearest, candidate) => {
        const dA = Math.hypot(candidate.x - unit.x, candidate.y - unit.y);
        const dB = Math.hypot(nearest.x - unit.x, nearest.y - unit.y);
        return dA < dB ? candidate : nearest;
      });

      const damage = randomBetween(10, 25);
      const currentHealth = healthMap.get(target.id) ?? target.health;
      const newHealth = currentHealth - damage;

      changedMap.set(unit.id, { ...unit, status: 'attacking', lastAction: `attacked ${target.id}` });
      healthMap.set(target.id, newHealth);

      if (newHealth <= 0) {
        destroyedSet.add(target.id);
        events.push({ tick, type: 'destroy', unitId: target.id, targetId: unit.id, description: `${target.id} destroyed by ${unit.id}` });
      } else {
        changedMap.set(target.id, { ...(changedMap.get(target.id) ?? target), health: newHealth, lastAction: `hit by ${unit.id}` });
        events.push({ tick, type: 'attack', unitId: unit.id, targetId: target.id, description: `${unit.id} attacked ${target.id} for ${damage}` });
      }

    } else {
      // Heal
      const currentHealth = healthMap.get(unit.id) ?? unit.health;
      const newHealth = clamp(currentHealth + randomBetween(3, 7), 0, 100);
      healthMap.set(unit.id, newHealth);
      changedMap.set(unit.id, { ...unit, status: 'healing', health: newHealth, lastAction: `healed to ${newHealth}` });
      events.push({ tick, type: 'heal', unitId: unit.id, description: `${unit.id} healed to ${newHealth}` });
    }
  }

  const changed = Array.from(changedMap.values());
  const destroyed = Array.from(destroyedSet);

  applyDelta(changed, destroyed);

  const delta: DeltaUpdate = { tick, changed, destroyed, events };
  console.log(`Tick ${tick}: ${changed.length} changed, ${destroyed.length} destroyed`);

  if (onDelta) onDelta(delta);
}

export function resetSimulation(): void {
  if (currentInterval) clearInterval(currentInterval);
  currentInterval = null;
  tick = 0;
}

export function startSimulation(): void {
  if (currentInterval) clearInterval(currentInterval);
  const interval = setInterval(() => {
    const allUnits = Array.from(units.values());
    const alphaAlive = allUnits.filter(u => u.team === 'Alpha' && u.status !== 'destroyed').length;
    const bravoAlive = allUnits.filter(u => u.team === 'Bravo' && u.status !== 'destroyed').length;

    if (alphaAlive === 0 || bravoAlive === 0) {
      clearInterval(interval);
      const winner = alphaAlive > 0 ? 'Alpha' : 'Bravo';
      console.log(`Game over! ${winner} wins at tick ${tick}`);
      if (onDelta) onDelta({ tick, changed: [], destroyed: [], events: [{ tick, type: 'destroy', unitId: 'game', description: `GAME_OVER:${winner}` }] });
      return;
    }

    runTick();
  }, 1000);
  currentInterval = interval;
  console.log('Battle simulation started');
}
