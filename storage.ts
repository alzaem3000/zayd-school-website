import {
  users,
  indicators,
  criteria,
  witnesses,
  strategies,
  userStrategies,
  capabilities,
  changes,
  signatures,
  evaluationItems,
  teacherWitnesses,
  witnessFiles,
  type User,
  type UpsertUser,
  type Indicator,
  type InsertIndicator,
  type Criteria,
  type InsertCriteria,
  type Witness,
  type InsertWitness,
  type Strategy,
  type InsertStrategy,
  type Capability,
  type Change,
  type Signature,
  type InsertSignature,
  type IndicatorWithCriteria,
  type DashboardStats,
  type SignatureWithDetails,
  type PrincipalDashboardStats,
  type TeacherWithStats,
  type EvaluationItem,
  type TeacherWitness,
  type InsertTeacherWitness,
  type WitnessFile,
  type InsertWitnessFile,
  type TeacherWitnessWithFiles,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, sql, desc } from "drizzle-orm";
import { CycleService } from "./services/cycles";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUser(id: string, data: Partial<UpsertUser>): Promise<User | undefined>;
  getAllTeachers(): Promise<TeacherWithStats[]>;
  
  getIndicators(userId?: string): Promise<IndicatorWithCriteria[]>;
  getIndicator(id: string): Promise<IndicatorWithCriteria | undefined>;
  createIndicator(data: InsertIndicator): Promise<Indicator>;
  updateIndicator(id: string, data: Partial<InsertIndicator>): Promise<Indicator | undefined>;
  deleteIndicator(id: string): Promise<boolean>;
  
  getCriteria(indicatorId: string): Promise<Criteria[]>;
  getCriteriaById(id: string): Promise<Criteria | undefined>;
  createCriteria(data: InsertCriteria): Promise<Criteria>;
  updateCriteria(id: string, data: Partial<InsertCriteria>): Promise<Criteria | undefined>;
  deleteCriteria(id: string): Promise<boolean>;
  
  getWitnesses(indicatorId?: string): Promise<Witness[]>;
  getWitnessById(id: string): Promise<Witness | undefined>;
  createWitness(data: InsertWitness): Promise<Witness>;
  deleteWitness(id: string): Promise<boolean>;
  
  getStrategies(): Promise<Strategy[]>;
  createStrategy(data: InsertStrategy): Promise<Strategy>;
  
  getUserStrategies(userId: string): Promise<Strategy[]>;
  setUserStrategies(userId: string, strategyIds: string[]): Promise<void>;
  
  getCapabilities(): Promise<Capability[]>;
  getChanges(): Promise<Change[]>;
  
  getStats(userId?: string): Promise<DashboardStats>;
  getPrincipalStats(): Promise<PrincipalDashboardStats>;
  reEvaluateIndicators(indicatorIds: string[]): Promise<void>;
  
  // Signature methods
  createSignature(data: InsertSignature): Promise<Signature>;
  getSignature(id: string): Promise<SignatureWithDetails | undefined>;
  getSignaturesByTeacher(teacherId: string): Promise<SignatureWithDetails[]>;
  getPendingSignatures(): Promise<SignatureWithDetails[]>;
  updateSignature(id: string, data: Partial<InsertSignature>): Promise<Signature | undefined>;
  approveSignature(id: string, principalId: string, notes?: string): Promise<Signature | undefined>;
  rejectSignature(id: string, principalId: string, notes?: string): Promise<Signature | undefined>;
  
  // Creator methods (site management)
  getAllUsers(): Promise<User[]>;
  updateUserRole(userId: string, role: string): Promise<User | undefined>;
  deleteUser(userId: string): Promise<boolean>;
  updateUserPassword(userId: string, password: string): Promise<User | undefined>;
  
  // Custom auth methods
  findTeacherByName(firstName: string, lastName: string): Promise<User | undefined>;
  findUserByRole(role: string): Promise<User | undefined>;
  findUserByMobile(mobileNumber: string): Promise<User | undefined>;
  findUserByNationalId(nationalId: string): Promise<User | undefined>;
  
  // Default indicators
  seedDefaultIndicators(userId: string): Promise<void>;
  hasIndicators(userId: string): Promise<boolean>;
  seedEvaluationItems(): Promise<void>;

  // Teacher evidence system
  getEvaluationItems(): Promise<EvaluationItem[]>;
  getTeacherWitnesses(userId: string): Promise<TeacherWitnessWithFiles[]>;
  getTeacherWitnessesByItem(userId: string, evaluationItemId: number): Promise<TeacherWitnessWithFiles[]>;
  createTeacherWitness(data: InsertTeacherWitness): Promise<TeacherWitness>;
  deleteTeacherWitness(id: string): Promise<boolean>;
  createWitnessFile(data: InsertWitnessFile): Promise<WitnessFile>;
  deleteWitnessFile(id: string): Promise<boolean>;
  getTeacherWitnessById(id: string): Promise<TeacherWitnessWithFiles | undefined>;
  getAllTeacherWitnesses(): Promise<TeacherWitnessWithFiles[]>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async updateUser(id: string, data: Partial<UpsertUser>): Promise<User | undefined> {
    const [updated] = await db
      .update(users)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return updated;
  }

  async getIndicators(userId?: string): Promise<IndicatorWithCriteria[]> {
    const activeCycle = await CycleService.getActiveCycle();
    
    let baseQuery = db.select().from(indicators);
    
    if (userId) {
      baseQuery = baseQuery.where(
        and(
          eq(indicators.userId, userId),
          eq(indicators.academicCycleId, activeCycle.id)
        )
      ) as any;
    } else {
      baseQuery = baseQuery.where(eq(indicators.academicCycleId, activeCycle.id)) as any;
    }
    
    const indicatorsList = await baseQuery.orderBy(indicators.order);
    
    const result: IndicatorWithCriteria[] = [];
    
    for (const indicator of indicatorsList) {
      const criteriaList = await db.select().from(criteria).where(eq(criteria.indicatorId, indicator.id)).orderBy(criteria.order);
      const witnessList = await db.select().from(witnesses).where(eq(witnesses.indicatorId, indicator.id));
      result.push({
        ...indicator,
        criteria: criteriaList,
        witnesses: witnessList,
      });
    }
    
    return result;
  }

  async getIndicator(id: string): Promise<IndicatorWithCriteria | undefined> {
    const [indicator] = await db.select().from(indicators).where(eq(indicators.id, id));
    if (!indicator) return undefined;
    
    const criteriaList = await db.select().from(criteria).where(eq(criteria.indicatorId, id)).orderBy(criteria.order);
    
    return {
      ...indicator,
      criteria: criteriaList,
    };
  }

  async createIndicator(data: InsertIndicator): Promise<Indicator> {
    const activeCycle = await CycleService.getActiveCycle();
    const [indicator] = await db.insert(indicators).values({
      ...data,
      academicCycleId: activeCycle.id
    }).returning();
    return indicator;
  }

  async updateIndicator(id: string, data: Partial<InsertIndicator>): Promise<Indicator | undefined> {
    const [updated] = await db
      .update(indicators)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(indicators.id, id))
      .returning();
    return updated;
  }

  async deleteIndicator(id: string): Promise<boolean> {
    const result = await db.delete(indicators).where(eq(indicators.id, id));
    return true;
  }

  async getCriteria(indicatorId: string): Promise<Criteria[]> {
    return db.select().from(criteria).where(eq(criteria.indicatorId, indicatorId)).orderBy(criteria.order);
  }

  async getCriteriaById(id: string): Promise<Criteria | undefined> {
    const [criterion] = await db.select().from(criteria).where(eq(criteria.id, id));
    return criterion;
  }

  async createCriteria(data: InsertCriteria): Promise<Criteria> {
    const [criterion] = await db.insert(criteria).values(data).returning();
    return criterion;
  }

  async updateCriteria(id: string, data: Partial<InsertCriteria>): Promise<Criteria | undefined> {
    const [updated] = await db
      .update(criteria)
      .set(data)
      .where(eq(criteria.id, id))
      .returning();
    return updated;
  }

  async deleteCriteria(id: string): Promise<boolean> {
    await db.delete(criteria).where(eq(criteria.id, id));
    return true;
  }

  async getWitnesses(indicatorId?: string): Promise<Witness[]> {
    if (indicatorId) {
      return db.select().from(witnesses).where(eq(witnesses.indicatorId, indicatorId));
    }
    return db.select().from(witnesses);
  }

  async getWitnessById(id: string): Promise<Witness | undefined> {
    const [witness] = await db.select().from(witnesses).where(eq(witnesses.id, id));
    return witness;
  }

  async createWitness(data: InsertWitness): Promise<Witness> {
    const [witness] = await db.insert(witnesses).values(data).returning();
    
    if (data.indicatorId) {
      const witnessCount = await db
        .select({ count: sql<number>`count(*)` })
        .from(witnesses)
        .where(eq(witnesses.indicatorId, data.indicatorId));
      
      await db
        .update(indicators)
        .set({ witnessCount: Number(witnessCount[0]?.count || 0), updatedAt: new Date() })
        .where(eq(indicators.id, data.indicatorId));
    }
    
    return witness;
  }

  async deleteWitness(id: string): Promise<boolean> {
    const [witness] = await db.select().from(witnesses).where(eq(witnesses.id, id));
    
    await db.delete(witnesses).where(eq(witnesses.id, id));
    
    if (witness?.indicatorId) {
      const witnessCount = await db
        .select({ count: sql<number>`count(*)` })
        .from(witnesses)
        .where(eq(witnesses.indicatorId, witness.indicatorId));
      
      await db
        .update(indicators)
        .set({ witnessCount: Number(witnessCount[0]?.count || 0), updatedAt: new Date() })
        .where(eq(indicators.id, witness.indicatorId));
    }
    
    return true;
  }

  async getStrategies(): Promise<Strategy[]> {
    return db.select().from(strategies).where(eq(strategies.isActive, true));
  }

  async createStrategy(data: InsertStrategy): Promise<Strategy> {
    const [strategy] = await db.insert(strategies).values(data).returning();
    return strategy;
  }

  async getUserStrategies(userId: string): Promise<Strategy[]> {
    const userStrategyList = await db
      .select()
      .from(userStrategies)
      .where(eq(userStrategies.userId, userId));
    
    if (userStrategyList.length === 0) return [];
    
    const strategyIds = userStrategyList.map(us => us.strategyId).filter((id): id is string => id !== null);
    
    if (strategyIds.length === 0) return [];
    
    const result: Strategy[] = [];
    for (const id of strategyIds) {
      const [strategy] = await db.select().from(strategies).where(eq(strategies.id, id));
      if (strategy) result.push(strategy);
    }
    
    return result;
  }

  async setUserStrategies(userId: string, strategyIds: string[]): Promise<void> {
    await db.delete(userStrategies).where(eq(userStrategies.userId, userId));
    
    if (strategyIds.length > 0) {
      await db.insert(userStrategies).values(
        strategyIds.map(strategyId => ({
          userId,
          strategyId,
        }))
      );
    }
  }

  async getCapabilities(): Promise<Capability[]> {
    return db.select().from(capabilities).orderBy(capabilities.order);
  }

  async getChanges(): Promise<Change[]> {
    return db.select().from(changes).orderBy(changes.order);
  }

  async getStats(userId?: string): Promise<DashboardStats> {
    const indicatorsList = userId
      ? await db.select().from(indicators).where(eq(indicators.userId, userId))
      : await db.select().from(indicators);
    
    const capabilitiesList = await db.select().from(capabilities);
    const changesList = await db.select().from(changes);
    const witnessesList = userId
      ? await db.select().from(witnesses).where(eq(witnesses.userId, userId))
      : await db.select().from(witnesses);
    
    const totalIndicators = indicatorsList.length;
    const completedIndicators = indicatorsList.filter(i => i.status === "completed").length;
    const pendingIndicators = indicatorsList.filter(i => i.status === "pending").length;
    const inProgressIndicators = indicatorsList.filter(i => i.status === "in_progress").length;
    const totalWitnesses = witnessesList.length;
    
    return {
      totalCapabilities: capabilitiesList.length || 12,
      totalChanges: changesList.length || 12,
      totalIndicators,
      completedIndicators,
      pendingIndicators,
      inProgressIndicators,
      totalWitnesses,
    };
  }

  async reEvaluateIndicators(indicatorIds: string[]): Promise<void> {
    for (const id of indicatorIds) {
      await db
        .update(indicators)
        .set({ status: "pending", witnessCount: 0, updatedAt: new Date() })
        .where(eq(indicators.id, id));
      
      await db
        .update(criteria)
        .set({ isCompleted: false })
        .where(eq(criteria.indicatorId, id));
      
      await db.delete(witnesses).where(eq(witnesses.indicatorId, id));
    }
  }

  // Get all teachers with their stats
  async getAllTeachers(): Promise<TeacherWithStats[]> {
    const teachersList = await db.select().from(users).where(eq(users.role, "teacher"));
    
    const result: TeacherWithStats[] = [];
    for (const teacher of teachersList) {
      const teacherIndicators = await db.select().from(indicators).where(eq(indicators.userId, teacher.id));
      const pendingSignatures = await db.select().from(signatures).where(
        and(eq(signatures.teacherId, teacher.id), eq(signatures.status, "pending"))
      );
      
      result.push({
        ...teacher,
        indicatorCount: teacherIndicators.length,
        completedCount: teacherIndicators.filter(i => i.status === "completed").length,
        pendingApprovalCount: pendingSignatures.length,
      });
    }
    
    return result;
  }

  // Principal dashboard stats
  async getPrincipalStats(): Promise<PrincipalDashboardStats> {
    const baseStats = await this.getStats();
    
    const allTeachers = await db.select().from(users).where(eq(users.role, "teacher"));
    const allSignatures = await db.select().from(signatures);
    
    return {
      ...baseStats,
      totalTeachers: allTeachers.length,
      pendingApprovals: allSignatures.filter(s => s.status === "pending").length,
      approvedIndicators: allSignatures.filter(s => s.status === "approved").length,
      rejectedIndicators: allSignatures.filter(s => s.status === "rejected").length,
    };
  }

  // Signature methods
  async createSignature(data: InsertSignature): Promise<Signature> {
    const activeCycle = await CycleService.getActiveCycle();
    const [signature] = await db.insert(signatures).values({
      ...data,
      academicCycleId: activeCycle.id
    }).returning();
    return signature;
  }

  async getSignature(id: string): Promise<SignatureWithDetails | undefined> {
    const [signature] = await db.select().from(signatures).where(eq(signatures.id, id));
    if (!signature) return undefined;
    
    const teacher = signature.teacherId ? await this.getUser(signature.teacherId) : undefined;
    const principal = signature.principalId ? await this.getUser(signature.principalId) : undefined;
    const indicator = signature.indicatorId ? await this.getIndicator(signature.indicatorId) : undefined;
    
    return {
      ...signature,
      teacher,
      principal,
      indicator,
    };
  }

  async getSignaturesByTeacher(teacherId: string): Promise<SignatureWithDetails[]> {
    const signaturesList = await db.select().from(signatures).where(eq(signatures.teacherId, teacherId));
    
    const result: SignatureWithDetails[] = [];
    for (const signature of signaturesList) {
      const teacher = signature.teacherId ? await this.getUser(signature.teacherId) : undefined;
      const principal = signature.principalId ? await this.getUser(signature.principalId) : undefined;
      const indicator = signature.indicatorId ? await this.getIndicator(signature.indicatorId) : undefined;
      
      result.push({
        ...signature,
        teacher,
        principal,
        indicator,
      });
    }
    
    return result;
  }

  async getPendingSignatures(): Promise<SignatureWithDetails[]> {
    const signaturesList = await db.select().from(signatures).where(eq(signatures.status, "pending"));
    
    const result: SignatureWithDetails[] = [];
    for (const signature of signaturesList) {
      const teacher = signature.teacherId ? await this.getUser(signature.teacherId) : undefined;
      const principal = signature.principalId ? await this.getUser(signature.principalId) : undefined;
      const indicator = signature.indicatorId ? await this.getIndicator(signature.indicatorId) : undefined;
      
      result.push({
        ...signature,
        teacher,
        principal,
        indicator,
      });
    }
    
    return result;
  }

  async updateSignature(id: string, data: Partial<InsertSignature>): Promise<Signature | undefined> {
    const [updated] = await db
      .update(signatures)
      .set(data)
      .where(eq(signatures.id, id))
      .returning();
    return updated;
  }

  async approveSignature(id: string, principalId: string, notes?: string): Promise<Signature | undefined> {
    const [updated] = await db
      .update(signatures)
      .set({
        status: "approved",
        principalId,
        notes,
        signedAt: new Date(),
      })
      .where(eq(signatures.id, id))
      .returning();
    return updated;
  }

  async rejectSignature(id: string, principalId: string, notes?: string): Promise<Signature | undefined> {
    const [updated] = await db
      .update(signatures)
      .set({
        status: "rejected",
        principalId,
        notes,
        signedAt: new Date(),
      })
      .where(eq(signatures.id, id))
      .returning();
    return updated;
  }

  // Creator methods (site management)
  async getAllUsers(): Promise<User[]> {
    return db.select().from(users).orderBy(users.createdAt);
  }

  async updateUserRole(userId: string, role: string): Promise<User | undefined> {
    const [updated] = await db
      .update(users)
      .set({ role, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();
    return updated;
  }

  async deleteUser(userId: string): Promise<boolean> {
    // Delete all related data first (cascade)
    // Delete signatures
    await db.delete(signatures).where(eq(signatures.teacherId, userId));
    // Delete user strategies
    await db.delete(userStrategies).where(eq(userStrategies.userId, userId));
    // Get all indicators for user
    const userIndicators = await db.select().from(indicators).where(eq(indicators.userId, userId));
    for (const indicator of userIndicators) {
      // Delete witnesses for each indicator
      await db.delete(witnesses).where(eq(witnesses.indicatorId, indicator.id));
      // Delete criteria for each indicator
      await db.delete(criteria).where(eq(criteria.indicatorId, indicator.id));
    }
    // Delete all indicators for user
    await db.delete(indicators).where(eq(indicators.userId, userId));
    // Finally delete the user
    const result = await db.delete(users).where(eq(users.id, userId));
    return true;
  }

  async updateUserPassword(userId: string, password: string): Promise<User | undefined> {
    const [updated] = await db
      .update(users)
      .set({ password, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();
    return updated;
  }

  // Custom auth methods
  async findTeacherByName(firstName: string, lastName: string): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(
        and(
          eq(users.firstName, firstName),
          eq(users.lastName, lastName),
          eq(users.role, "teacher")
        )
      );
    return user;
  }

  async findUserByMobile(mobileNumber: string): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.mobileNumber, mobileNumber))
      .limit(1);
    return user;
  }

  async findUserByNationalId(nationalId: string): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.nationalId, nationalId))
      .limit(1);
    return user;
  }

  async findUserByRole(role: string): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.role, role))
      .limit(1);
    return user;
  }

  // Seed default indicators for a new user
  async seedDefaultIndicators(userId: string): Promise<void> {
    // Check if user already has indicators
    const existingIndicators = await db.select().from(indicators).where(eq(indicators.userId, userId));
    if (existingIndicators.length > 0) {
      return; // User already has indicators, don't seed
    }

    const defaultIndicators = [
      {
        title: "أداء الواجبات الوظيفية",
        description: "توثيق الالتزام بالواجبات الوظيفية والمهام اليومية",
        criteria: [
          "سجل الدوام الرسمي",
          "سجل المناوبات والإشراف اليومي",
          "سجل الانتظار",
          "متابعة المهام اليومية"
        ]
      },
      {
        title: "التفاعل مع المجتمع المهني",
        description: "توثيق التفاعل والتعاون مع الزملاء في المجتمع المهني",
        criteria: [
          "زيارة معلم",
          "درس تطبيقي",
          "شهادة حضور معلم",
          "تبادل خبرة مع زميل"
        ]
      },
      {
        title: "التفاعل مع أولياء الأمور",
        description: "توثيق التواصل والتفاعل مع أولياء الأمور",
        criteria: [
          "سجل التواصل مع أولياء الأمور",
          "محاضر اجتماعات أولياء الأمور",
          "رسائل وتقارير للأسر",
          "مشاركة أولياء الأمور في الأنشطة"
        ]
      },
      {
        title: "استراتيجيات التدريس",
        description: "توثيق استخدام استراتيجيات التدريس المتنوعة",
        criteria: [
          "تقرير أو صورة",
          "من سجل التحضير",
          "نماذج من أوراق العمل",
          "تسجيلات فيديو للدروس"
        ]
      },
      {
        title: "تحسين نتائج المتعلمين",
        description: "توثيق الجهود المبذولة لتحسين مستوى الطلاب",
        criteria: [
          "خطط علاجية للطلاب",
          "برامج إثرائية للمتفوقين",
          "تقارير تحسن المستوى",
          "مقارنة نتائج ما قبل وما بعد"
        ]
      },
      {
        title: "إعداد وتنفيذ خطط التعلم",
        description: "توثيق التخطيط والتنفيذ للعملية التعليمية",
        criteria: [
          "الخطة الفصلية",
          "التحضير اليومي",
          "توزيع المنهج",
          "خطط الوحدات الدراسية"
        ]
      },
      {
        title: "توظيف تقنيات ووسائل التعلم المناسبة",
        description: "توثيق استخدام التقنية في التعليم",
        criteria: [
          "استخدام السبورة التفاعلية",
          "توظيف المنصات التعليمية",
          "إنتاج محتوى رقمي",
          "استخدام التطبيقات التعليمية"
        ]
      },
      {
        title: "تهيئة البيئة التعليمية",
        description: "توثيق تجهيز وتهيئة بيئة التعلم",
        criteria: [
          "صور الفصل الدراسي",
          "ركن التعلم",
          "اللوحات والوسائل التعليمية",
          "تنظيم مقاعد الطلاب"
        ]
      },
      {
        title: "الإدارة الصفية",
        description: "توثيق مهارات إدارة الصف",
        criteria: [
          "قواعد وتعليمات الفصل",
          "نظام التعزيز والتحفيز",
          "سجل السلوك",
          "استراتيجيات ضبط الصف"
        ]
      },
      {
        title: "تحليل نتائج المتعلمين وتشخيص مستوياتهم",
        description: "توثيق تحليل البيانات واتخاذ القرارات",
        criteria: [
          "جداول تحليل النتائج",
          "رسوم بيانية للأداء",
          "تقارير التشخيص",
          "خطط بناءً على التحليل"
        ]
      },
      {
        title: "تنوع أساليب التقويم",
        description: "توثيق استخدام أساليب تقويم متنوعة",
        criteria: [
          "نماذج من اختبارات",
          "نموذج من ملفات إنجاز الطلاب",
          "نموذج من المهام الأدائية",
          "نماذج من المشاريع"
        ]
      },
      {
        title: "الإبداع والابتكار",
        description: "توثيق الإبداع والابتكار في العمل التعليمي",
        criteria: [
          "مشاريع إبداعية - وثائق المشاريع الإبداعية والمبادرات المبتكرة",
          "جوائز وتكريمات - شهادات الجوائز والتكريمات للإبداع",
          "أعمال طلابية مميزة - نماذج من الأعمال الطلابية المبدعة"
        ]
      }
    ];

    // Create indicators and their criteria
    for (let i = 0; i < defaultIndicators.length; i++) {
      const indicatorData = defaultIndicators[i];
      
      // Create the indicator
      const [indicator] = await db.insert(indicators).values({
        title: indicatorData.title,
        description: indicatorData.description,
        status: "pending",
        witnessCount: 0,
        userId: userId,
        order: i + 1
      }).returning();

      // Create criteria for this indicator
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
  async hasIndicators(userId: string): Promise<boolean> {
    const existingIndicators = await db.select().from(indicators).where(eq(indicators.userId, userId));
    return existingIndicators.length > 0;
  }

  // Seed evaluation items on server startup
  async seedEvaluationItems(): Promise<void> {
    const existing = await db.select().from(evaluationItems).limit(1);
    if (existing.length > 0) return;
    
    const items = [
      { title: "أداء الواجبات الوظيفية", weight: "10%", description: "الالتزام بأداء المهام والواجبات الوظيفية المكلف بها", icon: "Briefcase", suggestedEvidence: ["محاضر الاجتماعات", "تقارير الإنجاز", "شهادات الحضور", "خطابات التكليف"], examples: ["حضور الاجتماعات المدرسية", "المشاركة في الأنشطة", "تنفيذ التكليفات الإدارية"], order: 1 },
      { title: "التفاعل مع المجتمع المهني", weight: "10%", description: "المشاركة الفاعلة في المجتمعات المهنية التعليمية", icon: "Users", suggestedEvidence: ["شهادات الدورات", "محاضر المجتمعات المهنية", "أوراق العمل المقدمة", "تقارير الملتقيات"], examples: ["حضور دورات تدريبية", "المشاركة في ملتقيات مهنية", "تقديم ورش عمل"], order: 2 },
      { title: "التفاعل مع أولياء الأمور", weight: "10%", description: "التواصل الفعال مع أولياء أمور الطلاب", icon: "UserCheck", suggestedEvidence: ["سجل التواصل مع أولياء الأمور", "محاضر الاجتماعات", "رسائل التواصل", "تقارير المتابعة"], examples: ["اجتماعات أولياء الأمور", "رسائل إلكترونية", "اتصالات هاتفية"], order: 3 },
      { title: "التنويع في استراتيجيات التدريس", weight: "10%", description: "استخدام استراتيجيات تدريس متنوعة وفعالة", icon: "Lightbulb", suggestedEvidence: ["تحضير الدروس", "صور من التطبيق", "فيديوهات تعليمية", "أوراق عمل"], examples: ["التعلم التعاوني", "التعلم بالمشاريع", "الصف المقلوب"], order: 4 },
      { title: "تحسين نتائج المتعلمين", weight: "10%", description: "العمل على رفع مستوى تحصيل الطلاب", icon: "TrendingUp", suggestedEvidence: ["نتائج الاختبارات", "تقارير التحصيل", "خطط العلاج", "إحصائيات المقارنة"], examples: ["تحليل نتائج الطلاب", "خطط علاجية", "برامج إثرائية"], order: 5 },
      { title: "إعداد وتنفيذ خطة التعلم", weight: "10%", description: "إعداد خطط تعليمية شاملة وتنفيذها بفاعلية", icon: "Calendar", suggestedEvidence: ["الخطة الفصلية", "التحضير اليومي", "سجل المتابعة", "تقارير التنفيذ"], examples: ["خطة فصلية متكاملة", "تحضير يومي", "متابعة تنفيذ الخطة"], order: 6 },
      { title: "توظيف تقنيات التعلم", weight: "10%", description: "استخدام التقنية الحديثة في العملية التعليمية", icon: "Monitor", suggestedEvidence: ["لقطات شاشة", "روابط المنصات", "صور التطبيق", "تقارير الاستخدام"], examples: ["استخدام منصة مدرستي", "التعلم عن بعد", "التطبيقات التعليمية"], order: 7 },
      { title: "تهيئة البيئة التعليمية", weight: "5%", description: "تهيئة بيئة صفية محفزة للتعلم", icon: "Home", suggestedEvidence: ["صور الفصل", "تقارير الزيارات", "خطة تنظيم البيئة", "ملاحظات المشرف"], examples: ["تنظيم الفصل", "الوسائل التعليمية", "ركن التعلم"], order: 8 },
      { title: "الإدارة الصفية", weight: "5%", description: "إدارة الصف بكفاءة وفاعلية", icon: "UserCog", suggestedEvidence: ["سجل المتابعة السلوكية", "خطة الإدارة الصفية", "تقارير الزيارات", "ملاحظات المشرف"], examples: ["ضبط الصف", "إدارة الوقت", "التعامل مع السلوك"], order: 9 },
      { title: "تحليل نتائج المتعلمين", weight: "10%", description: "تحليل نتائج الطلاب واستخلاص المؤشرات التحسينية", icon: "BarChart", suggestedEvidence: ["تقارير التحليل", "الرسوم البيانية", "جداول المقارنة", "خطط التحسين"], examples: ["تحليل إحصائي للنتائج", "رسوم بيانية مقارنة", "تقارير تفصيلية"], order: 10 },
      { title: "تنوع أساليب التقويم", weight: "10%", description: "استخدام أساليب تقويم متنوعة لقياس تعلم الطلاب", icon: "CheckCircle", suggestedEvidence: ["نماذج اختبارات", "أدوات تقويم بديلة", "سلالم التقدير", "ملفات الإنجاز"], examples: ["اختبارات تحريرية", "تقويم أدائي", "ملف إنجاز الطالب"], order: 11 },
    ];

    for (const item of items) {
      await db.insert(evaluationItems).values(item);
    }
    console.log("Seeded 11 evaluation items");
  }

  async getEvaluationItems(): Promise<EvaluationItem[]> {
    return db.select().from(evaluationItems).orderBy(evaluationItems.order);
  }

  async getTeacherWitnesses(userId: string): Promise<TeacherWitnessWithFiles[]> {
    const witnessList = await db.select().from(teacherWitnesses)
      .where(eq(teacherWitnesses.userId, userId))
      .orderBy(desc(teacherWitnesses.createdAt));

    const result: TeacherWitnessWithFiles[] = [];
    for (const w of witnessList) {
      const files = await db.select().from(witnessFiles)
        .where(eq(witnessFiles.witnessId, w.id))
        .orderBy(witnessFiles.order);
      const evalItem = w.evaluationItemId
        ? (await db.select().from(evaluationItems).where(eq(evaluationItems.id, w.evaluationItemId)))[0]
        : undefined;
      result.push({ ...w, files, evaluationItem: evalItem });
    }
    return result;
  }

  async getTeacherWitnessesByItem(userId: string, evaluationItemId: number): Promise<TeacherWitnessWithFiles[]> {
    const witnessList = await db.select().from(teacherWitnesses)
      .where(and(eq(teacherWitnesses.userId, userId), eq(teacherWitnesses.evaluationItemId, evaluationItemId)))
      .orderBy(desc(teacherWitnesses.createdAt));

    const result: TeacherWitnessWithFiles[] = [];
    for (const w of witnessList) {
      const files = await db.select().from(witnessFiles)
        .where(eq(witnessFiles.witnessId, w.id))
        .orderBy(witnessFiles.order);
      const evalItem = w.evaluationItemId
        ? (await db.select().from(evaluationItems).where(eq(evaluationItems.id, w.evaluationItemId)))[0]
        : undefined;
      result.push({ ...w, files, evaluationItem: evalItem });
    }
    return result;
  }

  async createTeacherWitness(data: InsertTeacherWitness): Promise<TeacherWitness> {
    const [witness] = await db.insert(teacherWitnesses).values(data).returning();
    return witness;
  }

  async deleteTeacherWitness(id: string): Promise<boolean> {
    await db.delete(witnessFiles).where(eq(witnessFiles.witnessId, id));
    await db.delete(teacherWitnesses).where(eq(teacherWitnesses.id, id));
    return true;
  }

  async createWitnessFile(data: InsertWitnessFile): Promise<WitnessFile> {
    if (data.witnessId) {
      const existingFiles = await db.select({ count: sql<number>`count(*)` })
        .from(witnessFiles)
        .where(eq(witnessFiles.witnessId, data.witnessId));
      if (Number(existingFiles[0]?.count || 0) >= 10) {
        throw new Error("Maximum 10 files per witness");
      }
    }
    const [file] = await db.insert(witnessFiles).values(data).returning();
    return file;
  }

  async deleteWitnessFile(id: string): Promise<boolean> {
    await db.delete(witnessFiles).where(eq(witnessFiles.id, id));
    return true;
  }

  async getTeacherWitnessById(id: string): Promise<TeacherWitnessWithFiles | undefined> {
    const [witness] = await db.select().from(teacherWitnesses).where(eq(teacherWitnesses.id, id));
    if (!witness) return undefined;

    const files = await db.select().from(witnessFiles)
      .where(eq(witnessFiles.witnessId, id))
      .orderBy(witnessFiles.order);
    const evalItem = witness.evaluationItemId
      ? (await db.select().from(evaluationItems).where(eq(evaluationItems.id, witness.evaluationItemId)))[0]
      : undefined;
    return { ...witness, files, evaluationItem: evalItem };
  }

  async getAllTeacherWitnesses(): Promise<TeacherWitnessWithFiles[]> {
    const witnessList = await db.select().from(teacherWitnesses)
      .orderBy(desc(teacherWitnesses.createdAt));

    const result: TeacherWitnessWithFiles[] = [];
    for (const w of witnessList) {
      const files = await db.select().from(witnessFiles)
        .where(eq(witnessFiles.witnessId, w.id))
        .orderBy(witnessFiles.order);
      const evalItem = w.evaluationItemId
        ? (await db.select().from(evaluationItems).where(eq(evaluationItems.id, w.evaluationItemId)))[0]
        : undefined;
      result.push({ ...w, files, evaluationItem: evalItem });
    }
    return result;
  }
}

export const storage = new DatabaseStorage();
