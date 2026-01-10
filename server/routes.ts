import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { processCase } from "./agents";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const pdf = require("pdf-parse");
import { z } from "zod";
import { insertCaseSchema } from "@shared/schema";
import { registerChatRoutes } from "./replit_integrations/chat";
import { registerImageRoutes } from "./replit_integrations/image";

const upload = multer({ storage: multer.memoryStorage() });

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // Register Replit AI Integrations
  registerChatRoutes(app);
  registerImageRoutes(app);

  // --- API Routes ---

  app.post(api.cases.create.path, upload.single("file"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      // Parse text from PDF immediately
      let pdfText = "";
      try {
        const data = await pdf(req.file.buffer);
        pdfText = data.text;
      } catch (e) {
        return res.status(400).json({ message: "Failed to parse PDF" });
      }

      // Validate metadata
      // multer puts body fields in req.body
      const metadata = insertCaseSchema.parse({
        doctorName: req.body.doctorName,
        patientId: req.body.patientId,
        mode: req.body.mode,
        originalFileName: req.file.originalname,
        status: "pending"
      });

      const newCase = await storage.createCase(metadata);

      // Start background processing
      processCase(newCase.id, pdfText).catch(err => {
        console.error("Background processing failed:", err);
      });

      res.status(201).json(newCase);
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ message: err.errors[0].message });
      } else {
        console.error(err);
        res.status(500).json({ message: "Internal Server Error" });
      }
    }
  });

  app.get(api.cases.list.path, async (req, res) => {
    const cases = await storage.getCases();
    res.json(cases);
  });

  app.get(api.cases.get.path, async (req, res) => {
    const id = parseInt(req.params.id);
    const caseItem = await storage.getCase(id);
    if (!caseItem) {
      return res.status(404).json({ message: "Case not found" });
    }
    res.json(caseItem);
  });

  return httpServer;
}
