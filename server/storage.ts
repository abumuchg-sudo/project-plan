import { db } from "./db";
import { cases, type InsertCase, type Case } from "@shared/schema";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  createCase(data: InsertCase): Promise<Case>;
  getCase(id: number): Promise<Case | undefined>;
  getCases(): Promise<Case[]>;
  updateCase(id: number, data: Partial<Case>): Promise<Case>;
}

export class DatabaseStorage implements IStorage {
  async createCase(data: InsertCase): Promise<Case> {
    const [newCase] = await db.insert(cases).values(data).returning();
    return newCase;
  }

  async getCase(id: number): Promise<Case | undefined> {
    const [found] = await db.select().from(cases).where(eq(cases.id, id));
    return found;
  }

  async getCases(): Promise<Case[]> {
    return db.select().from(cases).orderBy(desc(cases.createdAt));
  }

  async updateCase(id: number, data: Partial<Case>): Promise<Case> {
    const [updated] = await db.update(cases).set(data).where(eq(cases.id, id)).returning();
    return updated;
  }
}

export const storage = new DatabaseStorage();
