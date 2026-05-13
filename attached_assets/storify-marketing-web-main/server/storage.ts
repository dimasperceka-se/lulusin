import { db } from "./db";
import { waitlist, type InsertWaitlist, type Waitlist } from "@shared/schema";
import { eq } from "drizzle-orm";

export interface IStorage {
  createWaitlist(entry: InsertWaitlist): Promise<Waitlist>;
  getWaitlistByEmail(email: string): Promise<Waitlist | undefined>;
}

export class DatabaseStorage implements IStorage {
  async createWaitlist(insertWaitlist: InsertWaitlist): Promise<Waitlist> {
    const [entry] = await db!
      .insert(waitlist)
      .values(insertWaitlist)
      .returning();
    return entry;
  }

  async getWaitlistByEmail(email: string): Promise<Waitlist | undefined> {
    const [entry] = await db!
      .select()
      .from(waitlist)
      .where(eq(waitlist.email, email));
    return entry;
  }
}

export class MemStorage implements IStorage {
  private entries: Waitlist[] = [];
  private nextId = 1;

  async createWaitlist(insertWaitlist: InsertWaitlist): Promise<Waitlist> {
    const entry: Waitlist = { id: this.nextId++, ...insertWaitlist };
    this.entries.push(entry);
    return entry;
  }

  async getWaitlistByEmail(email: string): Promise<Waitlist | undefined> {
    return this.entries.find((e) => e.email === email);
  }
}

import { pool } from "./db";
export const storage: IStorage = pool ? new DatabaseStorage() : new MemStorage();
