/**
 * Data-access helpers for publishers.
 * Provides typed, injectable-db functions for querying the publishers table.
 */

import { asc } from 'drizzle-orm';
import type { Database } from './db';
import { publishers } from '../../db/schema';

type PublisherSummary = {
    id: number;
    name: string;
};

/**
 * Retrieves all publishers ordered by name.
 * @param db - The Drizzle database instance
 * @returns A promise resolving to an array of publishers with id and name
 */
export async function getAllPublishers(db: Database): Promise<PublisherSummary[]> {
    const rows = await db
        .select({ id: publishers.id, name: publishers.name })
        .from(publishers)
        .orderBy(asc(publishers.name));
    return rows;
}
