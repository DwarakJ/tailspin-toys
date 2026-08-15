import { eq, asc, and, inArray } from 'drizzle-orm';
import type { Database } from './db';
import { games, categories, publishers } from '../../db/schema';
import type { Game } from '../types/game';

const gameSelection = {
    id: games.id,
    title: games.title,
    description: games.description,
    starRating: games.starRating,
    categoryId: categories.id,
    categoryName: categories.name,
    publisherId: publishers.id,
    publisherName: publishers.name,
};

type GameSelectionRow = {
    id: number;
    title: string;
    description: string;
    starRating: number | null;
    categoryId: number | null;
    categoryName: string | null;
    publisherId: number | null;
    publisherName: string | null;
};

function mapGame(row: GameSelectionRow): Game {
    return {
        id: row.id,
        title: row.title,
        description: row.description,
        starRating: row.starRating,
        category:
            row.categoryId !== null && row.categoryName !== null
                ? { id: row.categoryId, name: row.categoryName }
                : null,
        publisher:
            row.publisherId !== null && row.publisherName !== null
                ? { id: row.publisherId, name: row.publisherName }
                : null,
    };
}

function baseGamesQuery(db: Database) {
    return db
        .select(gameSelection)
        .from(games)
        .leftJoin(categories, eq(games.categoryId, categories.id))
        .leftJoin(publishers, eq(games.publisherId, publishers.id));
}

/** All games ordered by title. */
export async function getAllGames(db: Database): Promise<Game[]> {
    const rows = await baseGamesQuery(db).orderBy(asc(games.title));
    return rows.map(mapGame);
}

/** All game ids ordered by title. */
export async function getAllGameIds(db: Database): Promise<number[]> {
    const rows = await db.select({ id: games.id }).from(games).orderBy(asc(games.title));
    return rows.map((row) => row.id);
}

/** A single game by id, or null when it does not exist. */
export async function getGameById(db: Database, id: number): Promise<Game | null> {
    const row = await baseGamesQuery(db).where(eq(games.id, id)).get();
    return row ? mapGame(row) : null;
}

/**
 * Retrieves games filtered by optional category and publisher IDs, ordered by title.
 * @param db - The Drizzle database instance
 * @param categoryIds - Optional array of category IDs to filter by
 * @param publisherIds - Optional array of publisher IDs to filter by
 * @returns A promise resolving to an array of games matching the filters
 */
export async function getGamesByFilters(
    db: Database,
    categoryIds?: number[],
    publisherIds?: number[]
): Promise<Game[]> {
    const query = baseGamesQuery(db);
    const conditions = [];

    if (categoryIds && categoryIds.length > 0) {
        conditions.push(inArray(games.categoryId, categoryIds));
    }

    if (publisherIds && publisherIds.length > 0) {
        conditions.push(inArray(games.publisherId, publisherIds));
    }

    const filteredQuery = conditions.length > 0 ? query.where(and(...conditions)) : query;
    const rows = await filteredQuery.orderBy(asc(games.title));
    return rows.map(mapGame);
}

/**
 * Retrieves game IDs filtered by optional category and publisher IDs, ordered by title.
 * @param db - The Drizzle database instance
 * @param categoryIds - Optional array of category IDs to filter by
 * @param publisherIds - Optional array of publisher IDs to filter by
 * @returns A promise resolving to an array of game IDs matching the filters
 */
export async function getGameIdsByFilters(
    db: Database,
    categoryIds?: number[],
    publisherIds?: number[]
): Promise<number[]> {
    let query = db.select({ id: games.id }).from(games);
    const conditions = [];

    if (categoryIds && categoryIds.length > 0) {
        conditions.push(inArray(games.categoryId, categoryIds));
    }

    if (publisherIds && publisherIds.length > 0) {
        conditions.push(inArray(games.publisherId, publisherIds));
    }

    if (conditions.length > 0) {
        query = query.where(and(...conditions));
    }

    const rows = await query.orderBy(asc(games.title));
    return rows.map((row) => row.id);
}
