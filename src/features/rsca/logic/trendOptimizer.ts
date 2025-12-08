
/**
 * Determines the recommended target average for a member to ensure a positive trend
 * or prevent inflation for new relationships.
 * 
 * @param priorAvg The prior evaluation average with THIS reporting senior, or null if none.
 * @param seniorRSCA The Reporting Senior's current cumulative average (reference only).
 * @returns The recommended target average (float).
 */
export function getRecommendedAverage(priorAvg: number | null, _seniorRSCA: number): number {
    // Strategy 1: New Relationship -> Prevent Inflation
    // If the sailor has never been evaluated by this senior, we anchor them low/fair.
    // Spec says 3.00.
    if (priorAvg === null) {
        return 3.00;
    }

    // Strategy 2: Existing Relationship -> Force Positive Trend
    // We want to exceed the previous average by the smallest increment (0.01).
    // In practice, since we deal with discrete 1-5 integers over 7 traits,
    // the "next valid average" is a step function. But for the recommendation,
    // we return the mathematical floor + 0.01, and let the traitSolver snap it up.

    // Safety cap: Max 5.00
    if (priorAvg >= 5.00) {
        return 5.00;
    }

    const recommendation = priorAvg + 0.01;
    return Number(recommendation.toFixed(2));
}
