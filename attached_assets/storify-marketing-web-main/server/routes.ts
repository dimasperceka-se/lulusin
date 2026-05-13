import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  app.post(api.waitlist.create.path, async (req, res) => {
    try {
      const input = api.waitlist.create.input.parse(req.body);
      
      const existing = await storage.getWaitlistByEmail(input.email);
      if (existing) {
        return res.status(400).json({
          message: "Email ini sudah terdaftar di waitlist.",
          field: "email",
        });
      }

      const entry = await storage.createWaitlist(input);
      res.status(201).json(entry);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      return res.status(500).json({ message: "Terjadi kesalahan internal." });
    }
  });

  return httpServer;
}
