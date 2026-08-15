import { describe, it, expect, beforeEach } from 'vitest';
import { createTestDatabase } from '../../db/test-helpers';
import { categories, publishers, games } from '../../db/schema';
import type { Database } from './db';
import {
    getAllGames,
    getAllGameIds,
    getGameById,
    getGamesByFilters,
    getGameIdsByFilters,
} from './games';

async function seedGames(db: Database, count: number): Promise<void> {
    const [category] = await db
        .insert(categories)
        .values({ name: 'Strategy', description: 'cat' })
        .returning({ id: categories.id });
    const [publisher] = await db
        .insert(publishers)
        .values({ name: 'Pub One', description: 'pub' })
        .returning({ id: publishers.id });

    // Insert titles in reverse-alphabetical order to prove ordering is applied.
    for (let i = count; i >= 1; i--) {
        await db.insert(games).values({
            title: `Game ${String(i).padStart(2, '0')}`,
            description: `Description ${i}`,
            starRating: 4.2,
            categoryId: category.id,
            publisherId: publisher.id,
        });
    }
}

describe('games data-access helpers', () => {
    let db: Database;

    beforeEach(async () => {
        db = await createTestDatabase();
    });

    it('returns all games ordered by title', async () => {
        await seedGames(db, 3);
        const all = await getAllGames(db);
        expect(all.map((g) => g.title)).toEqual(['Game 01', 'Game 02', 'Game 03']);
        expect(all[0].category).toEqual({ id: expect.any(Number), name: 'Strategy' });
        expect(all[0].publisher).toEqual({ id: expect.any(Number), name: 'Pub One' });
    });

    it('returns all game ids ordered by title', async () => {
        await seedGames(db, 3);
        const ids = await getAllGameIds(db);
        const all = await getAllGames(db);
        expect(ids).toEqual(all.map((g) => g.id));
    });

    it('fetches a single game by id', async () => {
        await seedGames(db, 2);
        const ids = await getAllGameIds(db);
        const game = await getGameById(db, ids[0]);
        expect(game?.title).toBe('Game 01');
    });

    it('returns null for a non-existent game', async () => {
        await seedGames(db, 2);
        expect(await getGameById(db, 99999)).toBeNull();
    });

    it('filters games by single category', async () => {
        const category1 = (
            await db
                .insert(categories)
                .values({ name: 'Strategy', description: 'cat' })
                .returning({ id: categories.id })
        )[0];
        const category2 = (
            await db
                .insert(categories)
                .values({ name: 'Action', description: 'cat' })
                .returning({ id: categories.id })
        )[0];
        const publisher = (
            await db
                .insert(publishers)
                .values({ name: 'Pub One', description: 'pub' })
                .returning({ id: publishers.id })
        )[0];

        await db.insert(games).values([
            {
                title: 'Game 01',
                description: 'Description 1',
                starRating: 4.2,
                categoryId: category1.id,
                publisherId: publisher.id,
            },
            {
                title: 'Game 02',
                description: 'Description 2',
                starRating: 3.8,
                categoryId: category2.id,
                publisherId: publisher.id,
            },
            {
                title: 'Game 03',
                description: 'Description 3',
                starRating: 4.5,
                categoryId: category1.id,
                publisherId: publisher.id,
            },
        ]);

        const filtered = await getGamesByFilters(db, [category1.id]);
        expect(filtered.map((g) => g.title)).toEqual(['Game 01', 'Game 03']);
        expect(filtered.every((g) => g.category?.id === category1.id)).toBe(true);
    });

    it('filters games by multiple categories', async () => {
        const category1 = (
            await db
                .insert(categories)
                .values({ name: 'Strategy', description: 'cat' })
                .returning({ id: categories.id })
        )[0];
        const category2 = (
            await db
                .insert(categories)
                .values({ name: 'Action', description: 'cat' })
                .returning({ id: categories.id })
        )[0];
        const category3 = (
            await db
                .insert(categories)
                .values({ name: 'Puzzle', description: 'cat' })
                .returning({ id: categories.id })
        )[0];
        const publisher = (
            await db
                .insert(publishers)
                .values({ name: 'Pub One', description: 'pub' })
                .returning({ id: publishers.id })
        )[0];

        await db.insert(games).values([
            {
                title: 'Game 01',
                description: 'Description 1',
                starRating: 4.2,
                categoryId: category1.id,
                publisherId: publisher.id,
            },
            {
                title: 'Game 02',
                description: 'Description 2',
                starRating: 3.8,
                categoryId: category2.id,
                publisherId: publisher.id,
            },
            {
                title: 'Game 03',
                description: 'Description 3',
                starRating: 4.5,
                categoryId: category3.id,
                publisherId: publisher.id,
            },
        ]);

        const filtered = await getGamesByFilters(db, [category1.id, category2.id]);
        expect(filtered.map((g) => g.title)).toEqual(['Game 01', 'Game 02']);
    });

    it('filters games by single publisher', async () => {
        const category = (
            await db
                .insert(categories)
                .values({ name: 'Strategy', description: 'cat' })
                .returning({ id: categories.id })
        )[0];
        const publisher1 = (
            await db
                .insert(publishers)
                .values({ name: 'Pub One', description: 'pub' })
                .returning({ id: publishers.id })
        )[0];
        const publisher2 = (
            await db
                .insert(publishers)
                .values({ name: 'Pub Two', description: 'pub' })
                .returning({ id: publishers.id })
        )[0];

        await db.insert(games).values([
            {
                title: 'Game 01',
                description: 'Description 1',
                starRating: 4.2,
                categoryId: category.id,
                publisherId: publisher1.id,
            },
            {
                title: 'Game 02',
                description: 'Description 2',
                starRating: 3.8,
                categoryId: category.id,
                publisherId: publisher2.id,
            },
            {
                title: 'Game 03',
                description: 'Description 3',
                starRating: 4.5,
                categoryId: category.id,
                publisherId: publisher1.id,
            },
        ]);

        const filtered = await getGamesByFilters(db, undefined, [publisher1.id]);
        expect(filtered.map((g) => g.title)).toEqual(['Game 01', 'Game 03']);
        expect(filtered.every((g) => g.publisher?.id === publisher1.id)).toBe(true);
    });

    it('filters games by combined category and publisher filters', async () => {
        const category1 = (
            await db
                .insert(categories)
                .values({ name: 'Strategy', description: 'cat' })
                .returning({ id: categories.id })
        )[0];
        const category2 = (
            await db
                .insert(categories)
                .values({ name: 'Action', description: 'cat' })
                .returning({ id: categories.id })
        )[0];
        const publisher1 = (
            await db
                .insert(publishers)
                .values({ name: 'Pub One', description: 'pub' })
                .returning({ id: publishers.id })
        )[0];
        const publisher2 = (
            await db
                .insert(publishers)
                .values({ name: 'Pub Two', description: 'pub' })
                .returning({ id: publishers.id })
        )[0];

        await db.insert(games).values([
            {
                title: 'Game 01',
                description: 'Description 1',
                starRating: 4.2,
                categoryId: category1.id,
                publisherId: publisher1.id,
            },
            {
                title: 'Game 02',
                description: 'Description 2',
                starRating: 3.8,
                categoryId: category2.id,
                publisherId: publisher1.id,
            },
            {
                title: 'Game 03',
                description: 'Description 3',
                starRating: 4.5,
                categoryId: category1.id,
                publisherId: publisher2.id,
            },
        ]);

        const filtered = await getGamesByFilters(
            db,
            [category1.id],
            [publisher1.id]
        );
        expect(filtered.map((g) => g.title)).toEqual(['Game 01']);
    });

    it('returns all games when filters are empty', async () => {
        await seedGames(db, 3);
        const filtered = await getGamesByFilters(db);
        expect(filtered.map((g) => g.title)).toEqual(['Game 01', 'Game 02', 'Game 03']);
    });

    it('returns empty array when no games match filters', async () => {
        const category = (
            await db
                .insert(categories)
                .values({ name: 'Strategy', description: 'cat' })
                .returning({ id: categories.id })
        )[0];
        const publisher = (
            await db
                .insert(publishers)
                .values({ name: 'Pub One', description: 'pub' })
                .returning({ id: publishers.id })
        )[0];

        await db.insert(games).values({
            title: 'Game 01',
            description: 'Description 1',
            starRating: 4.2,
            categoryId: category.id,
            publisherId: publisher.id,
        });

        const filtered = await getGamesByFilters(db, [9999]);
        expect(filtered).toEqual([]);
    });

    it('returns filtered game ids by category', async () => {
        const category1 = (
            await db
                .insert(categories)
                .values({ name: 'Strategy', description: 'cat' })
                .returning({ id: categories.id })
        )[0];
        const category2 = (
            await db
                .insert(categories)
                .values({ name: 'Action', description: 'cat' })
                .returning({ id: categories.id })
        )[0];
        const publisher = (
            await db
                .insert(publishers)
                .values({ name: 'Pub One', description: 'pub' })
                .returning({ id: publishers.id })
        )[0];

        const game1 = (
            await db
                .insert(games)
                .values({
                    title: 'Game 01',
                    description: 'Description 1',
                    starRating: 4.2,
                    categoryId: category1.id,
                    publisherId: publisher.id,
                })
                .returning({ id: games.id })
        )[0];
        await db.insert(games).values({
            title: 'Game 02',
            description: 'Description 2',
            starRating: 3.8,
            categoryId: category2.id,
            publisherId: publisher.id,
        });

        const ids = await getGameIdsByFilters(db, [category1.id]);
        expect(ids).toEqual([game1.id]);
    });
});
