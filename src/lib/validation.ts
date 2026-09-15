import { z } from "zod";
const alertBaseSchema = z.object({
  origin: z.string().min(3, "Informe uma origem válida"),
  destinations: z.array(z.string().min(3)).min(1, "Informe ao menos um destino"),
  anyDestination: z.boolean().default(false), startDate: z.coerce.date().optional(), endDate: z.coerce.date().optional(),
  dateMode: z.enum(["SPECIFIC", "RANGE", "MONTH"]), flexibleDates: z.boolean().default(false),
  minDurationDays: z.coerce.number().int().positive().optional(), maxDurationDays: z.coerce.number().int().positive().optional(),
  adults: z.coerce.number().int().min(1), children: z.coerce.number().int().min(0).default(0), infants: z.coerce.number().int().min(0).default(0),
  maxPrice: z.coerce.number().positive("O preço máximo deve ser maior que zero").optional(), currency: z.string().length(3).default("BRL"),
  maxStops: z.coerce.number().int().min(0).max(2).nullable().optional(), airlines: z.array(z.string()).default([]),
  frequency: z.enum(["DAILY", "WEEKLY", "CUSTOM"]).default("DAILY"),
});
export const alertSchema = alertBaseSchema
  .refine((data) => !data.minDurationDays || !data.maxDurationDays || data.maxDurationDays >= data.minDurationDays, { message: "A duração máxima deve ser igual ou maior que a mínima", path: ["maxDurationDays"] })
  .refine((data) => !data.startDate || !data.endDate || data.endDate >= data.startDate, { message: "A data final deve ser igual ou posterior à inicial", path: ["endDate"] });
export const alertUpdateSchema = alertBaseSchema.partial();
export const alertStatusSchema = z.object({ status: z.enum(["ACTIVE", "PAUSED"]) });
export type AlertInput = z.infer<typeof alertSchema>;
