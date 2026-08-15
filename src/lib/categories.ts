/**
 * Data-access helpers for categories.
 * Provides typed, injectable-db functions for querying the categories table.
 */

import { asc } from 'drizzle-orm';
import type { Database } from './db';
import { categories } from '../../db/schema';

type CategorySummary = {
    id: number;
    name: string;
};

/**
 * Retrieves all categories ordered by name.
 * @param db - The Drizzle database instance
 * @returns A promise resolving to an array of categories with id and name
 */
export async function getAllCategories(db: Database): Promise<CategorySummary[]> {
    const rows = await db
        .select({ id: categories.id, name: categories.name })
        .from(categories)
        .orderBy(asc(categories.name));
    return rows;
}
