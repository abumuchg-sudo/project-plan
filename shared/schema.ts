import { pgTable, text, serial, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export * from "./models/chat";

export const cases = pgTable("cases", {
  id: serial("id").primaryKey(),
  patientId: text("patient_id").notNull(),
  doctorName: text("doctor_name").notNull(),
  mode: text("mode").notNull(), // 'NEUTRAL' | 'AGGRESSIVE'
  status: text("status").notNull().default("pending"), // pending, processing, completed, error
  originalFileName: text("original_file_name"),
  
  // Agent Outputs
  architectOutput: text("architect_output"), // Extracted data
  minerOutput: text("miner_output"), // Clinical data
  adjudicatorOutput: text("adjudicator_output"), // Legal opinion
  formatterOutput: text("formatter_output"), // Final HTML Report
  
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertCaseSchema = createInsertSchema(cases).omit({ 
  id: true, 
  createdAt: true, 
  status: true,
  architectOutput: true, 
  minerOutput: true, 
  adjudicatorOutput: true, 
  formatterOutput: true 
});

export type Case = typeof cases.$inferSelect;
export type InsertCase = z.infer<typeof insertCaseSchema>;
