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
  
  // Configuration
  architectModel: text("architect_model").notNull().default("gemini-2.5-flash"),
  minerModel: text("miner_model").notNull().default("gemini-2.5-flash"),
  adjudicatorModel: text("adjudicator_model").notNull().default("gemini-3-pro-preview"),
  formatterModel: text("formatter_model").notNull().default("gemini-2.5-flash"),
  
  apiKey1: text("api_key_1"),
  apiKey2: text("api_key_2"),
  apiKey3: text("api_key_3"),
  apiKey4: text("api_key_4"),
  
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
}).extend({
  architectModel: z.string().optional(),
  minerModel: z.string().optional(),
  adjudicatorModel: z.string().optional(),
  formatterModel: z.string().optional(),
  apiKey1: z.string().optional(),
  apiKey2: z.string().optional(),
  apiKey3: z.string().optional(),
  apiKey4: z.string().optional(),
});

export type Case = typeof cases.$inferSelect;
export type InsertCase = z.infer<typeof insertCaseSchema>;
