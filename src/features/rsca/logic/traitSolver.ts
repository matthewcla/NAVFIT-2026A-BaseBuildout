import type { PerformanceTraits } from '../../../store/reportsSlice';

export interface SolverResult {
    success: boolean;
    traits: PerformanceTraits;
    actualAverage: number;
    message?: string;
}

/**
 * Reverse-calculates integer traits to achieve a target average.
 * 
 * @param targetAvg The desired average (e.g. 3.80)
 * @param nobVector Boolean array [t1, ..., t7]. True means NOB (ignored).
 *                  Order: Prof, Cmd, Mil, Char, Team, Lead, EqOpp.
 * @returns SolverResult containing the calculated traits and realized average.
 */
export function solveTraits(targetAvg: number, nobVector: boolean[]): SolverResult {
    // 1. Determine Active Traits
    const totalTraits = 7;
    const activeIndices: number[] = [];

    for (let i = 0; i < totalTraits; i++) {
        // If nobVector[i] is defined and true, it's NOB. Otherwise active.
        if (!nobVector[i]) {
            activeIndices.push(i);
        }
    }

    const activeCount = activeIndices.length;

    // Edge Case: All NOB
    if (activeCount === 0) {
        return {
            success: true,
            traits: createTraitConfig([0, 0, 0, 0, 0, 0, 0]),
            actualAverage: 0,
            message: "All traits are NOB."
        };
    }

    // 2. Calculate Required Points
    // We strictly round to nearest integer to get the closest possible average.
    let requiredPoints = Math.round(targetAvg * activeCount);

    // Bounds Check: Min 1 * Count, Max 5 * Count
    const minPoints = activeCount * 1;
    const maxPoints = activeCount * 5;

    // If target is physically impossible (e.g. 6.0), clamp it.
    if (requiredPoints > maxPoints) requiredPoints = maxPoints;
    if (requiredPoints < minPoints) requiredPoints = minPoints;

    // 3. Floor Strategy
    // Requirements: If Target >= 3.0, floor is 3. Else 1.
    const floorValue = targetAvg >= 3.0 ? 3 : 1;

    // Initialize traits with floor value
    const traitValues = new Array(totalTraits).fill(0); // Default 0 for NOB
    let currentPoints = 0;

    activeIndices.forEach(idx => {
        traitValues[idx] = floorValue;
        currentPoints += floorValue;
    });

    // 4. Distribute Remaining Points
    let pointsNeeded = requiredPoints - currentPoints;

    // Pass 1: Simple distribution
    let activeIdxPointer = 0;
    while (pointsNeeded > 0) {
        const traitIdx = activeIndices[activeIdxPointer];

        if (traitValues[traitIdx] < 5) {
            traitValues[traitIdx]++;
            pointsNeeded--;
        }

        // Move pointer, wrap around
        activeIdxPointer = (activeIdxPointer + 1) % activeCount;

        // Safety break if infinite
        if (pointsNeeded > 0 && isAllMaxed(traitValues, activeIndices)) {
            break;
        }
    }

    // 5. Final Calculation
    const finalTotal = activeIndices.reduce((sum, idx) => sum + traitValues[idx], 0);
    const actualAvg = Number((finalTotal / activeCount).toFixed(2));

    return {
        success: true,
        traits: createTraitConfig(traitValues),
        actualAverage: actualAvg,
        message: actualAvg !== targetAvg ? `Adjusted to nearest valid average (${actualAvg})` : undefined
    };
}

function createTraitConfig(values: number[]): PerformanceTraits {
    // Map array index to correct keys based on reportsSlice definition Order
    // Blk 33 (0) -> professionalKnowledge
    // Blk 34 (1) -> commandClimate
    // Blk 35 (2) -> militaryBearing
    // Blk 36 (3) -> character
    // Blk 37 (4) -> teamwork
    // Blk 38 (5) -> leadership
    // Blk 39 (6) -> equalOpportunity

    return {
        professionalKnowledge: values[0],
        commandClimate: values[1],
        militaryBearing: values[2],
        character: values[3],
        teamwork: values[4],
        leadership: values[5],
        equalOpportunity: values[6],
    };
}

function isAllMaxed(values: number[], indices: number[]): boolean {
    return indices.every(idx => values[idx] >= 5);
}
