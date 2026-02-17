var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/index-prod.ts
import fs from "node:fs";
import path from "node:path";
import express2 from "express";

// server/app.ts
import express from "express";

// server/routes.ts
import { createServer } from "node:http";

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  academicCycles: () => academicCycles,
  auditLogs: () => auditLogs,
  auditLogsRelations: () => auditLogsRelations,
  capabilities: () => capabilities,
  changes: () => changes,
  criteria: () => criteria,
  criteriaRelations: () => criteriaRelations,
  evaluationItems: () => evaluationItems,
  evaluationItemsRelations: () => evaluationItemsRelations,
  indicators: () => indicators,
  indicatorsRelations: () => indicatorsRelations,
  insertAcademicCycleSchema: () => insertAcademicCycleSchema,
  insertCapabilitySchema: () => insertCapabilitySchema,
  insertChangeSchema: () => insertChangeSchema,
  insertCriteriaSchema: () => insertCriteriaSchema,
  insertEvaluationItemSchema: () => insertEvaluationItemSchema,
  insertIndicatorSchema: () => insertIndicatorSchema,
  insertNotificationSchema: () => insertNotificationSchema,
  insertPerformanceStandardSchema: () => insertPerformanceStandardSchema,
  insertSignatureSchema: () => insertSignatureSchema,
  insertStrategySchema: () => insertStrategySchema,
  insertTeacherWitnessSchema: () => insertTeacherWitnessSchema,
  insertUserSchema: () => insertUserSchema,
  insertUserStrategySchema: () => insertUserStrategySchema,
  insertWitnessFileSchema: () => insertWitnessFileSchema,
  insertWitnessSchema: () => insertWitnessSchema,
  notifications: () => notifications,
  notificationsRelations: () => notificationsRelations,
  performanceStandards: () => performanceStandards,
  selectAcademicCycleSchema: () => selectAcademicCycleSchema,
  selectNotificationSchema: () => selectNotificationSchema,
  selectPerformanceStandardSchema: () => selectPerformanceStandardSchema,
  sessions: () => sessions,
  signatures: () => signatures,
  signaturesRelations: () => signaturesRelations,
  strategies: () => strategies,
  strategiesRelations: () => strategiesRelations,
  teacherWitnesses: () => teacherWitnesses,
  teacherWitnessesRelations: () => teacherWitnessesRelations,
  userStrategies: () => userStrategies,
  userStrategiesRelations: () => userStrategiesRelations,
  users: () => users,
  usersRelations: () => usersRelations,
  witnessFiles: () => witnessFiles,
  witnessFilesRelations: () => witnessFilesRelations,
  witnesses: () => witnesses,
  witnessesRelations: () => witnessesRelations
});
import { sql } from "drizzle-orm";
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  boolean,
  serial
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";
var sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull()
  },
  (table) => [index("IDX_session_expire").on(table.expire)]
);
var users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  fullNameArabic: text("full_name_arabic"),
  profileImageUrl: varchar("profile_image_url"),
  password: varchar("password"),
  role: varchar("role", { length: 50 }).default("teacher"),
  // creator, admin, supervisor, teacher
  jobNumber: text("job_number"),
  specialization: text("specialization"),
  educationalLevel: varchar("educational_level", { length: 50 }).default("\u0645\u0639\u0644\u0645"),
  // معلم, معلم ممارس, معلم متقدم, معلم خبير
  schoolName: varchar("school_name"),
  educationDepartment: varchar("education_department"),
  subject: varchar("subject"),
  principalName: varchar("principal_name"),
  yearsOfService: integer("years_of_service"),
  contactEmail: varchar("contact_email"),
  mobileNumber: text("mobile_number").unique(),
  nationalId: varchar("national_id", { length: 20 }).unique(),
  onboardingCompleted: boolean("onboarding_completed").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var indicators = pgTable("indicators", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  type: varchar("type", { length: 20 }).default("goal"),
  // goal = هدف, competency = جدارة
  weight: integer("weight").default(0),
  // 1-100
  domain: varchar("domain", { length: 50 }),
  // values = قيم, knowledge = معرفة, practice = ممارسة (for competencies)
  targetOutput: text("target_output"),
  // المخرج المستهدف (for goals)
  status: varchar("status", { length: 50 }).default("pending"),
  // pending, in_progress, completed
  witnessCount: integer("witness_count").default(0),
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }),
  academicCycleId: integer("academic_cycle_id").references(() => academicCycles.id),
  order: integer("order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var criteria = pgTable("criteria", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  indicatorId: varchar("indicator_id").references(() => indicators.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }).notNull(),
  isCompleted: boolean("is_completed").default(false),
  order: integer("order").default(0),
  createdAt: timestamp("created_at").defaultNow()
});
var witnesses = pgTable("witnesses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  indicatorId: varchar("indicator_id").references(() => indicators.id, { onDelete: "cascade" }),
  criteriaId: varchar("criteria_id").references(() => criteria.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  fileUrl: text("file_url"),
  // Changed to text for Base64 support
  link: text("link"),
  fileType: varchar("file_type", { length: 50 }),
  // pdf, image, video, document
  fileName: varchar("file_name"),
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow()
});
var strategies = pgTable("strategies", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow()
});
var userStrategies = pgTable("user_strategies", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }),
  strategyId: varchar("strategy_id").references(() => strategies.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow()
});
var capabilities = pgTable("capabilities", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  category: varchar("category", { length: 100 }),
  order: integer("order").default(0),
  createdAt: timestamp("created_at").defaultNow()
});
var changes = pgTable("changes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  category: varchar("category", { length: 100 }),
  order: integer("order").default(0),
  createdAt: timestamp("created_at").defaultNow()
});
var signatures = pgTable("signatures", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  indicatorId: varchar("indicator_id").references(() => indicators.id, { onDelete: "cascade" }),
  teacherId: varchar("teacher_id").references(() => users.id, { onDelete: "cascade" }),
  principalId: varchar("principal_id").references(() => users.id, { onDelete: "set null" }),
  academicCycleId: integer("academic_cycle_id").references(() => academicCycles.id),
  status: varchar("status", { length: 20 }).default("pending"),
  // pending, approved, rejected
  notes: text("notes"),
  submittedAt: timestamp("submitted_at").defaultNow(),
  signedAt: timestamp("signed_at"),
  createdAt: timestamp("created_at").defaultNow()
});
var academicCycles = pgTable("academic_cycles", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  isActive: boolean("is_active").default(false).notNull(),
  isLocked: boolean("is_locked").default(false).notNull()
});
var auditLogs = pgTable("audit_logs", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  action: text("action").notNull(),
  entityType: text("entity_type").notNull(),
  entityId: varchar("entity_id"),
  details: jsonb("details"),
  ipAddress: text("ip_address"),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  recipientId: varchar("recipient_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  // 'info', 'success', 'warning', 'error'
  title: text("title").notNull(),
  message: text("message").notNull(),
  link: text("link"),
  isRead: boolean("is_read").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var auditLogsRelations = relations(auditLogs, ({ one }) => ({
  user: one(users, { fields: [auditLogs.userId], references: [users.id] })
}));
var notificationsRelations = relations(notifications, ({ one }) => ({
  recipient: one(users, { fields: [notifications.recipientId], references: [users.id] })
}));
var insertAcademicCycleSchema = createInsertSchema(academicCycles).omit({ id: true });
var selectAcademicCycleSchema = createInsertSchema(academicCycles);
var insertNotificationSchema = createInsertSchema(notifications).omit({ id: true, createdAt: true, isRead: true });
var selectNotificationSchema = createInsertSchema(notifications);
var performanceStandards = pgTable("performance_standards", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  weight: text("weight").notNull(),
  description: text("description").notNull(),
  suggestedEvidence: jsonb("suggested_evidence").$type().notNull(),
  icon: text("icon").notNull(),
  order: integer("order").notNull()
});
var insertPerformanceStandardSchema = createInsertSchema(performanceStandards).omit({ id: true });
var selectPerformanceStandardSchema = createInsertSchema(performanceStandards);
var evaluationItems = pgTable("evaluation_items", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  weight: text("weight").notNull(),
  description: text("description").notNull(),
  icon: text("icon").notNull(),
  suggestedEvidence: jsonb("suggested_evidence").$type().notNull(),
  examples: jsonb("examples").$type().notNull(),
  order: integer("order").notNull()
});
var teacherWitnesses = pgTable("teacher_witnesses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }),
  evaluationItemId: integer("evaluation_item_id").references(() => evaluationItems.id),
  title: text("title").notNull(),
  description: text("description"),
  type: varchar("type", { length: 20 }).notNull(),
  link: text("link"),
  status: varchar("status", { length: 20 }).default("pending"),
  createdAt: timestamp("created_at").defaultNow()
});
var witnessFiles = pgTable("witness_files", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  witnessId: varchar("witness_id").references(() => teacherWitnesses.id, { onDelete: "cascade" }),
  fileName: text("file_name").notNull(),
  fileType: varchar("file_type", { length: 50 }).notNull(),
  fileUrl: text("file_url").notNull(),
  fileSize: integer("file_size"),
  order: integer("order").default(0),
  createdAt: timestamp("created_at").defaultNow()
});
var usersRelations = relations(users, ({ many }) => ({
  indicators: many(indicators),
  witnesses: many(witnesses),
  userStrategies: many(userStrategies),
  submittedSignatures: many(signatures, { relationName: "teacherSignatures" }),
  approvedSignatures: many(signatures, { relationName: "principalSignatures" }),
  notifications: many(notifications),
  auditLogs: many(auditLogs),
  teacherWitnesses: many(teacherWitnesses)
}));
var indicatorsRelations = relations(indicators, ({ one, many }) => ({
  user: one(users, {
    fields: [indicators.userId],
    references: [users.id]
  }),
  academicCycle: one(academicCycles, {
    fields: [indicators.academicCycleId],
    references: [academicCycles.id]
  }),
  criteria: many(criteria),
  witnesses: many(witnesses),
  signatures: many(signatures)
}));
var criteriaRelations = relations(criteria, ({ one, many }) => ({
  indicator: one(indicators, {
    fields: [criteria.indicatorId],
    references: [indicators.id]
  }),
  witnesses: many(witnesses)
}));
var witnessesRelations = relations(witnesses, ({ one }) => ({
  indicator: one(indicators, {
    fields: [witnesses.indicatorId],
    references: [indicators.id]
  }),
  criteria: one(criteria, {
    fields: [witnesses.criteriaId],
    references: [criteria.id]
  }),
  user: one(users, {
    fields: [witnesses.userId],
    references: [users.id]
  })
}));
var strategiesRelations = relations(strategies, ({ many }) => ({
  userStrategies: many(userStrategies)
}));
var userStrategiesRelations = relations(userStrategies, ({ one }) => ({
  user: one(users, {
    fields: [userStrategies.userId],
    references: [users.id]
  }),
  strategy: one(strategies, {
    fields: [userStrategies.strategyId],
    references: [strategies.id]
  })
}));
var signaturesRelations = relations(signatures, ({ one }) => ({
  indicator: one(indicators, {
    fields: [signatures.indicatorId],
    references: [indicators.id]
  }),
  teacher: one(users, {
    fields: [signatures.teacherId],
    references: [users.id],
    relationName: "teacherSignatures"
  }),
  principal: one(users, {
    fields: [signatures.principalId],
    references: [users.id],
    relationName: "principalSignatures"
  }),
  academicCycle: one(academicCycles, {
    fields: [signatures.academicCycleId],
    references: [academicCycles.id]
  })
}));
var insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertIndicatorSchema = createInsertSchema(indicators).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertCriteriaSchema = createInsertSchema(criteria).omit({
  id: true,
  createdAt: true
});
var insertWitnessSchema = createInsertSchema(witnesses).omit({
  id: true,
  createdAt: true
});
var insertStrategySchema = createInsertSchema(strategies).omit({
  id: true,
  createdAt: true
});
var insertUserStrategySchema = createInsertSchema(userStrategies).omit({
  id: true,
  createdAt: true
});
var insertCapabilitySchema = createInsertSchema(capabilities).omit({
  id: true,
  createdAt: true
});
var insertChangeSchema = createInsertSchema(changes).omit({
  id: true,
  createdAt: true
});
var insertSignatureSchema = createInsertSchema(signatures).omit({
  id: true,
  createdAt: true
});
var evaluationItemsRelations = relations(evaluationItems, ({ many }) => ({
  teacherWitnesses: many(teacherWitnesses)
}));
var teacherWitnessesRelations = relations(teacherWitnesses, ({ one, many }) => ({
  user: one(users, {
    fields: [teacherWitnesses.userId],
    references: [users.id]
  }),
  evaluationItem: one(evaluationItems, {
    fields: [teacherWitnesses.evaluationItemId],
    references: [evaluationItems.id]
  }),
  files: many(witnessFiles)
}));
var witnessFilesRelations = relations(witnessFiles, ({ one }) => ({
  witness: one(teacherWitnesses, {
    fields: [witnessFiles.witnessId],
    references: [teacherWitnesses.id]
  })
}));
var insertEvaluationItemSchema = createInsertSchema(evaluationItems).omit({ id: true });
var insertTeacherWitnessSchema = createInsertSchema(teacherWitnesses).omit({ id: true, createdAt: true });
var insertWitnessFileSchema = createInsertSchema(witnessFiles).omit({ id: true, createdAt: true });

// server/db.ts
import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
neonConfig.webSocketConstructor = ws;
if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?"
  );
}
var pool = new Pool({ connectionString: process.env.DATABASE_URL });
var db = drizzle({ client: pool, schema: schema_exports });

// server/storage.ts
import { eq as eq2, and, sql as sql2, desc } from "drizzle-orm";

// server/services/cycles.ts
import { eq } from "drizzle-orm";
var CycleService = class {
  static async getActiveCycle() {
    const cycle = await db.query.academicCycles.findFirst({
      where: eq(academicCycles.isActive, true)
    });
    if (!cycle) {
      const [newCycle] = await db.insert(academicCycles).values({
        name: "\u0627\u0644\u0639\u0627\u0645 \u0627\u0644\u062F\u0631\u0627\u0633\u064A \u0627\u0644\u062D\u0627\u0644\u064A",
        startDate: /* @__PURE__ */ new Date(),
        endDate: new Date((/* @__PURE__ */ new Date()).setFullYear((/* @__PURE__ */ new Date()).getFullYear() + 1)),
        isActive: true,
        isLocked: false
      }).returning();
      return newCycle;
    }
    return cycle;
  }
  static async getAllCycles() {
    return await db.query.academicCycles.findMany();
  }
  static async setActiveCycle(id) {
    await db.transaction(async (tx) => {
      await tx.update(academicCycles).set({ isActive: false });
      await tx.update(academicCycles).set({ isActive: true }).where(eq(academicCycles.id, id));
    });
  }
};

// server/storage.ts
var DatabaseStorage = class {
  async getUser(id) {
    const [user] = await db.select().from(users).where(eq2(users.id, id));
    return user;
  }
  async upsertUser(userData) {
    const [user] = await db.insert(users).values(userData).onConflictDoUpdate({
      target: users.id,
      set: {
        ...userData,
        updatedAt: /* @__PURE__ */ new Date()
      }
    }).returning();
    return user;
  }
  async updateUser(id, data) {
    const [updated] = await db.update(users).set({ ...data, updatedAt: /* @__PURE__ */ new Date() }).where(eq2(users.id, id)).returning();
    return updated;
  }
  async getIndicators(userId) {
    const activeCycle = await CycleService.getActiveCycle();
    let baseQuery = db.select().from(indicators);
    if (userId) {
      baseQuery = baseQuery.where(
        and(
          eq2(indicators.userId, userId),
          eq2(indicators.academicCycleId, activeCycle.id)
        )
      );
    } else {
      baseQuery = baseQuery.where(eq2(indicators.academicCycleId, activeCycle.id));
    }
    const indicatorsList = await baseQuery.orderBy(indicators.order);
    const result = [];
    for (const indicator of indicatorsList) {
      const criteriaList = await db.select().from(criteria).where(eq2(criteria.indicatorId, indicator.id)).orderBy(criteria.order);
      const witnessList = await db.select().from(witnesses).where(eq2(witnesses.indicatorId, indicator.id));
      result.push({
        ...indicator,
        criteria: criteriaList,
        witnesses: witnessList
      });
    }
    return result;
  }
  async getIndicator(id) {
    const [indicator] = await db.select().from(indicators).where(eq2(indicators.id, id));
    if (!indicator) return void 0;
    const criteriaList = await db.select().from(criteria).where(eq2(criteria.indicatorId, id)).orderBy(criteria.order);
    return {
      ...indicator,
      criteria: criteriaList
    };
  }
  async createIndicator(data) {
    const activeCycle = await CycleService.getActiveCycle();
    const [indicator] = await db.insert(indicators).values({
      ...data,
      academicCycleId: activeCycle.id
    }).returning();
    return indicator;
  }
  async updateIndicator(id, data) {
    const [updated] = await db.update(indicators).set({ ...data, updatedAt: /* @__PURE__ */ new Date() }).where(eq2(indicators.id, id)).returning();
    return updated;
  }
  async deleteIndicator(id) {
    const result = await db.delete(indicators).where(eq2(indicators.id, id));
    return true;
  }
  async getCriteria(indicatorId) {
    return db.select().from(criteria).where(eq2(criteria.indicatorId, indicatorId)).orderBy(criteria.order);
  }
  async getCriteriaById(id) {
    const [criterion] = await db.select().from(criteria).where(eq2(criteria.id, id));
    return criterion;
  }
  async createCriteria(data) {
    const [criterion] = await db.insert(criteria).values(data).returning();
    return criterion;
  }
  async updateCriteria(id, data) {
    const [updated] = await db.update(criteria).set(data).where(eq2(criteria.id, id)).returning();
    return updated;
  }
  async deleteCriteria(id) {
    await db.delete(criteria).where(eq2(criteria.id, id));
    return true;
  }
  async getWitnesses(indicatorId) {
    if (indicatorId) {
      return db.select().from(witnesses).where(eq2(witnesses.indicatorId, indicatorId));
    }
    return db.select().from(witnesses);
  }
  async getWitnessById(id) {
    const [witness] = await db.select().from(witnesses).where(eq2(witnesses.id, id));
    return witness;
  }
  async createWitness(data) {
    const [witness] = await db.insert(witnesses).values(data).returning();
    if (data.indicatorId) {
      const witnessCount = await db.select({ count: sql2`count(*)` }).from(witnesses).where(eq2(witnesses.indicatorId, data.indicatorId));
      await db.update(indicators).set({ witnessCount: Number(witnessCount[0]?.count || 0), updatedAt: /* @__PURE__ */ new Date() }).where(eq2(indicators.id, data.indicatorId));
    }
    return witness;
  }
  async deleteWitness(id) {
    const [witness] = await db.select().from(witnesses).where(eq2(witnesses.id, id));
    await db.delete(witnesses).where(eq2(witnesses.id, id));
    if (witness?.indicatorId) {
      const witnessCount = await db.select({ count: sql2`count(*)` }).from(witnesses).where(eq2(witnesses.indicatorId, witness.indicatorId));
      await db.update(indicators).set({ witnessCount: Number(witnessCount[0]?.count || 0), updatedAt: /* @__PURE__ */ new Date() }).where(eq2(indicators.id, witness.indicatorId));
    }
    return true;
  }
  async getStrategies() {
    return db.select().from(strategies).where(eq2(strategies.isActive, true));
  }
  async createStrategy(data) {
    const [strategy] = await db.insert(strategies).values(data).returning();
    return strategy;
  }
  async getUserStrategies(userId) {
    const userStrategyList = await db.select().from(userStrategies).where(eq2(userStrategies.userId, userId));
    if (userStrategyList.length === 0) return [];
    const strategyIds = userStrategyList.map((us) => us.strategyId).filter((id) => id !== null);
    if (strategyIds.length === 0) return [];
    const result = [];
    for (const id of strategyIds) {
      const [strategy] = await db.select().from(strategies).where(eq2(strategies.id, id));
      if (strategy) result.push(strategy);
    }
    return result;
  }
  async setUserStrategies(userId, strategyIds) {
    await db.delete(userStrategies).where(eq2(userStrategies.userId, userId));
    if (strategyIds.length > 0) {
      await db.insert(userStrategies).values(
        strategyIds.map((strategyId) => ({
          userId,
          strategyId
        }))
      );
    }
  }
  async getCapabilities() {
    return db.select().from(capabilities).orderBy(capabilities.order);
  }
  async getChanges() {
    return db.select().from(changes).orderBy(changes.order);
  }
  async getStats(userId) {
    const indicatorsList = userId ? await db.select().from(indicators).where(eq2(indicators.userId, userId)) : await db.select().from(indicators);
    const capabilitiesList = await db.select().from(capabilities);
    const changesList = await db.select().from(changes);
    const witnessesList = userId ? await db.select().from(witnesses).where(eq2(witnesses.userId, userId)) : await db.select().from(witnesses);
    const totalIndicators = indicatorsList.length;
    const completedIndicators = indicatorsList.filter((i) => i.status === "completed").length;
    const pendingIndicators = indicatorsList.filter((i) => i.status === "pending").length;
    const inProgressIndicators = indicatorsList.filter((i) => i.status === "in_progress").length;
    const totalWitnesses = witnessesList.length;
    return {
      totalCapabilities: capabilitiesList.length || 12,
      totalChanges: changesList.length || 12,
      totalIndicators,
      completedIndicators,
      pendingIndicators,
      inProgressIndicators,
      totalWitnesses
    };
  }
  async reEvaluateIndicators(indicatorIds) {
    for (const id of indicatorIds) {
      await db.update(indicators).set({ status: "pending", witnessCount: 0, updatedAt: /* @__PURE__ */ new Date() }).where(eq2(indicators.id, id));
      await db.update(criteria).set({ isCompleted: false }).where(eq2(criteria.indicatorId, id));
      await db.delete(witnesses).where(eq2(witnesses.indicatorId, id));
    }
  }
  // Get all teachers with their stats
  async getAllTeachers() {
    const teachersList = await db.select().from(users).where(eq2(users.role, "teacher"));
    const result = [];
    for (const teacher of teachersList) {
      const teacherIndicators = await db.select().from(indicators).where(eq2(indicators.userId, teacher.id));
      const pendingSignatures = await db.select().from(signatures).where(
        and(eq2(signatures.teacherId, teacher.id), eq2(signatures.status, "pending"))
      );
      result.push({
        ...teacher,
        indicatorCount: teacherIndicators.length,
        completedCount: teacherIndicators.filter((i) => i.status === "completed").length,
        pendingApprovalCount: pendingSignatures.length
      });
    }
    return result;
  }
  // Principal dashboard stats
  async getPrincipalStats() {
    const baseStats = await this.getStats();
    const allTeachers = await db.select().from(users).where(eq2(users.role, "teacher"));
    const allSignatures = await db.select().from(signatures);
    return {
      ...baseStats,
      totalTeachers: allTeachers.length,
      pendingApprovals: allSignatures.filter((s) => s.status === "pending").length,
      approvedIndicators: allSignatures.filter((s) => s.status === "approved").length,
      rejectedIndicators: allSignatures.filter((s) => s.status === "rejected").length
    };
  }
  // Signature methods
  async createSignature(data) {
    const activeCycle = await CycleService.getActiveCycle();
    const [signature] = await db.insert(signatures).values({
      ...data,
      academicCycleId: activeCycle.id
    }).returning();
    return signature;
  }
  async getSignature(id) {
    const [signature] = await db.select().from(signatures).where(eq2(signatures.id, id));
    if (!signature) return void 0;
    const teacher = signature.teacherId ? await this.getUser(signature.teacherId) : void 0;
    const principal = signature.principalId ? await this.getUser(signature.principalId) : void 0;
    const indicator = signature.indicatorId ? await this.getIndicator(signature.indicatorId) : void 0;
    return {
      ...signature,
      teacher,
      principal,
      indicator
    };
  }
  async getSignaturesByTeacher(teacherId) {
    const signaturesList = await db.select().from(signatures).where(eq2(signatures.teacherId, teacherId));
    const result = [];
    for (const signature of signaturesList) {
      const teacher = signature.teacherId ? await this.getUser(signature.teacherId) : void 0;
      const principal = signature.principalId ? await this.getUser(signature.principalId) : void 0;
      const indicator = signature.indicatorId ? await this.getIndicator(signature.indicatorId) : void 0;
      result.push({
        ...signature,
        teacher,
        principal,
        indicator
      });
    }
    return result;
  }
  async getPendingSignatures() {
    const signaturesList = await db.select().from(signatures).where(eq2(signatures.status, "pending"));
    const result = [];
    for (const signature of signaturesList) {
      const teacher = signature.teacherId ? await this.getUser(signature.teacherId) : void 0;
      const principal = signature.principalId ? await this.getUser(signature.principalId) : void 0;
      const indicator = signature.indicatorId ? await this.getIndicator(signature.indicatorId) : void 0;
      result.push({
        ...signature,
        teacher,
        principal,
        indicator
      });
    }
    return result;
  }
  async updateSignature(id, data) {
    const [updated] = await db.update(signatures).set(data).where(eq2(signatures.id, id)).returning();
    return updated;
  }
  async approveSignature(id, principalId, notes) {
    const [updated] = await db.update(signatures).set({
      status: "approved",
      principalId,
      notes,
      signedAt: /* @__PURE__ */ new Date()
    }).where(eq2(signatures.id, id)).returning();
    return updated;
  }
  async rejectSignature(id, principalId, notes) {
    const [updated] = await db.update(signatures).set({
      status: "rejected",
      principalId,
      notes,
      signedAt: /* @__PURE__ */ new Date()
    }).where(eq2(signatures.id, id)).returning();
    return updated;
  }
  // Creator methods (site management)
  async getAllUsers() {
    return db.select().from(users).orderBy(users.createdAt);
  }
  async updateUserRole(userId, role) {
    const [updated] = await db.update(users).set({ role, updatedAt: /* @__PURE__ */ new Date() }).where(eq2(users.id, userId)).returning();
    return updated;
  }
  async deleteUser(userId) {
    await db.delete(signatures).where(eq2(signatures.teacherId, userId));
    await db.delete(userStrategies).where(eq2(userStrategies.userId, userId));
    const userIndicators = await db.select().from(indicators).where(eq2(indicators.userId, userId));
    for (const indicator of userIndicators) {
      await db.delete(witnesses).where(eq2(witnesses.indicatorId, indicator.id));
      await db.delete(criteria).where(eq2(criteria.indicatorId, indicator.id));
    }
    await db.delete(indicators).where(eq2(indicators.userId, userId));
    const result = await db.delete(users).where(eq2(users.id, userId));
    return true;
  }
  async updateUserPassword(userId, password) {
    const [updated] = await db.update(users).set({ password, updatedAt: /* @__PURE__ */ new Date() }).where(eq2(users.id, userId)).returning();
    return updated;
  }
  // Custom auth methods
  async findTeacherByName(firstName, lastName) {
    const [user] = await db.select().from(users).where(
      and(
        eq2(users.firstName, firstName),
        eq2(users.lastName, lastName),
        eq2(users.role, "teacher")
      )
    );
    return user;
  }
  async findUserByMobile(mobileNumber) {
    const [user] = await db.select().from(users).where(eq2(users.mobileNumber, mobileNumber)).limit(1);
    return user;
  }
  async findUserByNationalId(nationalId) {
    const [user] = await db.select().from(users).where(eq2(users.nationalId, nationalId)).limit(1);
    return user;
  }
  async findUserByRole(role) {
    const [user] = await db.select().from(users).where(eq2(users.role, role)).limit(1);
    return user;
  }
  // Seed default indicators for a new user
  async seedDefaultIndicators(userId) {
    const existingIndicators = await db.select().from(indicators).where(eq2(indicators.userId, userId));
    if (existingIndicators.length > 0) {
      return;
    }
    const defaultIndicators = [
      {
        title: "\u0623\u062F\u0627\u0621 \u0627\u0644\u0648\u0627\u062C\u0628\u0627\u062A \u0627\u0644\u0648\u0638\u064A\u0641\u064A\u0629",
        description: "\u062A\u0648\u062B\u064A\u0642 \u0627\u0644\u0627\u0644\u062A\u0632\u0627\u0645 \u0628\u0627\u0644\u0648\u0627\u062C\u0628\u0627\u062A \u0627\u0644\u0648\u0638\u064A\u0641\u064A\u0629 \u0648\u0627\u0644\u0645\u0647\u0627\u0645 \u0627\u0644\u064A\u0648\u0645\u064A\u0629",
        criteria: [
          "\u0633\u062C\u0644 \u0627\u0644\u062F\u0648\u0627\u0645 \u0627\u0644\u0631\u0633\u0645\u064A",
          "\u0633\u062C\u0644 \u0627\u0644\u0645\u0646\u0627\u0648\u0628\u0627\u062A \u0648\u0627\u0644\u0625\u0634\u0631\u0627\u0641 \u0627\u0644\u064A\u0648\u0645\u064A",
          "\u0633\u062C\u0644 \u0627\u0644\u0627\u0646\u062A\u0638\u0627\u0631",
          "\u0645\u062A\u0627\u0628\u0639\u0629 \u0627\u0644\u0645\u0647\u0627\u0645 \u0627\u0644\u064A\u0648\u0645\u064A\u0629"
        ]
      },
      {
        title: "\u0627\u0644\u062A\u0641\u0627\u0639\u0644 \u0645\u0639 \u0627\u0644\u0645\u062C\u062A\u0645\u0639 \u0627\u0644\u0645\u0647\u0646\u064A",
        description: "\u062A\u0648\u062B\u064A\u0642 \u0627\u0644\u062A\u0641\u0627\u0639\u0644 \u0648\u0627\u0644\u062A\u0639\u0627\u0648\u0646 \u0645\u0639 \u0627\u0644\u0632\u0645\u0644\u0627\u0621 \u0641\u064A \u0627\u0644\u0645\u062C\u062A\u0645\u0639 \u0627\u0644\u0645\u0647\u0646\u064A",
        criteria: [
          "\u0632\u064A\u0627\u0631\u0629 \u0645\u0639\u0644\u0645",
          "\u062F\u0631\u0633 \u062A\u0637\u0628\u064A\u0642\u064A",
          "\u0634\u0647\u0627\u062F\u0629 \u062D\u0636\u0648\u0631 \u0645\u0639\u0644\u0645",
          "\u062A\u0628\u0627\u062F\u0644 \u062E\u0628\u0631\u0629 \u0645\u0639 \u0632\u0645\u064A\u0644"
        ]
      },
      {
        title: "\u0627\u0644\u062A\u0641\u0627\u0639\u0644 \u0645\u0639 \u0623\u0648\u0644\u064A\u0627\u0621 \u0627\u0644\u0623\u0645\u0648\u0631",
        description: "\u062A\u0648\u062B\u064A\u0642 \u0627\u0644\u062A\u0648\u0627\u0635\u0644 \u0648\u0627\u0644\u062A\u0641\u0627\u0639\u0644 \u0645\u0639 \u0623\u0648\u0644\u064A\u0627\u0621 \u0627\u0644\u0623\u0645\u0648\u0631",
        criteria: [
          "\u0633\u062C\u0644 \u0627\u0644\u062A\u0648\u0627\u0635\u0644 \u0645\u0639 \u0623\u0648\u0644\u064A\u0627\u0621 \u0627\u0644\u0623\u0645\u0648\u0631",
          "\u0645\u062D\u0627\u0636\u0631 \u0627\u062C\u062A\u0645\u0627\u0639\u0627\u062A \u0623\u0648\u0644\u064A\u0627\u0621 \u0627\u0644\u0623\u0645\u0648\u0631",
          "\u0631\u0633\u0627\u0626\u0644 \u0648\u062A\u0642\u0627\u0631\u064A\u0631 \u0644\u0644\u0623\u0633\u0631",
          "\u0645\u0634\u0627\u0631\u0643\u0629 \u0623\u0648\u0644\u064A\u0627\u0621 \u0627\u0644\u0623\u0645\u0648\u0631 \u0641\u064A \u0627\u0644\u0623\u0646\u0634\u0637\u0629"
        ]
      },
      {
        title: "\u0627\u0633\u062A\u0631\u0627\u062A\u064A\u062C\u064A\u0627\u062A \u0627\u0644\u062A\u062F\u0631\u064A\u0633",
        description: "\u062A\u0648\u062B\u064A\u0642 \u0627\u0633\u062A\u062E\u062F\u0627\u0645 \u0627\u0633\u062A\u0631\u0627\u062A\u064A\u062C\u064A\u0627\u062A \u0627\u0644\u062A\u062F\u0631\u064A\u0633 \u0627\u0644\u0645\u062A\u0646\u0648\u0639\u0629",
        criteria: [
          "\u062A\u0642\u0631\u064A\u0631 \u0623\u0648 \u0635\u0648\u0631\u0629",
          "\u0645\u0646 \u0633\u062C\u0644 \u0627\u0644\u062A\u062D\u0636\u064A\u0631",
          "\u0646\u0645\u0627\u0630\u062C \u0645\u0646 \u0623\u0648\u0631\u0627\u0642 \u0627\u0644\u0639\u0645\u0644",
          "\u062A\u0633\u062C\u064A\u0644\u0627\u062A \u0641\u064A\u062F\u064A\u0648 \u0644\u0644\u062F\u0631\u0648\u0633"
        ]
      },
      {
        title: "\u062A\u062D\u0633\u064A\u0646 \u0646\u062A\u0627\u0626\u062C \u0627\u0644\u0645\u062A\u0639\u0644\u0645\u064A\u0646",
        description: "\u062A\u0648\u062B\u064A\u0642 \u0627\u0644\u062C\u0647\u0648\u062F \u0627\u0644\u0645\u0628\u0630\u0648\u0644\u0629 \u0644\u062A\u062D\u0633\u064A\u0646 \u0645\u0633\u062A\u0648\u0649 \u0627\u0644\u0637\u0644\u0627\u0628",
        criteria: [
          "\u062E\u0637\u0637 \u0639\u0644\u0627\u062C\u064A\u0629 \u0644\u0644\u0637\u0644\u0627\u0628",
          "\u0628\u0631\u0627\u0645\u062C \u0625\u062B\u0631\u0627\u0626\u064A\u0629 \u0644\u0644\u0645\u062A\u0641\u0648\u0642\u064A\u0646",
          "\u062A\u0642\u0627\u0631\u064A\u0631 \u062A\u062D\u0633\u0646 \u0627\u0644\u0645\u0633\u062A\u0648\u0649",
          "\u0645\u0642\u0627\u0631\u0646\u0629 \u0646\u062A\u0627\u0626\u062C \u0645\u0627 \u0642\u0628\u0644 \u0648\u0645\u0627 \u0628\u0639\u062F"
        ]
      },
      {
        title: "\u0625\u0639\u062F\u0627\u062F \u0648\u062A\u0646\u0641\u064A\u0630 \u062E\u0637\u0637 \u0627\u0644\u062A\u0639\u0644\u0645",
        description: "\u062A\u0648\u062B\u064A\u0642 \u0627\u0644\u062A\u062E\u0637\u064A\u0637 \u0648\u0627\u0644\u062A\u0646\u0641\u064A\u0630 \u0644\u0644\u0639\u0645\u0644\u064A\u0629 \u0627\u0644\u062A\u0639\u0644\u064A\u0645\u064A\u0629",
        criteria: [
          "\u0627\u0644\u062E\u0637\u0629 \u0627\u0644\u0641\u0635\u0644\u064A\u0629",
          "\u0627\u0644\u062A\u062D\u0636\u064A\u0631 \u0627\u0644\u064A\u0648\u0645\u064A",
          "\u062A\u0648\u0632\u064A\u0639 \u0627\u0644\u0645\u0646\u0647\u062C",
          "\u062E\u0637\u0637 \u0627\u0644\u0648\u062D\u062F\u0627\u062A \u0627\u0644\u062F\u0631\u0627\u0633\u064A\u0629"
        ]
      },
      {
        title: "\u062A\u0648\u0638\u064A\u0641 \u062A\u0642\u0646\u064A\u0627\u062A \u0648\u0648\u0633\u0627\u0626\u0644 \u0627\u0644\u062A\u0639\u0644\u0645 \u0627\u0644\u0645\u0646\u0627\u0633\u0628\u0629",
        description: "\u062A\u0648\u062B\u064A\u0642 \u0627\u0633\u062A\u062E\u062F\u0627\u0645 \u0627\u0644\u062A\u0642\u0646\u064A\u0629 \u0641\u064A \u0627\u0644\u062A\u0639\u0644\u064A\u0645",
        criteria: [
          "\u0627\u0633\u062A\u062E\u062F\u0627\u0645 \u0627\u0644\u0633\u0628\u0648\u0631\u0629 \u0627\u0644\u062A\u0641\u0627\u0639\u0644\u064A\u0629",
          "\u062A\u0648\u0638\u064A\u0641 \u0627\u0644\u0645\u0646\u0635\u0627\u062A \u0627\u0644\u062A\u0639\u0644\u064A\u0645\u064A\u0629",
          "\u0625\u0646\u062A\u0627\u062C \u0645\u062D\u062A\u0648\u0649 \u0631\u0642\u0645\u064A",
          "\u0627\u0633\u062A\u062E\u062F\u0627\u0645 \u0627\u0644\u062A\u0637\u0628\u064A\u0642\u0627\u062A \u0627\u0644\u062A\u0639\u0644\u064A\u0645\u064A\u0629"
        ]
      },
      {
        title: "\u062A\u0647\u064A\u0626\u0629 \u0627\u0644\u0628\u064A\u0626\u0629 \u0627\u0644\u062A\u0639\u0644\u064A\u0645\u064A\u0629",
        description: "\u062A\u0648\u062B\u064A\u0642 \u062A\u062C\u0647\u064A\u0632 \u0648\u062A\u0647\u064A\u0626\u0629 \u0628\u064A\u0626\u0629 \u0627\u0644\u062A\u0639\u0644\u0645",
        criteria: [
          "\u0635\u0648\u0631 \u0627\u0644\u0641\u0635\u0644 \u0627\u0644\u062F\u0631\u0627\u0633\u064A",
          "\u0631\u0643\u0646 \u0627\u0644\u062A\u0639\u0644\u0645",
          "\u0627\u0644\u0644\u0648\u062D\u0627\u062A \u0648\u0627\u0644\u0648\u0633\u0627\u0626\u0644 \u0627\u0644\u062A\u0639\u0644\u064A\u0645\u064A\u0629",
          "\u062A\u0646\u0638\u064A\u0645 \u0645\u0642\u0627\u0639\u062F \u0627\u0644\u0637\u0644\u0627\u0628"
        ]
      },
      {
        title: "\u0627\u0644\u0625\u062F\u0627\u0631\u0629 \u0627\u0644\u0635\u0641\u064A\u0629",
        description: "\u062A\u0648\u062B\u064A\u0642 \u0645\u0647\u0627\u0631\u0627\u062A \u0625\u062F\u0627\u0631\u0629 \u0627\u0644\u0635\u0641",
        criteria: [
          "\u0642\u0648\u0627\u0639\u062F \u0648\u062A\u0639\u0644\u064A\u0645\u0627\u062A \u0627\u0644\u0641\u0635\u0644",
          "\u0646\u0638\u0627\u0645 \u0627\u0644\u062A\u0639\u0632\u064A\u0632 \u0648\u0627\u0644\u062A\u062D\u0641\u064A\u0632",
          "\u0633\u062C\u0644 \u0627\u0644\u0633\u0644\u0648\u0643",
          "\u0627\u0633\u062A\u0631\u0627\u062A\u064A\u062C\u064A\u0627\u062A \u0636\u0628\u0637 \u0627\u0644\u0635\u0641"
        ]
      },
      {
        title: "\u062A\u062D\u0644\u064A\u0644 \u0646\u062A\u0627\u0626\u062C \u0627\u0644\u0645\u062A\u0639\u0644\u0645\u064A\u0646 \u0648\u062A\u0634\u062E\u064A\u0635 \u0645\u0633\u062A\u0648\u064A\u0627\u062A\u0647\u0645",
        description: "\u062A\u0648\u062B\u064A\u0642 \u062A\u062D\u0644\u064A\u0644 \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A \u0648\u0627\u062A\u062E\u0627\u0630 \u0627\u0644\u0642\u0631\u0627\u0631\u0627\u062A",
        criteria: [
          "\u062C\u062F\u0627\u0648\u0644 \u062A\u062D\u0644\u064A\u0644 \u0627\u0644\u0646\u062A\u0627\u0626\u062C",
          "\u0631\u0633\u0648\u0645 \u0628\u064A\u0627\u0646\u064A\u0629 \u0644\u0644\u0623\u062F\u0627\u0621",
          "\u062A\u0642\u0627\u0631\u064A\u0631 \u0627\u0644\u062A\u0634\u062E\u064A\u0635",
          "\u062E\u0637\u0637 \u0628\u0646\u0627\u0621\u064B \u0639\u0644\u0649 \u0627\u0644\u062A\u062D\u0644\u064A\u0644"
        ]
      },
      {
        title: "\u062A\u0646\u0648\u0639 \u0623\u0633\u0627\u0644\u064A\u0628 \u0627\u0644\u062A\u0642\u0648\u064A\u0645",
        description: "\u062A\u0648\u062B\u064A\u0642 \u0627\u0633\u062A\u062E\u062F\u0627\u0645 \u0623\u0633\u0627\u0644\u064A\u0628 \u062A\u0642\u0648\u064A\u0645 \u0645\u062A\u0646\u0648\u0639\u0629",
        criteria: [
          "\u0646\u0645\u0627\u0630\u062C \u0645\u0646 \u0627\u062E\u062A\u0628\u0627\u0631\u0627\u062A",
          "\u0646\u0645\u0648\u0630\u062C \u0645\u0646 \u0645\u0644\u0641\u0627\u062A \u0625\u0646\u062C\u0627\u0632 \u0627\u0644\u0637\u0644\u0627\u0628",
          "\u0646\u0645\u0648\u0630\u062C \u0645\u0646 \u0627\u0644\u0645\u0647\u0627\u0645 \u0627\u0644\u0623\u062F\u0627\u0626\u064A\u0629",
          "\u0646\u0645\u0627\u0630\u062C \u0645\u0646 \u0627\u0644\u0645\u0634\u0627\u0631\u064A\u0639"
        ]
      },
      {
        title: "\u0627\u0644\u0625\u0628\u062F\u0627\u0639 \u0648\u0627\u0644\u0627\u0628\u062A\u0643\u0627\u0631",
        description: "\u062A\u0648\u062B\u064A\u0642 \u0627\u0644\u0625\u0628\u062F\u0627\u0639 \u0648\u0627\u0644\u0627\u0628\u062A\u0643\u0627\u0631 \u0641\u064A \u0627\u0644\u0639\u0645\u0644 \u0627\u0644\u062A\u0639\u0644\u064A\u0645\u064A",
        criteria: [
          "\u0645\u0634\u0627\u0631\u064A\u0639 \u0625\u0628\u062F\u0627\u0639\u064A\u0629 - \u0648\u062B\u0627\u0626\u0642 \u0627\u0644\u0645\u0634\u0627\u0631\u064A\u0639 \u0627\u0644\u0625\u0628\u062F\u0627\u0639\u064A\u0629 \u0648\u0627\u0644\u0645\u0628\u0627\u062F\u0631\u0627\u062A \u0627\u0644\u0645\u0628\u062A\u0643\u0631\u0629",
          "\u062C\u0648\u0627\u0626\u0632 \u0648\u062A\u0643\u0631\u064A\u0645\u0627\u062A - \u0634\u0647\u0627\u062F\u0627\u062A \u0627\u0644\u062C\u0648\u0627\u0626\u0632 \u0648\u0627\u0644\u062A\u0643\u0631\u064A\u0645\u0627\u062A \u0644\u0644\u0625\u0628\u062F\u0627\u0639",
          "\u0623\u0639\u0645\u0627\u0644 \u0637\u0644\u0627\u0628\u064A\u0629 \u0645\u0645\u064A\u0632\u0629 - \u0646\u0645\u0627\u0630\u062C \u0645\u0646 \u0627\u0644\u0623\u0639\u0645\u0627\u0644 \u0627\u0644\u0637\u0644\u0627\u0628\u064A\u0629 \u0627\u0644\u0645\u0628\u062F\u0639\u0629"
        ]
      }
    ];
    for (let i = 0; i < defaultIndicators.length; i++) {
      const indicatorData = defaultIndicators[i];
      const [indicator] = await db.insert(indicators).values({
        title: indicatorData.title,
        description: indicatorData.description,
        status: "pending",
        witnessCount: 0,
        userId,
        order: i + 1
      }).returning();
      for (let j = 0; j < indicatorData.criteria.length; j++) {
        await db.insert(criteria).values({
          indicatorId: indicator.id,
          title: indicatorData.criteria[j],
          isCompleted: false,
          order: j + 1
        });
      }
    }
  }
  // Check if user has indicators
  async hasIndicators(userId) {
    const existingIndicators = await db.select().from(indicators).where(eq2(indicators.userId, userId));
    return existingIndicators.length > 0;
  }
  // Seed evaluation items on server startup
  async seedEvaluationItems() {
    const existing = await db.select().from(evaluationItems).limit(1);
    if (existing.length > 0) return;
    const items = [
      { title: "\u0623\u062F\u0627\u0621 \u0627\u0644\u0648\u0627\u062C\u0628\u0627\u062A \u0627\u0644\u0648\u0638\u064A\u0641\u064A\u0629", weight: "10%", description: "\u0627\u0644\u0627\u0644\u062A\u0632\u0627\u0645 \u0628\u0623\u062F\u0627\u0621 \u0627\u0644\u0645\u0647\u0627\u0645 \u0648\u0627\u0644\u0648\u0627\u062C\u0628\u0627\u062A \u0627\u0644\u0648\u0638\u064A\u0641\u064A\u0629 \u0627\u0644\u0645\u0643\u0644\u0641 \u0628\u0647\u0627", icon: "Briefcase", suggestedEvidence: ["\u0645\u062D\u0627\u0636\u0631 \u0627\u0644\u0627\u062C\u062A\u0645\u0627\u0639\u0627\u062A", "\u062A\u0642\u0627\u0631\u064A\u0631 \u0627\u0644\u0625\u0646\u062C\u0627\u0632", "\u0634\u0647\u0627\u062F\u0627\u062A \u0627\u0644\u062D\u0636\u0648\u0631", "\u062E\u0637\u0627\u0628\u0627\u062A \u0627\u0644\u062A\u0643\u0644\u064A\u0641"], examples: ["\u062D\u0636\u0648\u0631 \u0627\u0644\u0627\u062C\u062A\u0645\u0627\u0639\u0627\u062A \u0627\u0644\u0645\u062F\u0631\u0633\u064A\u0629", "\u0627\u0644\u0645\u0634\u0627\u0631\u0643\u0629 \u0641\u064A \u0627\u0644\u0623\u0646\u0634\u0637\u0629", "\u062A\u0646\u0641\u064A\u0630 \u0627\u0644\u062A\u0643\u0644\u064A\u0641\u0627\u062A \u0627\u0644\u0625\u062F\u0627\u0631\u064A\u0629"], order: 1 },
      { title: "\u0627\u0644\u062A\u0641\u0627\u0639\u0644 \u0645\u0639 \u0627\u0644\u0645\u062C\u062A\u0645\u0639 \u0627\u0644\u0645\u0647\u0646\u064A", weight: "10%", description: "\u0627\u0644\u0645\u0634\u0627\u0631\u0643\u0629 \u0627\u0644\u0641\u0627\u0639\u0644\u0629 \u0641\u064A \u0627\u0644\u0645\u062C\u062A\u0645\u0639\u0627\u062A \u0627\u0644\u0645\u0647\u0646\u064A\u0629 \u0627\u0644\u062A\u0639\u0644\u064A\u0645\u064A\u0629", icon: "Users", suggestedEvidence: ["\u0634\u0647\u0627\u062F\u0627\u062A \u0627\u0644\u062F\u0648\u0631\u0627\u062A", "\u0645\u062D\u0627\u0636\u0631 \u0627\u0644\u0645\u062C\u062A\u0645\u0639\u0627\u062A \u0627\u0644\u0645\u0647\u0646\u064A\u0629", "\u0623\u0648\u0631\u0627\u0642 \u0627\u0644\u0639\u0645\u0644 \u0627\u0644\u0645\u0642\u062F\u0645\u0629", "\u062A\u0642\u0627\u0631\u064A\u0631 \u0627\u0644\u0645\u0644\u062A\u0642\u064A\u0627\u062A"], examples: ["\u062D\u0636\u0648\u0631 \u062F\u0648\u0631\u0627\u062A \u062A\u062F\u0631\u064A\u0628\u064A\u0629", "\u0627\u0644\u0645\u0634\u0627\u0631\u0643\u0629 \u0641\u064A \u0645\u0644\u062A\u0642\u064A\u0627\u062A \u0645\u0647\u0646\u064A\u0629", "\u062A\u0642\u062F\u064A\u0645 \u0648\u0631\u0634 \u0639\u0645\u0644"], order: 2 },
      { title: "\u0627\u0644\u062A\u0641\u0627\u0639\u0644 \u0645\u0639 \u0623\u0648\u0644\u064A\u0627\u0621 \u0627\u0644\u0623\u0645\u0648\u0631", weight: "10%", description: "\u0627\u0644\u062A\u0648\u0627\u0635\u0644 \u0627\u0644\u0641\u0639\u0627\u0644 \u0645\u0639 \u0623\u0648\u0644\u064A\u0627\u0621 \u0623\u0645\u0648\u0631 \u0627\u0644\u0637\u0644\u0627\u0628", icon: "UserCheck", suggestedEvidence: ["\u0633\u062C\u0644 \u0627\u0644\u062A\u0648\u0627\u0635\u0644 \u0645\u0639 \u0623\u0648\u0644\u064A\u0627\u0621 \u0627\u0644\u0623\u0645\u0648\u0631", "\u0645\u062D\u0627\u0636\u0631 \u0627\u0644\u0627\u062C\u062A\u0645\u0627\u0639\u0627\u062A", "\u0631\u0633\u0627\u0626\u0644 \u0627\u0644\u062A\u0648\u0627\u0635\u0644", "\u062A\u0642\u0627\u0631\u064A\u0631 \u0627\u0644\u0645\u062A\u0627\u0628\u0639\u0629"], examples: ["\u0627\u062C\u062A\u0645\u0627\u0639\u0627\u062A \u0623\u0648\u0644\u064A\u0627\u0621 \u0627\u0644\u0623\u0645\u0648\u0631", "\u0631\u0633\u0627\u0626\u0644 \u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A\u0629", "\u0627\u062A\u0635\u0627\u0644\u0627\u062A \u0647\u0627\u062A\u0641\u064A\u0629"], order: 3 },
      { title: "\u0627\u0644\u062A\u0646\u0648\u064A\u0639 \u0641\u064A \u0627\u0633\u062A\u0631\u0627\u062A\u064A\u062C\u064A\u0627\u062A \u0627\u0644\u062A\u062F\u0631\u064A\u0633", weight: "10%", description: "\u0627\u0633\u062A\u062E\u062F\u0627\u0645 \u0627\u0633\u062A\u0631\u0627\u062A\u064A\u062C\u064A\u0627\u062A \u062A\u062F\u0631\u064A\u0633 \u0645\u062A\u0646\u0648\u0639\u0629 \u0648\u0641\u0639\u0627\u0644\u0629", icon: "Lightbulb", suggestedEvidence: ["\u062A\u062D\u0636\u064A\u0631 \u0627\u0644\u062F\u0631\u0648\u0633", "\u0635\u0648\u0631 \u0645\u0646 \u0627\u0644\u062A\u0637\u0628\u064A\u0642", "\u0641\u064A\u062F\u064A\u0648\u0647\u0627\u062A \u062A\u0639\u0644\u064A\u0645\u064A\u0629", "\u0623\u0648\u0631\u0627\u0642 \u0639\u0645\u0644"], examples: ["\u0627\u0644\u062A\u0639\u0644\u0645 \u0627\u0644\u062A\u0639\u0627\u0648\u0646\u064A", "\u0627\u0644\u062A\u0639\u0644\u0645 \u0628\u0627\u0644\u0645\u0634\u0627\u0631\u064A\u0639", "\u0627\u0644\u0635\u0641 \u0627\u0644\u0645\u0642\u0644\u0648\u0628"], order: 4 },
      { title: "\u062A\u062D\u0633\u064A\u0646 \u0646\u062A\u0627\u0626\u062C \u0627\u0644\u0645\u062A\u0639\u0644\u0645\u064A\u0646", weight: "10%", description: "\u0627\u0644\u0639\u0645\u0644 \u0639\u0644\u0649 \u0631\u0641\u0639 \u0645\u0633\u062A\u0648\u0649 \u062A\u062D\u0635\u064A\u0644 \u0627\u0644\u0637\u0644\u0627\u0628", icon: "TrendingUp", suggestedEvidence: ["\u0646\u062A\u0627\u0626\u062C \u0627\u0644\u0627\u062E\u062A\u0628\u0627\u0631\u0627\u062A", "\u062A\u0642\u0627\u0631\u064A\u0631 \u0627\u0644\u062A\u062D\u0635\u064A\u0644", "\u062E\u0637\u0637 \u0627\u0644\u0639\u0644\u0627\u062C", "\u0625\u062D\u0635\u0627\u0626\u064A\u0627\u062A \u0627\u0644\u0645\u0642\u0627\u0631\u0646\u0629"], examples: ["\u062A\u062D\u0644\u064A\u0644 \u0646\u062A\u0627\u0626\u062C \u0627\u0644\u0637\u0644\u0627\u0628", "\u062E\u0637\u0637 \u0639\u0644\u0627\u062C\u064A\u0629", "\u0628\u0631\u0627\u0645\u062C \u0625\u062B\u0631\u0627\u0626\u064A\u0629"], order: 5 },
      { title: "\u0625\u0639\u062F\u0627\u062F \u0648\u062A\u0646\u0641\u064A\u0630 \u062E\u0637\u0629 \u0627\u0644\u062A\u0639\u0644\u0645", weight: "10%", description: "\u0625\u0639\u062F\u0627\u062F \u062E\u0637\u0637 \u062A\u0639\u0644\u064A\u0645\u064A\u0629 \u0634\u0627\u0645\u0644\u0629 \u0648\u062A\u0646\u0641\u064A\u0630\u0647\u0627 \u0628\u0641\u0627\u0639\u0644\u064A\u0629", icon: "Calendar", suggestedEvidence: ["\u0627\u0644\u062E\u0637\u0629 \u0627\u0644\u0641\u0635\u0644\u064A\u0629", "\u0627\u0644\u062A\u062D\u0636\u064A\u0631 \u0627\u0644\u064A\u0648\u0645\u064A", "\u0633\u062C\u0644 \u0627\u0644\u0645\u062A\u0627\u0628\u0639\u0629", "\u062A\u0642\u0627\u0631\u064A\u0631 \u0627\u0644\u062A\u0646\u0641\u064A\u0630"], examples: ["\u062E\u0637\u0629 \u0641\u0635\u0644\u064A\u0629 \u0645\u062A\u0643\u0627\u0645\u0644\u0629", "\u062A\u062D\u0636\u064A\u0631 \u064A\u0648\u0645\u064A", "\u0645\u062A\u0627\u0628\u0639\u0629 \u062A\u0646\u0641\u064A\u0630 \u0627\u0644\u062E\u0637\u0629"], order: 6 },
      { title: "\u062A\u0648\u0638\u064A\u0641 \u062A\u0642\u0646\u064A\u0627\u062A \u0627\u0644\u062A\u0639\u0644\u0645", weight: "10%", description: "\u0627\u0633\u062A\u062E\u062F\u0627\u0645 \u0627\u0644\u062A\u0642\u0646\u064A\u0629 \u0627\u0644\u062D\u062F\u064A\u062B\u0629 \u0641\u064A \u0627\u0644\u0639\u0645\u0644\u064A\u0629 \u0627\u0644\u062A\u0639\u0644\u064A\u0645\u064A\u0629", icon: "Monitor", suggestedEvidence: ["\u0644\u0642\u0637\u0627\u062A \u0634\u0627\u0634\u0629", "\u0631\u0648\u0627\u0628\u0637 \u0627\u0644\u0645\u0646\u0635\u0627\u062A", "\u0635\u0648\u0631 \u0627\u0644\u062A\u0637\u0628\u064A\u0642", "\u062A\u0642\u0627\u0631\u064A\u0631 \u0627\u0644\u0627\u0633\u062A\u062E\u062F\u0627\u0645"], examples: ["\u0627\u0633\u062A\u062E\u062F\u0627\u0645 \u0645\u0646\u0635\u0629 \u0645\u062F\u0631\u0633\u062A\u064A", "\u0627\u0644\u062A\u0639\u0644\u0645 \u0639\u0646 \u0628\u0639\u062F", "\u0627\u0644\u062A\u0637\u0628\u064A\u0642\u0627\u062A \u0627\u0644\u062A\u0639\u0644\u064A\u0645\u064A\u0629"], order: 7 },
      { title: "\u062A\u0647\u064A\u0626\u0629 \u0627\u0644\u0628\u064A\u0626\u0629 \u0627\u0644\u062A\u0639\u0644\u064A\u0645\u064A\u0629", weight: "5%", description: "\u062A\u0647\u064A\u0626\u0629 \u0628\u064A\u0626\u0629 \u0635\u0641\u064A\u0629 \u0645\u062D\u0641\u0632\u0629 \u0644\u0644\u062A\u0639\u0644\u0645", icon: "Home", suggestedEvidence: ["\u0635\u0648\u0631 \u0627\u0644\u0641\u0635\u0644", "\u062A\u0642\u0627\u0631\u064A\u0631 \u0627\u0644\u0632\u064A\u0627\u0631\u0627\u062A", "\u062E\u0637\u0629 \u062A\u0646\u0638\u064A\u0645 \u0627\u0644\u0628\u064A\u0626\u0629", "\u0645\u0644\u0627\u062D\u0638\u0627\u062A \u0627\u0644\u0645\u0634\u0631\u0641"], examples: ["\u062A\u0646\u0638\u064A\u0645 \u0627\u0644\u0641\u0635\u0644", "\u0627\u0644\u0648\u0633\u0627\u0626\u0644 \u0627\u0644\u062A\u0639\u0644\u064A\u0645\u064A\u0629", "\u0631\u0643\u0646 \u0627\u0644\u062A\u0639\u0644\u0645"], order: 8 },
      { title: "\u0627\u0644\u0625\u062F\u0627\u0631\u0629 \u0627\u0644\u0635\u0641\u064A\u0629", weight: "5%", description: "\u0625\u062F\u0627\u0631\u0629 \u0627\u0644\u0635\u0641 \u0628\u0643\u0641\u0627\u0621\u0629 \u0648\u0641\u0627\u0639\u0644\u064A\u0629", icon: "UserCog", suggestedEvidence: ["\u0633\u062C\u0644 \u0627\u0644\u0645\u062A\u0627\u0628\u0639\u0629 \u0627\u0644\u0633\u0644\u0648\u0643\u064A\u0629", "\u062E\u0637\u0629 \u0627\u0644\u0625\u062F\u0627\u0631\u0629 \u0627\u0644\u0635\u0641\u064A\u0629", "\u062A\u0642\u0627\u0631\u064A\u0631 \u0627\u0644\u0632\u064A\u0627\u0631\u0627\u062A", "\u0645\u0644\u0627\u062D\u0638\u0627\u062A \u0627\u0644\u0645\u0634\u0631\u0641"], examples: ["\u0636\u0628\u0637 \u0627\u0644\u0635\u0641", "\u0625\u062F\u0627\u0631\u0629 \u0627\u0644\u0648\u0642\u062A", "\u0627\u0644\u062A\u0639\u0627\u0645\u0644 \u0645\u0639 \u0627\u0644\u0633\u0644\u0648\u0643"], order: 9 },
      { title: "\u062A\u062D\u0644\u064A\u0644 \u0646\u062A\u0627\u0626\u062C \u0627\u0644\u0645\u062A\u0639\u0644\u0645\u064A\u0646", weight: "10%", description: "\u062A\u062D\u0644\u064A\u0644 \u0646\u062A\u0627\u0626\u062C \u0627\u0644\u0637\u0644\u0627\u0628 \u0648\u0627\u0633\u062A\u062E\u0644\u0627\u0635 \u0627\u0644\u0645\u0624\u0634\u0631\u0627\u062A \u0627\u0644\u062A\u062D\u0633\u064A\u0646\u064A\u0629", icon: "BarChart", suggestedEvidence: ["\u062A\u0642\u0627\u0631\u064A\u0631 \u0627\u0644\u062A\u062D\u0644\u064A\u0644", "\u0627\u0644\u0631\u0633\u0648\u0645 \u0627\u0644\u0628\u064A\u0627\u0646\u064A\u0629", "\u062C\u062F\u0627\u0648\u0644 \u0627\u0644\u0645\u0642\u0627\u0631\u0646\u0629", "\u062E\u0637\u0637 \u0627\u0644\u062A\u062D\u0633\u064A\u0646"], examples: ["\u062A\u062D\u0644\u064A\u0644 \u0625\u062D\u0635\u0627\u0626\u064A \u0644\u0644\u0646\u062A\u0627\u0626\u062C", "\u0631\u0633\u0648\u0645 \u0628\u064A\u0627\u0646\u064A\u0629 \u0645\u0642\u0627\u0631\u0646\u0629", "\u062A\u0642\u0627\u0631\u064A\u0631 \u062A\u0641\u0635\u064A\u0644\u064A\u0629"], order: 10 },
      { title: "\u062A\u0646\u0648\u0639 \u0623\u0633\u0627\u0644\u064A\u0628 \u0627\u0644\u062A\u0642\u0648\u064A\u0645", weight: "10%", description: "\u0627\u0633\u062A\u062E\u062F\u0627\u0645 \u0623\u0633\u0627\u0644\u064A\u0628 \u062A\u0642\u0648\u064A\u0645 \u0645\u062A\u0646\u0648\u0639\u0629 \u0644\u0642\u064A\u0627\u0633 \u062A\u0639\u0644\u0645 \u0627\u0644\u0637\u0644\u0627\u0628", icon: "CheckCircle", suggestedEvidence: ["\u0646\u0645\u0627\u0630\u062C \u0627\u062E\u062A\u0628\u0627\u0631\u0627\u062A", "\u0623\u062F\u0648\u0627\u062A \u062A\u0642\u0648\u064A\u0645 \u0628\u062F\u064A\u0644\u0629", "\u0633\u0644\u0627\u0644\u0645 \u0627\u0644\u062A\u0642\u062F\u064A\u0631", "\u0645\u0644\u0641\u0627\u062A \u0627\u0644\u0625\u0646\u062C\u0627\u0632"], examples: ["\u0627\u062E\u062A\u0628\u0627\u0631\u0627\u062A \u062A\u062D\u0631\u064A\u0631\u064A\u0629", "\u062A\u0642\u0648\u064A\u0645 \u0623\u062F\u0627\u0626\u064A", "\u0645\u0644\u0641 \u0625\u0646\u062C\u0627\u0632 \u0627\u0644\u0637\u0627\u0644\u0628"], order: 11 }
    ];
    for (const item of items) {
      await db.insert(evaluationItems).values(item);
    }
    console.log("Seeded 11 evaluation items");
  }
  async getEvaluationItems() {
    return db.select().from(evaluationItems).orderBy(evaluationItems.order);
  }
  async getTeacherWitnesses(userId) {
    const witnessList = await db.select().from(teacherWitnesses).where(eq2(teacherWitnesses.userId, userId)).orderBy(desc(teacherWitnesses.createdAt));
    const result = [];
    for (const w of witnessList) {
      const files = await db.select().from(witnessFiles).where(eq2(witnessFiles.witnessId, w.id)).orderBy(witnessFiles.order);
      const evalItem = w.evaluationItemId ? (await db.select().from(evaluationItems).where(eq2(evaluationItems.id, w.evaluationItemId)))[0] : void 0;
      result.push({ ...w, files, evaluationItem: evalItem });
    }
    return result;
  }
  async getTeacherWitnessesByItem(userId, evaluationItemId) {
    const witnessList = await db.select().from(teacherWitnesses).where(and(eq2(teacherWitnesses.userId, userId), eq2(teacherWitnesses.evaluationItemId, evaluationItemId))).orderBy(desc(teacherWitnesses.createdAt));
    const result = [];
    for (const w of witnessList) {
      const files = await db.select().from(witnessFiles).where(eq2(witnessFiles.witnessId, w.id)).orderBy(witnessFiles.order);
      const evalItem = w.evaluationItemId ? (await db.select().from(evaluationItems).where(eq2(evaluationItems.id, w.evaluationItemId)))[0] : void 0;
      result.push({ ...w, files, evaluationItem: evalItem });
    }
    return result;
  }
  async createTeacherWitness(data) {
    const [witness] = await db.insert(teacherWitnesses).values(data).returning();
    return witness;
  }
  async deleteTeacherWitness(id) {
    await db.delete(witnessFiles).where(eq2(witnessFiles.witnessId, id));
    await db.delete(teacherWitnesses).where(eq2(teacherWitnesses.id, id));
    return true;
  }
  async createWitnessFile(data) {
    if (data.witnessId) {
      const existingFiles = await db.select({ count: sql2`count(*)` }).from(witnessFiles).where(eq2(witnessFiles.witnessId, data.witnessId));
      if (Number(existingFiles[0]?.count || 0) >= 10) {
        throw new Error("Maximum 10 files per witness");
      }
    }
    const [file] = await db.insert(witnessFiles).values(data).returning();
    return file;
  }
  async deleteWitnessFile(id) {
    await db.delete(witnessFiles).where(eq2(witnessFiles.id, id));
    return true;
  }
  async getTeacherWitnessById(id) {
    const [witness] = await db.select().from(teacherWitnesses).where(eq2(teacherWitnesses.id, id));
    if (!witness) return void 0;
    const files = await db.select().from(witnessFiles).where(eq2(witnessFiles.witnessId, id)).orderBy(witnessFiles.order);
    const evalItem = witness.evaluationItemId ? (await db.select().from(evaluationItems).where(eq2(evaluationItems.id, witness.evaluationItemId)))[0] : void 0;
    return { ...witness, files, evaluationItem: evalItem };
  }
  async getAllTeacherWitnesses() {
    const witnessList = await db.select().from(teacherWitnesses).orderBy(desc(teacherWitnesses.createdAt));
    const result = [];
    for (const w of witnessList) {
      const files = await db.select().from(witnessFiles).where(eq2(witnessFiles.witnessId, w.id)).orderBy(witnessFiles.order);
      const evalItem = w.evaluationItemId ? (await db.select().from(evaluationItems).where(eq2(evaluationItems.id, w.evaluationItemId)))[0] : void 0;
      result.push({ ...w, files, evaluationItem: evalItem });
    }
    return result;
  }
};
var storage = new DatabaseStorage();

// server/replitAuth.ts
import * as client from "openid-client";
import { Strategy } from "openid-client/passport";
import passport from "passport";
import session from "express-session";
import memoize from "memoizee";
import connectPg from "connect-pg-simple";
var getOidcConfig = memoize(
  async () => {
    return await client.discovery(
      new URL(process.env.ISSUER_URL ?? "https://replit.com/oidc"),
      process.env.REPL_ID
    );
  },
  { maxAge: 3600 * 1e3 }
);
function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1e3;
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: "sessions"
  });
  return session({
    secret: process.env.SESSION_SECRET,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: true,
      maxAge: sessionTtl
    }
  });
}
function updateUserSession(user, tokens) {
  user.claims = tokens.claims();
  user.access_token = tokens.access_token;
  user.refresh_token = tokens.refresh_token;
  user.expires_at = user.claims?.exp;
}
async function upsertUser(claims) {
  await storage.upsertUser({
    id: claims["sub"],
    email: claims["email"],
    firstName: claims["first_name"],
    lastName: claims["last_name"],
    profileImageUrl: claims["profile_image_url"]
  });
}
async function setupAuth(app2) {
  app2.set("trust proxy", 1);
  app2.use(getSession());
  app2.use(passport.initialize());
  app2.use(passport.session());
  const config = await getOidcConfig();
  const verify = async (tokens, verified) => {
    const user = {};
    updateUserSession(user, tokens);
    await upsertUser(tokens.claims());
    verified(null, user);
  };
  const registeredStrategies = /* @__PURE__ */ new Set();
  const ensureStrategy = (domain) => {
    const strategyName = `replitauth:${domain}`;
    if (!registeredStrategies.has(strategyName)) {
      const strategy = new Strategy(
        {
          name: strategyName,
          config,
          scope: "openid email profile offline_access",
          callbackURL: `https://${domain}/api/callback`
        },
        verify
      );
      passport.use(strategy);
      registeredStrategies.add(strategyName);
    }
  };
  passport.serializeUser((user, cb) => cb(null, user));
  passport.deserializeUser((user, cb) => cb(null, user));
  app2.get("/api/login", (req, res, next) => {
    ensureStrategy(req.hostname);
    passport.authenticate(`replitauth:${req.hostname}`, {
      prompt: "login consent",
      scope: ["openid", "email", "profile", "offline_access"]
    })(req, res, next);
  });
  app2.get("/api/callback", (req, res, next) => {
    ensureStrategy(req.hostname);
    passport.authenticate(`replitauth:${req.hostname}`, {
      successReturnToOrRedirect: "/",
      failureRedirect: "/api/login"
    })(req, res, next);
  });
  app2.get("/api/logout", (req, res) => {
    req.logout(() => {
      res.redirect(
        client.buildEndSessionUrl(config, {
          client_id: process.env.REPL_ID,
          post_logout_redirect_uri: `${req.protocol}://${req.hostname}`
        }).href
      );
    });
  });
}
var isAuthenticated = async (req, res, next) => {
  const sessionUserId = req.session?.userId;
  if (sessionUserId) {
    return next();
  }
  const user = req.user;
  if (!req.isAuthenticated() || !user.expires_at) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const now = Math.floor(Date.now() / 1e3);
  if (now <= user.expires_at) {
    return next();
  }
  const refreshToken = user.refresh_token;
  if (!refreshToken) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
  try {
    const config = await getOidcConfig();
    const tokenResponse = await client.refreshTokenGrant(config, refreshToken);
    updateUserSession(user, tokenResponse);
    return next();
  } catch (error) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
};
async function getUserIdFromRequest(req) {
  const sessionUserId = req.session?.userId;
  if (sessionUserId) {
    return sessionUserId;
  }
  const user = req.user;
  return user?.claims?.sub || null;
}
var isCreator = async (req, res, next) => {
  const userId = await getUserIdFromRequest(req);
  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  try {
    const dbUser = await storage.getUser(userId);
    if (!dbUser || dbUser.role !== "creator") {
      return res.status(403).json({ message: "Forbidden - Creator access required" });
    }
    return next();
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};
var isPrincipal = async (req, res, next) => {
  const userId = await getUserIdFromRequest(req);
  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  try {
    const dbUser = await storage.getUser(userId);
    if (!dbUser || dbUser.role !== "admin" && dbUser.role !== "creator") {
      return res.status(403).json({ message: "Forbidden - Principal access required" });
    }
    return next();
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

// server/routes.ts
import { randomBytes } from "crypto";

// server/services/notification.ts
import { eq as eq3, desc as desc2 } from "drizzle-orm";
var NotificationService = class {
  static async send(data) {
    try {
      await db.insert(notifications).values(data);
    } catch (error) {
      console.error("Failed to send notification:", error);
    }
  }
  static async getUserNotifications(userId, limit = 20) {
    return await db.query.notifications.findMany({
      where: eq3(notifications.recipientId, userId),
      orderBy: [desc2(notifications.createdAt)],
      limit
    });
  }
  static async markAsRead(notificationId) {
    await db.update(notifications).set({ isRead: true }).where(eq3(notifications.id, notificationId));
  }
};

// server/services/audit.ts
var AuditService = class {
  static async log(data) {
    try {
      await db.insert(auditLogs).values({
        ...data,
        details: data.details ? JSON.stringify(data.details) : null
      });
    } catch (error) {
      console.error("Audit Log Failure:", error);
    }
  }
};

// server/services/email.ts
import { Resend } from "resend";
var EmailService = class {
  resend;
  constructor() {
    const apiKey = process.env.RESEND_API_KEY;
    this.resend = new Resend(apiKey || "missing_key");
  }
  async sendNotification(to, subject, htmlContent) {
    if (!process.env.RESEND_API_KEY) {
      console.warn("\u26A0\uFE0F Skipping email send: RESEND_API_KEY is missing.");
      return;
    }
    try {
      await this.resend.emails.send({
        from: "Mithaq System <notifications@replitapp.com>",
        to,
        subject,
        html: htmlContent
      });
    } catch (error) {
      console.error("\u274C Failed to send email via Resend:", error);
    }
  }
  generateTemplate(title, message, actionUrl) {
    return `
      <div dir="rtl" style="font-family: 'Cairo', 'Tajawal', sans-serif; background-color: #f4f7f6; padding: 40px; text-align: right; border-radius: 8px;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 30px; border-radius: 12px; border-top: 6px solid #006C35; shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <h2 style="color: #006C35; border-bottom: 2px solid #eee; padding-bottom: 15px; font-size: 24px;">${title}</h2>
          <p style="color: #444; font-size: 18px; line-height: 1.8; margin: 20px 0;">${message}</p>
          <div style="text-align: center; margin-top: 35px;">
            <a href="${actionUrl}" style="background-color: #006C35; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block; font-size: 16px;">\u0627\u0644\u062F\u062E\u0648\u0644 \u0625\u0644\u0649 \u0627\u0644\u0646\u0638\u0627\u0645</a>
          </div>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;">
          <p style="color: #777; font-size: 13px; text-align: center;">\u0647\u0630\u0627 \u0628\u0631\u064A\u062F \u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A \u062A\u0644\u0642\u0627\u0626\u064A \u0645\u0646 \u0646\u0638\u0627\u0645 \u0645\u064A\u062B\u0627\u0642 \u0627\u0644\u0623\u062F\u0627\u0621 - \u0648\u0632\u0627\u0631\u0629 \u0627\u0644\u062A\u0639\u0644\u064A\u0645</p>
        </div>
      </div>
    `;
  }
};
var emailService = new EmailService();

// server/routes.ts
import { asc } from "drizzle-orm";
async function registerRoutes(app2) {
  await setupAuth(app2);
  await storage.seedEvaluationItems();
  app2.get("/api/notifications", isAuthenticated, async (req, res) => {
    try {
      const userId = await getUserIdFromRequest(req);
      if (!userId) return res.sendStatus(401);
      const notes = await NotificationService.getUserNotifications(userId);
      res.json(notes);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.post("/api/notifications/:id/mark-read", isAuthenticated, async (req, res) => {
    try {
      const userId = await getUserIdFromRequest(req);
      if (!userId) return res.sendStatus(401);
      await NotificationService.markAsRead(parseInt(req.params.id));
      res.sendStatus(200);
    } catch (error) {
      console.error("Error marking notification read:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/cycles", isAuthenticated, async (req, res) => {
    try {
      const cycles = await CycleService.getAllCycles();
      res.json(cycles);
    } catch (error) {
      console.error("Error fetching cycles:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.post("/api/cycles/:id/activate", isAuthenticated, isPrincipal, async (req, res) => {
    try {
      await CycleService.setActiveCycle(parseInt(req.params.id));
      res.json({ success: true });
    } catch (error) {
      console.error("Error activating cycle:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.post("/api/auth/login", async (req, res) => {
    try {
      const { role, password } = req.body;
      if (!role || !["teacher", "admin", "creator"].includes(role)) {
        return res.status(400).json({ message: "Invalid role" });
      }
      if (role === "teacher") {
        const { nationalId, mobileNumber } = req.body;
        if (!nationalId || typeof nationalId !== "string" || nationalId.trim().length < 5) {
          return res.status(400).json({ message: "\u064A\u0631\u062C\u0649 \u0625\u062F\u062E\u0627\u0644 \u0631\u0642\u0645 \u0627\u0644\u0633\u062C\u0644 \u0627\u0644\u0645\u062F\u0646\u064A" });
        }
        const trimmedNationalId = nationalId.trim();
        let existingTeacher = await storage.findUserByNationalId(trimmedNationalId);
        if (existingTeacher) {
          if (!existingTeacher.mobileNumber) {
            req.session.userId = existingTeacher.id;
            req.session.userRole = "teacher";
            await new Promise((resolve, reject) => {
              req.session.save((err) => {
                if (err) reject(err);
                else resolve();
              });
            });
            return res.json({ success: true, user: existingTeacher });
          }
          if (!mobileNumber || existingTeacher.mobileNumber !== mobileNumber.trim()) {
            return res.status(401).json({ message: "\u0631\u0642\u0645 \u0627\u0644\u062C\u0648\u0627\u0644 \u063A\u064A\u0631 \u0635\u062D\u064A\u062D" });
          }
          req.session.userId = existingTeacher.id;
          req.session.userRole = existingTeacher.role || "teacher";
          await new Promise((resolve, reject) => {
            req.session.save((err) => {
              if (err) reject(err);
              else resolve();
            });
          });
          return res.json({ success: true, user: existingTeacher });
        }
        const uniqueId = `teacher_${randomBytes(8).toString("hex")}`;
        const newTeacher = await storage.upsertUser({
          id: uniqueId,
          nationalId: trimmedNationalId,
          email: `${uniqueId}@school.local`,
          role: "teacher",
          schoolName: "\u0632\u064A\u062F \u0628\u0646 \u062B\u0627\u0628\u062A \u0627\u0644\u0627\u0628\u062A\u062F\u0627\u0626\u064A\u0629",
          principalName: "\u0632\u064A\u0627\u062F \u0639\u0628\u062F\u0627\u0644\u0645\u062D\u0633\u0646 \u0627\u0644\u0639\u062A\u064A\u0628\u064A"
        });
        await storage.seedDefaultIndicators(newTeacher.id);
        req.session.userId = newTeacher.id;
        req.session.userRole = "teacher";
        await new Promise((resolve, reject) => {
          req.session.save((err) => {
            if (err) reject(err);
            else resolve();
          });
        });
        return res.json({ success: true, user: newTeacher, isNew: true });
      }
      if (role === "admin") {
        const adminPassword = process.env.ADMIN_PASSWORD;
        if (!adminPassword) {
          return res.status(500).json({ message: "\u0644\u0645 \u064A\u062A\u0645 \u062A\u0639\u064A\u064A\u0646 \u0627\u0644\u0631\u0642\u0645 \u0627\u0644\u0633\u0631\u064A \u0644\u0644\u0645\u062F\u064A\u0631" });
        }
        if (password !== adminPassword) {
          return res.status(401).json({ message: "\u0627\u0644\u0631\u0642\u0645 \u0627\u0644\u0633\u0631\u064A \u063A\u064A\u0631 \u0635\u062D\u064A\u062D" });
        }
        let adminUser = await storage.findUserByRole("admin");
        if (!adminUser) {
          const uniqueId = `admin_${randomBytes(8).toString("hex")}`;
          adminUser = await storage.upsertUser({
            id: uniqueId,
            firstName: "zayd",
            lastName: "",
            email: `admin@school.local`,
            role: "admin",
            schoolName: "",
            principalName: "zayd"
          });
        }
        req.session.userId = adminUser.id;
        req.session.userRole = "admin";
        await new Promise((resolve, reject) => {
          req.session.save((err) => {
            if (err) reject(err);
            else resolve();
          });
        });
        return res.json({ success: true, user: adminUser });
      }
      if (role === "creator") {
        const creatorPassword = process.env.CREATOR_PASSWORD;
        if (!creatorPassword) {
          return res.status(500).json({ message: "\u0644\u0645 \u064A\u062A\u0645 \u062A\u0639\u064A\u064A\u0646 \u0627\u0644\u0631\u0642\u0645 \u0627\u0644\u0633\u0631\u064A \u0644\u0645\u0646\u0634\u0626 \u0627\u0644\u0645\u0648\u0642\u0639" });
        }
        if (password !== creatorPassword) {
          return res.status(401).json({ message: "\u0627\u0644\u0631\u0642\u0645 \u0627\u0644\u0633\u0631\u064A \u063A\u064A\u0631 \u0635\u062D\u064A\u062D" });
        }
        let creatorUser = await storage.findUserByRole("creator");
        if (!creatorUser) {
          const uniqueId = `creator_${randomBytes(8).toString("hex")}`;
          creatorUser = await storage.upsertUser({
            id: uniqueId,
            firstName: "zayd",
            lastName: "",
            email: `creator@school.local`,
            role: "creator"
          });
        }
        req.session.userId = creatorUser.id;
        req.session.userRole = "creator";
        await new Promise((resolve, reject) => {
          req.session.save((err) => {
            if (err) reject(err);
            else resolve();
          });
        });
        return res.json({ success: true, user: creatorUser });
      }
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "\u062D\u062F\u062B \u062E\u0637\u0623 \u0623\u062B\u0646\u0627\u0621 \u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062F\u062E\u0648\u0644" });
    }
  });
  app2.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        console.error("Logout error:", err);
        return res.status(500).json({ message: "\u062D\u062F\u062B \u062E\u0637\u0623 \u0623\u062B\u0646\u0627\u0621 \u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062E\u0631\u0648\u062C" });
      }
      res.clearCookie("connect.sid");
      res.json({ success: true });
    });
  });
  app2.get("/api/user", async (req, res) => {
    try {
      const sessionUserId = req.session?.userId;
      if (sessionUserId) {
        const dbUser2 = await storage.getUser(sessionUserId);
        return res.json(dbUser2);
      }
      const user = req.user;
      if (!req.isAuthenticated() || !user?.claims?.sub) {
        return res.json(null);
      }
      const dbUser = await storage.getUser(user.claims.sub);
      res.json(dbUser);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.post("/api/onboarding", isAuthenticated, async (req, res) => {
    try {
      const userId = await getUserIdFromRequest(req);
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const { fullNameArabic, jobNumber, specialization, schoolName, educationDepartment, educationalLevel, subject, mobileNumber, nationalId } = req.body;
      if (!fullNameArabic || !jobNumber || !specialization || !schoolName || !educationDepartment || !subject || !mobileNumber) {
        return res.status(400).json({ message: "\u062C\u0645\u064A\u0639 \u0627\u0644\u062D\u0642\u0648\u0644 \u0645\u0637\u0644\u0648\u0628\u0629" });
      }
      if (!/^\d{4,}$/.test(jobNumber)) {
        return res.status(400).json({ message: "\u0627\u0644\u0631\u0642\u0645 \u0627\u0644\u0648\u0638\u064A\u0641\u064A \u064A\u062C\u0628 \u0623\u0646 \u064A\u0643\u0648\u0646 \u0631\u0642\u0645\u064A\u0627\u064B" });
      }
      if (!nationalId || !/^\d{5,20}$/.test(nationalId)) {
        return res.status(400).json({ message: "\u0631\u0642\u0645 \u0627\u0644\u0633\u062C\u0644 \u0627\u0644\u0645\u062F\u0646\u064A \u0645\u0637\u0644\u0648\u0628 \u0648\u064A\u062C\u0628 \u0623\u0646 \u064A\u0643\u0648\u0646 \u0631\u0642\u0645\u064A\u0627\u064B (5 \u0623\u0631\u0642\u0627\u0645 \u0639\u0644\u0649 \u0627\u0644\u0623\u0642\u0644)" });
      }
      const existingByNationalId = await storage.findUserByNationalId(nationalId);
      if (existingByNationalId && existingByNationalId.id !== userId) {
        return res.status(409).json({ message: "\u0631\u0642\u0645 \u0627\u0644\u0633\u062C\u0644 \u0627\u0644\u0645\u062F\u0646\u064A \u0645\u0633\u062C\u0644 \u0645\u0633\u0628\u0642\u0627\u064B\u060C \u064A\u0631\u062C\u0649 \u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062F\u062E\u0648\u0644" });
      }
      const nameParts = fullNameArabic.trim().split(" ");
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(" ");
      const profileData = {
        fullNameArabic,
        firstName,
        lastName,
        jobNumber,
        specialization,
        schoolName,
        educationDepartment,
        educationalLevel,
        subject,
        nationalId,
        onboardingCompleted: true
      };
      if (mobileNumber) {
        if (!/^05\d{8}$/.test(mobileNumber)) {
          return res.status(400).json({ message: "\u0631\u0642\u0645 \u0627\u0644\u062C\u0648\u0627\u0644 \u064A\u062C\u0628 \u0623\u0646 \u064A\u0628\u062F\u0623 \u0628\u0640 05 \u0648\u064A\u062A\u0643\u0648\u0646 \u0645\u0646 10 \u0623\u0631\u0642\u0627\u0645" });
        }
        const existingUser = await storage.findUserByMobile(mobileNumber);
        if (existingUser && existingUser.id !== userId) {
          await storage.updateUser(existingUser.id, profileData);
          req.session.userId = existingUser.id;
          req.session.userRole = existingUser.role || "teacher";
          await storage.deleteUser(userId);
          await new Promise((resolve, reject) => {
            req.session.save((err) => {
              if (err) reject(err);
              else resolve();
            });
          });
          return res.json(existingUser);
        }
        profileData.mobileNumber = mobileNumber;
      }
      const updated = await storage.updateUser(userId, profileData);
      if (!updated) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(updated);
    } catch (error) {
      console.error("Error in onboarding:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.patch("/api/user", isAuthenticated, async (req, res) => {
    try {
      const userId = await getUserIdFromRequest(req);
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const { firstName, lastName, fullNameArabic, jobNumber, specialization, educationalLevel, schoolName, educationDepartment, subject, yearsOfService, contactEmail, principalName, mobileNumber } = req.body;
      const updateData = {};
      if (firstName !== void 0) updateData.firstName = firstName;
      if (lastName !== void 0) updateData.lastName = lastName;
      if (fullNameArabic !== void 0) updateData.fullNameArabic = fullNameArabic;
      if (jobNumber !== void 0) updateData.jobNumber = jobNumber;
      if (specialization !== void 0) updateData.specialization = specialization;
      if (educationalLevel !== void 0) updateData.educationalLevel = educationalLevel;
      if (schoolName !== void 0) updateData.schoolName = schoolName;
      if (educationDepartment !== void 0) updateData.educationDepartment = educationDepartment;
      if (subject !== void 0) updateData.subject = subject;
      if (yearsOfService !== void 0) updateData.yearsOfService = yearsOfService;
      if (contactEmail !== void 0) updateData.contactEmail = contactEmail;
      if (principalName !== void 0) updateData.principalName = principalName;
      if (mobileNumber !== void 0) updateData.mobileNumber = mobileNumber;
      const updated = await storage.updateUser(userId, updateData);
      if (!updated) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(updated);
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/stats", isAuthenticated, async (req, res) => {
    try {
      const userId = await getUserIdFromRequest(req);
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const stats = await storage.getStats(userId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching stats:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/indicators", isAuthenticated, async (req, res) => {
    try {
      const userId = await getUserIdFromRequest(req);
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const indicators2 = await storage.getIndicators(userId);
      const stripped = indicators2.map((ind) => ({
        ...ind,
        witnesses: ind.witnesses?.map((w) => ({ id: w.id, fileType: w.fileType, title: w.title, link: w.link }))
      }));
      res.json(stripped);
    } catch (error) {
      console.error("Error fetching indicators:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.post("/api/indicators", isAuthenticated, async (req, res) => {
    try {
      const userId = await getUserIdFromRequest(req);
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const { title, description, criteria: criteriaList, type, weight, domain, targetOutput } = req.body;
      const indicator = await storage.createIndicator({
        title,
        description,
        type: type || "goal",
        weight: weight || 0,
        domain: domain || null,
        targetOutput: targetOutput || null,
        userId,
        status: "pending"
      });
      if (criteriaList && Array.isArray(criteriaList)) {
        for (let i = 0; i < criteriaList.length; i++) {
          const criteriaTitle = criteriaList[i];
          if (criteriaTitle && typeof criteriaTitle === "string") {
            await storage.createCriteria({
              title: criteriaTitle,
              indicatorId: indicator.id,
              order: i + 1
            });
          }
        }
      }
      const fullIndicator = await storage.getIndicator(indicator.id);
      res.json(fullIndicator);
    } catch (error) {
      console.error("Error creating indicator:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/indicators/:id", isAuthenticated, async (req, res) => {
    try {
      const userId = await getUserIdFromRequest(req);
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const indicator = await storage.getIndicator(req.params.id);
      if (!indicator) {
        return res.status(404).json({ message: "Indicator not found" });
      }
      if (indicator.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      res.json(indicator);
    } catch (error) {
      console.error("Error fetching indicator:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.patch("/api/indicators/:id", isAuthenticated, async (req, res) => {
    try {
      const userId = await getUserIdFromRequest(req);
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const indicator = await storage.getIndicator(req.params.id);
      if (!indicator) {
        return res.status(404).json({ message: "Indicator not found" });
      }
      if (indicator.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      const { title, description, status, order, type, weight, domain, targetOutput } = req.body;
      const safeUpdate = {};
      if (title !== void 0) safeUpdate.title = title;
      if (description !== void 0) safeUpdate.description = description;
      if (status !== void 0) safeUpdate.status = status;
      if (order !== void 0) safeUpdate.order = order;
      if (type !== void 0) safeUpdate.type = type;
      if (weight !== void 0) safeUpdate.weight = weight;
      if (domain !== void 0) safeUpdate.domain = domain;
      if (targetOutput !== void 0) safeUpdate.targetOutput = targetOutput;
      const updated = await storage.updateIndicator(req.params.id, safeUpdate);
      res.json(updated);
    } catch (error) {
      console.error("Error updating indicator:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.delete("/api/indicators/:id", isAuthenticated, async (req, res) => {
    try {
      const userId = await getUserIdFromRequest(req);
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const indicator = await storage.getIndicator(req.params.id);
      if (!indicator) {
        return res.status(404).json({ message: "Indicator not found" });
      }
      if (indicator.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      await storage.deleteIndicator(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting indicator:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.patch("/api/indicators/:indicatorId/criteria/:criteriaId", isAuthenticated, async (req, res) => {
    try {
      const userId = await getUserIdFromRequest(req);
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const indicator = await storage.getIndicator(req.params.indicatorId);
      if (!indicator) {
        return res.status(404).json({ message: "Indicator not found" });
      }
      if (indicator.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      const criterion = await storage.getCriteriaById(req.params.criteriaId);
      if (!criterion) {
        return res.status(404).json({ message: "Criteria not found" });
      }
      if (criterion.indicatorId !== req.params.indicatorId) {
        return res.status(403).json({ message: "Criteria does not belong to this indicator" });
      }
      const { isCompleted } = req.body;
      const updated = await storage.updateCriteria(req.params.criteriaId, { isCompleted });
      const allCriteria = await storage.getCriteria(req.params.indicatorId);
      const allCompleted = allCriteria.every((c) => c.isCompleted);
      const anyCompleted = allCriteria.some((c) => c.isCompleted);
      let status = "pending";
      if (allCompleted) {
        status = "completed";
      } else if (anyCompleted) {
        status = "in_progress";
      }
      await storage.updateIndicator(req.params.indicatorId, { status });
      res.json(updated);
    } catch (error) {
      console.error("Error updating criteria:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/indicators/:id/witnesses", isAuthenticated, async (req, res) => {
    try {
      const userId = await getUserIdFromRequest(req);
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const indicator = await storage.getIndicator(req.params.id);
      if (!indicator) {
        return res.status(404).json({ message: "Indicator not found" });
      }
      if (indicator.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      const witnesses2 = await storage.getWitnesses(req.params.id);
      res.json(witnesses2);
    } catch (error) {
      console.error("Error fetching witnesses:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.post("/api/indicators/:id/witnesses", isAuthenticated, async (req, res) => {
    try {
      const userId = await getUserIdFromRequest(req);
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const indicator = await storage.getIndicator(req.params.id);
      if (!indicator) {
        return res.status(404).json({ message: "Indicator not found" });
      }
      if (indicator.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      const { description, link } = req.body;
      const { title, criteriaId, fileType, fileData, fileName } = req.body;
      if (fileData && fileData.length > 2 * 1024 * 1024 * 1.37) {
        return res.status(400).json({ message: "\u062D\u062C\u0645 \u0627\u0644\u0645\u0644\u0641 \u0643\u0628\u064A\u0631 \u062C\u062F\u0627\u064B (\u0627\u0644\u062D\u062F \u0627\u0644\u0623\u0642\u0635\u0649 2 \u0645\u064A\u062C\u0627\u0628\u0627\u064A\u062A)" });
      }
      if (!fileData && !link) {
        return res.status(400).json({ message: "\u064A\u062C\u0628 \u0627\u062E\u062A\u064A\u0627\u0631 \u0645\u0644\u0641 \u0623\u0648 \u0625\u0636\u0627\u0641\u0629 \u0631\u0627\u0628\u0637" });
      }
      if (criteriaId) {
        const criterion = await storage.getCriteriaById(criteriaId);
        if (!criterion) {
          return res.status(404).json({ message: "Criteria not found" });
        }
        if (criterion.indicatorId !== req.params.id) {
          return res.status(400).json({ message: "Criteria does not belong to this indicator" });
        }
      }
      const witness = await storage.createWitness({
        title,
        description,
        indicatorId: req.params.id,
        criteriaId,
        fileType,
        fileUrl: fileData,
        // Storing Data URI directly in database
        fileName,
        link,
        userId
      });
      res.json(witness);
    } catch (error) {
      console.error("Error creating witness:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.delete("/api/witnesses/:id", isAuthenticated, async (req, res) => {
    try {
      const userId = await getUserIdFromRequest(req);
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const witness = await storage.getWitnessById(req.params.id);
      if (!witness) {
        return res.status(404).json({ message: "Witness not found" });
      }
      if (witness.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      await storage.deleteWitness(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting witness:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/strategies", isAuthenticated, async (req, res) => {
    try {
      const strategies2 = await storage.getStrategies();
      res.json(strategies2);
    } catch (error) {
      console.error("Error fetching strategies:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/user-strategies", isAuthenticated, async (req, res) => {
    try {
      const userId = await getUserIdFromRequest(req);
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const strategies2 = await storage.getUserStrategies(userId);
      res.json(strategies2);
    } catch (error) {
      console.error("Error fetching user strategies:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.post("/api/user-strategies", isAuthenticated, async (req, res) => {
    try {
      const userId = await getUserIdFromRequest(req);
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const { strategyIds } = req.body;
      if (!Array.isArray(strategyIds)) {
        return res.status(400).json({ message: "strategyIds must be an array" });
      }
      await storage.setUserStrategies(userId, strategyIds);
      const strategies2 = await storage.getUserStrategies(userId);
      res.json(strategies2);
    } catch (error) {
      console.error("Error setting user strategies:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/capabilities", isAuthenticated, async (req, res) => {
    try {
      const capabilities2 = await storage.getCapabilities();
      res.json(capabilities2);
    } catch (error) {
      console.error("Error fetching capabilities:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/changes", isAuthenticated, async (req, res) => {
    try {
      const changes2 = await storage.getChanges();
      res.json(changes2);
    } catch (error) {
      console.error("Error fetching changes:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.post("/api/indicators/re-evaluate", isAuthenticated, async (req, res) => {
    try {
      const userId = await getUserIdFromRequest(req);
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const { indicatorIds } = req.body;
      if (!Array.isArray(indicatorIds) || indicatorIds.length === 0) {
        return res.status(400).json({ message: "indicatorIds must be a non-empty array" });
      }
      for (const id of indicatorIds) {
        const indicator = await storage.getIndicator(id);
        if (!indicator) {
          return res.status(404).json({ message: `Indicator ${id} not found` });
        }
        if (indicator.userId !== userId) {
          return res.status(403).json({ message: "Access denied" });
        }
      }
      await storage.reEvaluateIndicators(indicatorIds);
      res.json({ success: true });
    } catch (error) {
      console.error("Error re-evaluating indicators:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.post("/api/signatures", isAuthenticated, async (req, res) => {
    try {
      const userId = await getUserIdFromRequest(req);
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const { indicatorId } = req.body;
      if (!indicatorId) {
        return res.status(400).json({ message: "indicatorId is required" });
      }
      const indicator = await storage.getIndicator(indicatorId);
      if (!indicator) {
        return res.status(404).json({ message: "Indicator not found" });
      }
      if (indicator.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      const signature = await storage.createSignature({
        indicatorId,
        teacherId: userId,
        status: "pending"
      });
      res.json(signature);
    } catch (error) {
      console.error("Error creating signature:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/my-signatures", isAuthenticated, async (req, res) => {
    try {
      const userId = await getUserIdFromRequest(req);
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const signatures2 = await storage.getSignaturesByTeacher(userId);
      res.json(signatures2);
    } catch (error) {
      console.error("Error fetching signatures:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/principal/stats", isAuthenticated, isPrincipal, async (req, res) => {
    try {
      const stats = await storage.getPrincipalStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching principal stats:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/principal/teachers", isAuthenticated, isPrincipal, async (req, res) => {
    try {
      const teachers = await storage.getAllTeachers();
      res.json(teachers);
    } catch (error) {
      console.error("Error fetching teachers:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/principal/teachers/:teacherId/indicators", isAuthenticated, isPrincipal, async (req, res) => {
    try {
      const indicators2 = await storage.getIndicators(req.params.teacherId);
      const stripped = indicators2.map((ind) => ({
        ...ind,
        witnesses: ind.witnesses?.map((w) => ({ id: w.id, fileType: w.fileType, title: w.title, link: w.link }))
      }));
      res.json(stripped);
    } catch (error) {
      console.error("Error fetching teacher indicators:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/principal/indicators/:indicatorId/witnesses", isAuthenticated, isPrincipal, async (req, res) => {
    try {
      const witnesses2 = await storage.getWitnesses(req.params.indicatorId);
      res.json(witnesses2);
    } catch (error) {
      console.error("Error fetching indicator witnesses:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/principal/pending-signatures", isAuthenticated, isPrincipal, async (req, res) => {
    try {
      const signatures2 = await storage.getPendingSignatures();
      res.json(signatures2);
    } catch (error) {
      console.error("Error fetching pending signatures:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/principal/export-csv", isAuthenticated, isPrincipal, async (req, res) => {
    try {
      const teachers = await storage.getAllTeachers();
      const csvRows = [
        ["\u0627\u0644\u0631\u0642\u0645 \u0627\u0644\u0648\u0638\u064A\u0641\u064A", "\u0627\u0644\u0627\u0633\u0645 \u0627\u0644\u0643\u0627\u0645\u0644", "\u0627\u0644\u062A\u062E\u0635\u0635", "\u0639\u062F\u062F \u0627\u0644\u0645\u0624\u0634\u0631\u0627\u062A", "\u0627\u0644\u0645\u0624\u0634\u0631\u0627\u062A \u0627\u0644\u0645\u0643\u062A\u0645\u0644\u0629", "\u0628\u0627\u0646\u062A\u0638\u0627\u0631 \u0627\u0644\u0627\u0639\u062A\u0645\u0627\u062F"]
        // Header in Arabic
      ];
      for (const t of teachers) {
        csvRows.push([
          t.jobNumber || "\u063A\u064A\u0631 \u0645\u062D\u062F\u062F",
          t.fullNameArabic || `${t.firstName} ${t.lastName}`,
          t.specialization || "\u063A\u064A\u0631 \u0645\u062D\u062F\u062F",
          t.indicatorCount.toString(),
          t.completedCount.toString(),
          t.pendingApprovalCount.toString()
        ]);
      }
      const csvContent = csvRows.map(
        (row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(",")
      ).join("\n");
      res.header("Content-Type", "text/csv; charset=utf-8");
      res.header("Content-Disposition", "attachment; filename=school_performance_report.csv");
      res.send("\uFEFF" + csvContent);
    } catch (error) {
      console.error("Error exporting CSV:", error);
      res.status(500).json({ message: "\u062D\u062F\u062B \u062E\u0637\u0623 \u0623\u062B\u0646\u0627\u0621 \u062A\u0635\u062F\u064A\u0631 \u0627\u0644\u062A\u0642\u0631\u064A\u0631" });
    }
  });
  app2.post("/api/principal/signatures/:id/approve", isAuthenticated, isPrincipal, async (req, res) => {
    try {
      const principalId = await getUserIdFromRequest(req);
      if (!principalId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const { notes } = req.body;
      const signatureId = req.params.id;
      const signature = await storage.approveSignature(signatureId, principalId, notes);
      if (!signature) {
        return res.status(404).json({ message: "Signature not found" });
      }
      const teacher = await storage.getUser(signature.teacherId);
      if (teacher && teacher.contactEmail) {
        const html = emailService.generateTemplate(
          "\u062A\u0645 \u0627\u0639\u062A\u0645\u0627\u062F \u0645\u064A\u062B\u0627\u0642 \u0627\u0644\u0623\u062F\u0627\u0621 \u0627\u0644\u0648\u0638\u064A\u0641\u064A",
          "\u062A\u0647\u0627\u0646\u064A\u0646\u0627\u060C \u0642\u0627\u0645 \u0645\u062F\u064A\u0631 \u0627\u0644\u0645\u062F\u0631\u0633\u0629 \u0628\u0627\u0639\u062A\u0645\u0627\u062F \u0627\u0644\u0634\u0648\u0627\u0647\u062F \u0648\u0627\u0644\u0645\u0624\u0634\u0631\u0627\u062A \u0627\u0644\u062E\u0627\u0635\u0629 \u0628\u0643.",
          `${req.protocol}://${req.get("host")}/home`
        );
        await emailService.sendNotification(teacher.contactEmail, "\u062A\u0645 \u0627\u0639\u062A\u0645\u0627\u062F \u0645\u064A\u062B\u0627\u0642 \u0627\u0644\u0623\u062F\u0627\u0621 \u0627\u0644\u0648\u0638\u064A\u0641\u064A", html);
      }
      await AuditService.log({
        userId: principalId,
        action: "APPROVE",
        entityType: "signature",
        entityId: signatureId,
        details: { notes },
        ipAddress: req.ip
      });
      await NotificationService.send({
        recipientId: signature.teacherId,
        type: "success",
        title: "\u062A\u0645 \u0627\u0639\u062A\u0645\u0627\u062F \u0627\u0644\u0645\u064A\u062B\u0627\u0642",
        message: "\u0642\u0627\u0645 \u0645\u062F\u064A\u0631 \u0627\u0644\u0645\u062F\u0631\u0633\u0629 \u0628\u0627\u0639\u062A\u0645\u0627\u062F \u0645\u064A\u062B\u0627\u0642 \u0627\u0644\u0623\u062F\u0627\u0621 \u0627\u0644\u062E\u0627\u0635 \u0628\u0643.",
        link: "/home"
      });
      res.json(signature);
    } catch (error) {
      console.error("Error approving signature:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.post("/api/principal/signatures/:id/reject", isAuthenticated, isPrincipal, async (req, res) => {
    try {
      const principalId = await getUserIdFromRequest(req);
      if (!principalId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const { notes } = req.body;
      const signatureId = req.params.id;
      if (!notes) {
        return res.status(400).json({ message: "Notes are required when rejecting" });
      }
      const signature = await storage.rejectSignature(signatureId, principalId, notes);
      if (!signature) {
        return res.status(404).json({ message: "Signature not found" });
      }
      const teacher = await storage.getUser(signature.teacherId);
      if (teacher && teacher.contactEmail) {
        const html = emailService.generateTemplate(
          "\u062A\u0646\u0628\u064A\u0647: \u0645\u064A\u062B\u0627\u0642 \u0627\u0644\u0623\u062F\u0627\u0621 \u0628\u062D\u0627\u062C\u0629 \u0644\u0644\u062A\u0639\u062F\u064A\u0644",
          `\u0642\u0627\u0645 \u0627\u0644\u0645\u062F\u064A\u0631 \u0628\u0625\u0639\u0627\u062F\u0629 \u0627\u0644\u0645\u064A\u062B\u0627\u0642 \u0644\u0644\u0645\u0631\u0627\u062C\u0639\u0629. \u0627\u0644\u0645\u0644\u0627\u062D\u0638\u0627\u062A: ${notes}`,
          `${req.protocol}://${req.get("host")}/home`
        );
        await emailService.sendNotification(teacher.contactEmail, "\u062A\u0646\u0628\u064A\u0647: \u0645\u064A\u062B\u0627\u0642 \u0627\u0644\u0623\u062F\u0627\u0621 \u0628\u062D\u0627\u062C\u0629 \u0644\u0644\u062A\u0639\u062F\u064A\u0644", html);
      }
      await AuditService.log({
        userId: principalId,
        action: "REJECT",
        entityType: "signature",
        entityId: signatureId,
        details: { reason: notes },
        ipAddress: req.ip
      });
      await NotificationService.send({
        recipientId: signature.teacherId,
        type: "error",
        title: "\u062A\u0645 \u0631\u0641\u0636 \u0627\u0644\u0645\u064A\u062B\u0627\u0642",
        message: `\u062A\u0645 \u0625\u0639\u0627\u062F\u0629 \u0627\u0644\u0645\u064A\u062B\u0627\u0642 \u0644\u0644\u0645\u0631\u0627\u062C\u0639\u0629. \u0627\u0644\u0633\u0628\u0628: ${notes}`,
        link: "/home"
      });
      res.json(signature);
    } catch (error) {
      console.error("Error rejecting signature:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.patch("/api/principal/users/:userId/role", isAuthenticated, isPrincipal, async (req, res) => {
    try {
      const { role } = req.body;
      if (!role || !["admin", "supervisor", "teacher"].includes(role)) {
        return res.status(400).json({ message: "Invalid role" });
      }
      const updated = await storage.updateUser(req.params.userId, { role });
      if (!updated) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(updated);
    } catch (error) {
      console.error("Error updating user role:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/creator/users", isAuthenticated, isCreator, async (req, res) => {
    try {
      const allUsers = await storage.getAllUsers();
      res.json(allUsers);
    } catch (error) {
      console.error("Error fetching all users:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.patch("/api/creator/users/:userId/role", isAuthenticated, isCreator, async (req, res) => {
    try {
      const { role } = req.body;
      if (!role || !["creator", "admin", "supervisor", "teacher"].includes(role)) {
        return res.status(400).json({ message: "Invalid role" });
      }
      const updated = await storage.updateUserRole(req.params.userId, role);
      if (!updated) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(updated);
    } catch (error) {
      console.error("Error updating user role:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/creator/stats", isAuthenticated, isCreator, async (req, res) => {
    try {
      const allUsers = await storage.getAllUsers();
      const stats = {
        totalUsers: allUsers.length,
        creators: allUsers.filter((u) => u.role === "creator").length,
        admins: allUsers.filter((u) => u.role === "admin").length,
        supervisors: allUsers.filter((u) => u.role === "supervisor").length,
        teachers: allUsers.filter((u) => u.role === "teacher").length
      };
      res.json(stats);
    } catch (error) {
      console.error("Error fetching creator stats:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.delete("/api/principal/teachers/:userId", isAuthenticated, isPrincipal, async (req, res) => {
    try {
      const targetUser = await storage.getUser(req.params.userId);
      if (!targetUser) {
        return res.status(404).json({ message: "\u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F" });
      }
      if (targetUser.role !== "teacher") {
        return res.status(403).json({ message: "\u0644\u0627 \u064A\u0645\u0643\u0646 \u062D\u0630\u0641 \u0647\u0630\u0627 \u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645" });
      }
      await storage.deleteUser(req.params.userId);
      res.json({ success: true, message: "\u062A\u0645 \u062D\u0630\u0641 \u0627\u0644\u0645\u0639\u0644\u0645 \u0628\u0646\u062C\u0627\u062D" });
    } catch (error) {
      console.error("Error deleting teacher:", error);
      res.status(500).json({ message: "\u062D\u062F\u062B \u062E\u0637\u0623 \u0623\u062B\u0646\u0627\u0621 \u062D\u0630\u0641 \u0627\u0644\u0645\u0639\u0644\u0645" });
    }
  });
  app2.patch("/api/principal/teachers/:userId/password", isAuthenticated, isPrincipal, async (req, res) => {
    try {
      const { password } = req.body;
      if (!password || password.length < 4) {
        return res.status(400).json({ message: "\u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631 \u064A\u062C\u0628 \u0623\u0646 \u062A\u0643\u0648\u0646 4 \u0623\u062D\u0631\u0641 \u0639\u0644\u0649 \u0627\u0644\u0623\u0642\u0644" });
      }
      const targetUser = await storage.getUser(req.params.userId);
      if (!targetUser) {
        return res.status(404).json({ message: "\u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F" });
      }
      if (targetUser.role !== "teacher") {
        return res.status(403).json({ message: "\u0644\u0627 \u064A\u0645\u0643\u0646 \u062A\u063A\u064A\u064A\u0631 \u0643\u0644\u0645\u0629 \u0645\u0631\u0648\u0631 \u0647\u0630\u0627 \u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645" });
      }
      const updated = await storage.updateUserPassword(req.params.userId, password);
      res.json({ success: true, message: "\u062A\u0645 \u062A\u063A\u064A\u064A\u0631 \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631 \u0628\u0646\u062C\u0627\u062D" });
    } catch (error) {
      console.error("Error changing password:", error);
      res.status(500).json({ message: "\u062D\u062F\u062B \u062E\u0637\u0623 \u0623\u062B\u0646\u0627\u0621 \u062A\u063A\u064A\u064A\u0631 \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631" });
    }
  });
  app2.delete("/api/creator/users/:userId", isAuthenticated, isCreator, async (req, res) => {
    try {
      const currentUserId = await getUserIdFromRequest(req);
      if (req.params.userId === currentUserId) {
        return res.status(403).json({ message: "\u0644\u0627 \u064A\u0645\u0643\u0646\u0643 \u062D\u0630\u0641 \u062D\u0633\u0627\u0628\u0643 \u0627\u0644\u062E\u0627\u0635" });
      }
      const targetUser = await storage.getUser(req.params.userId);
      if (!targetUser) {
        return res.status(404).json({ message: "\u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F" });
      }
      await storage.deleteUser(req.params.userId);
      res.json({ success: true, message: "\u062A\u0645 \u062D\u0630\u0641 \u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645 \u0628\u0646\u062C\u0627\u062D" });
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ message: "\u062D\u062F\u062B \u062E\u0637\u0623 \u0623\u062B\u0646\u0627\u0621 \u062D\u0630\u0641 \u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645" });
    }
  });
  app2.patch("/api/creator/users/:userId/password", isAuthenticated, isCreator, async (req, res) => {
    try {
      const { password } = req.body;
      if (!password || password.length < 4) {
        return res.status(400).json({ message: "\u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631 \u064A\u062C\u0628 \u0623\u0646 \u062A\u0643\u0648\u0646 4 \u0623\u062D\u0631\u0641 \u0639\u0644\u0649 \u0627\u0644\u0623\u0642\u0644" });
      }
      const targetUser = await storage.getUser(req.params.userId);
      if (!targetUser) {
        return res.status(404).json({ message: "\u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F" });
      }
      const updated = await storage.updateUserPassword(req.params.userId, password);
      res.json({ success: true, message: "\u062A\u0645 \u062A\u063A\u064A\u064A\u0631 \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631 \u0628\u0646\u062C\u0627\u062D" });
    } catch (error) {
      console.error("Error changing password:", error);
      res.status(500).json({ message: "\u062D\u062F\u062B \u062E\u0637\u0623 \u0623\u062B\u0646\u0627\u0621 \u062A\u063A\u064A\u064A\u0631 \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631" });
    }
  });
  app2.get("/api/standards", isAuthenticated, async (req, res) => {
    try {
      const standards = await db.select().from(performanceStandards).orderBy(asc(performanceStandards.order));
      res.json(standards);
    } catch (error) {
      console.error("Error fetching standards:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/evaluation-items", isAuthenticated, async (req, res) => {
    try {
      const items = await storage.getEvaluationItems();
      res.json(items);
    } catch (error) {
      console.error("Error fetching evaluation items:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/teacher-witnesses", isAuthenticated, async (req, res) => {
    try {
      const userId = await getUserIdFromRequest(req);
      if (!userId) return res.sendStatus(401);
      const witnesses2 = await storage.getTeacherWitnesses(userId);
      res.json(witnesses2);
    } catch (error) {
      console.error("Error fetching teacher witnesses:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.post("/api/teacher-witnesses", isAuthenticated, async (req, res) => {
    try {
      const userId = await getUserIdFromRequest(req);
      if (!userId) return res.sendStatus(401);
      const { evaluationItemId, title, description, type, link, files } = req.body;
      if (!evaluationItemId || !title || !type) {
        return res.status(400).json({ message: "evaluationItemId, title, and type are required" });
      }
      if (!["file", "link"].includes(type)) {
        return res.status(400).json({ message: "type must be 'file' or 'link'" });
      }
      const evalItems = await storage.getEvaluationItems();
      const evalItem = evalItems.find((e) => e.id === evaluationItemId);
      if (!evalItem) {
        return res.status(400).json({ message: "Invalid evaluationItemId" });
      }
      if (type === "link" && !link) {
        return res.status(400).json({ message: "link is required when type is 'link'" });
      }
      if (type === "file") {
        if (!files || !Array.isArray(files) || files.length === 0) {
          return res.status(400).json({ message: "At least 1 file is required when type is 'file'" });
        }
        if (files.length > 10) {
          return res.status(400).json({ message: "Maximum 10 files allowed" });
        }
        for (const f of files) {
          if (f.fileUrl && f.fileUrl.length > 2 * 1024 * 1024 * 1.37) {
            return res.status(400).json({ message: "Each file must be under 2MB" });
          }
        }
      }
      const witness = await storage.createTeacherWitness({
        userId,
        evaluationItemId,
        title,
        description: description || null,
        type,
        link: link || null,
        status: "pending"
      });
      if (type === "file" && files && Array.isArray(files)) {
        for (let i = 0; i < files.length; i++) {
          const f = files[i];
          await storage.createWitnessFile({
            witnessId: witness.id,
            fileName: f.fileName,
            fileType: f.fileType,
            fileUrl: f.fileUrl,
            fileSize: f.fileSize || null,
            order: i
          });
        }
      }
      const created = await storage.getTeacherWitnessById(witness.id);
      res.json(created);
    } catch (error) {
      console.error("Error creating teacher witness:", error);
      if (error.message === "Maximum 10 files per witness") {
        return res.status(400).json({ message: error.message });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.delete("/api/teacher-witnesses/:id", isAuthenticated, async (req, res) => {
    try {
      const userId = await getUserIdFromRequest(req);
      if (!userId) return res.sendStatus(401);
      const witness = await storage.getTeacherWitnessById(req.params.id);
      if (!witness) {
        return res.status(404).json({ message: "Witness not found" });
      }
      if (witness.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      await storage.deleteTeacherWitness(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting teacher witness:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/principal/teacher-witnesses", isAuthenticated, isPrincipal, async (req, res) => {
    try {
      const witnesses2 = await storage.getAllTeacherWitnesses();
      res.json(witnesses2);
    } catch (error) {
      console.error("Error fetching all teacher witnesses:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/principal/teachers/:id/evidence", isAuthenticated, isPrincipal, async (req, res) => {
    try {
      const witnesses2 = await storage.getTeacherWitnesses(req.params.id);
      res.json(witnesses2);
    } catch (error) {
      console.error("Error fetching teacher evidence:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  return createServer(app2);
}

// server/app.ts
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
var app = express();
app.use(express.json({
  limit: "50mb",
  verify: (req, _res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(express.urlencoded({ extended: false, limit: "50mb" }));
app.use((req, res, next) => {
  const start = Date.now();
  const path2 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path2.startsWith("/api")) {
      let logLine = `${req.method} ${path2} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
async function runApp(setup) {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  await setup(app, server);
  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    log(`serving on port ${port}`);
  });
}

// server/index-prod.ts
async function serveStatic(app2, _server) {
  const distPath = path.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express2.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}
(async () => {
  await runApp(serveStatic);
})();
export {
  serveStatic
};
