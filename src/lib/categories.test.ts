import { describe, it, expect, beforeEach } from 'vitest';
import { createTestDatabase } from '../../db/test-helpers';
import { categories } from '../../db/schema';
import type { Database } from './db';
import { getAllCategories } from './categories';

describe('categories data-access helpers', () => {
    let db: Database;

    beforeEach(async () => {
        db = await createTestDatabase();
    });

    it('returns all categories ordered by name', async () => {
        await db.insert(categories).values([
            { name: 'Puzzle', description: 'Puzzle games' },
            { name: 'Action', description: 'Action games' },
            { name: 'Strategy', description: 'Strategy games' },
        ]);

        const result = await getAllCategories(db);
        expect(result.map((c) => c.name)).toEqual(['Action', 'Puzzle', 'Strategy']);
    });

    it('returns id and name for each category', async () => {
        const inserted = await db
            .insert(categories)
            .values({ name: 'RPG', description: 'RPG games' })
            .returning({ id: categories.id });

        const result = await getAllCategories(db);
        expect(result).toContainEqual({
            id: inserted[0].id,
            name: 'RPG',
        });
    });

    it('returns empty array when no categories exist', async () => {
        const result = await getAllCategories(db);
        expect(result).toEqual([]);
    });
});
