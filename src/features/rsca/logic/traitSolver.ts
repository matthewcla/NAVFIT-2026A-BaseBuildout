
export interface TraitConfiguration {
    t1: number;
    t2: number;
    t3: number;
    t4: number;
    t5: number;
    t6: number;
    t7: number;
}

export interface SolverResult {
    success: boolean;
    traits: TraitConfiguration;
    actualAverage: number;
    message?: string;
}

/**
 * Reverse-calculates integer traits to achieve a target average.
 * 
 * @param targetAvg The desired average (e.g. 3.80)
 * @param nobVector Boolean array [t1_nob, ..., t7_nob]. True means NOB (ignored).
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
    // This prevents generating 2s or 1s for a "good" sailor just to hit a precise math average,
    // unless the target itself implies a bad report.
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

    // If pointsNeeded is negative (e.g. target 2.0 but floor 3 forced 3.0),
    // we might need to reduce. But our requirement says "If Target >= 3.0, no generated trait can be < 3".
    // So if Target >= 3.0, we stick with the floor, even if it exceeds the target.
    // Example: Target 2.8, Floor 1. we iterate up.
    // Example: Target 3.2, Floor 3. We iterate up.
    // Example: Target 2.9 (Floor 1). We iterate up.

    // However, if we overshoot because of the floor (Target 2.5, but we decided Floor 3? No, logic says target < 3 -> floor 1).
    // So usually pointsNeeded >= 0 given the floor definitions.

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

        // Safety break if infinite (should be impossible due to maxPoints cap)
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

function createTraitConfig(values: number[]): TraitConfiguration {
    return {
        t1: values[0],
        t2: values[1],
        t3: values[2],
        t4: values[3],
        t5: values[4],
        t6: values[5],
        t7: values[6],
    };
}

function isAllMaxed(values: number[], indices: number[]): boolean {
    return indices.every(idx => values[idx] >= 5);
}
