import { type Server, createServer } from "node:http";
import type { Express } from "express";
import { storage } from "./storage";
import { setupAuth, isAuthenticated, isPrincipal, isCreator, getUserIdFromRequest } from "./replitAuth";
import { randomBytes } from "crypto";
import { NotificationService } from "./services/notification";
import { AuditService } from "./services/audit";
import { CycleService } from "./services/cycles";
import { emailService } from "./services/email";
import { performanceStandards } from "@shared/schema";
import { db } from "./db";
import { asc } from "drizzle-orm";

export async function registerRoutes(app: Express): Promise<Server> {
  await setupAuth(app);
  await storage.seedEvaluationItems();
  
  // --- Notification Routes ---
  app.get("/api/notifications", isAuthenticated, async (req, res) => {
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

  app.post("/api/notifications/:id/mark-read", isAuthenticated, async (req, res) => {
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

  // --- Academic Cycle Routes ---
  app.get("/api/cycles", isAuthenticated, async (req, res) => {
    try {
      const cycles = await CycleService.getAllCycles();
      res.json(cycles);
    } catch (error) {
      console.error("Error fetching cycles:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/cycles/:id/activate", isAuthenticated, isPrincipal, async (req, res) => {
    try {
      await CycleService.setActiveCycle(parseInt(req.params.id));
      res.json({ success: true });
    } catch (error) {
      console.error("Error activating cycle:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  // Custom login endpoint for role-based authentication
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { role, password } = req.body;

      if (!role || !["teacher", "admin", "creator"].includes(role)) {
        return res.status(400).json({ message: "Invalid role" });
      }

      // Teacher login - authenticate by national ID + mobile number
      if (role === "teacher") {
        const { nationalId, mobileNumber } = req.body;
        
        if (!nationalId || typeof nationalId !== "string" || nationalId.trim().length < 5) {
          return res.status(400).json({ message: "يرجى إدخال رقم السجل المدني" });
        }

        const trimmedNationalId = nationalId.trim();

        // Check if teacher with this national ID exists
        let existingTeacher = await storage.findUserByNationalId(trimmedNationalId);
        
        if (existingTeacher) {
          // Existing user - verify mobile number as password
          if (!existingTeacher.mobileNumber) {
            // User registered but hasn't completed onboarding (no mobile set yet)
            (req.session as any).userId = existingTeacher.id;
            (req.session as any).userRole = "teacher";
            await new Promise<void>((resolve, reject) => {
              req.session.save((err) => {
                if (err) reject(err);
                else resolve();
              });
            });
            return res.json({ success: true, user: existingTeacher });
          }
          
          if (!mobileNumber || existingTeacher.mobileNumber !== mobileNumber.trim()) {
            return res.status(401).json({ message: "رقم الجوال غير صحيح" });
          }
          
          (req.session as any).userId = existingTeacher.id;
          (req.session as any).userRole = existingTeacher.role || "teacher";
          await new Promise<void>((resolve, reject) => {
            req.session.save((err) => {
              if (err) reject(err);
              else resolve();
            });
          });
          return res.json({ success: true, user: existingTeacher });
        }

        // New teacher - create account with national ID
        const uniqueId = `teacher_${randomBytes(8).toString("hex")}`;
        const newTeacher = await storage.upsertUser({
          id: uniqueId,
          nationalId: trimmedNationalId,
          email: `${uniqueId}@school.local`,
          role: "teacher",
          schoolName: "زيد بن ثابت الابتدائية",
          principalName: "زياد عبدالمحسن العتيبي",
        });

        await storage.seedDefaultIndicators(newTeacher.id);

        (req.session as any).userId = newTeacher.id;
        (req.session as any).userRole = "teacher";
        await new Promise<void>((resolve, reject) => {
          req.session.save((err) => {
            if (err) reject(err);
            else resolve();
          });
        });
        return res.json({ success: true, user: newTeacher, isNew: true });
      }

      // Admin (Principal) login - check school password
      if (role === "admin") {
        const adminPassword = process.env.ADMIN_PASSWORD;
        
        if (!adminPassword) {
          return res.status(500).json({ message: "لم يتم تعيين الرقم السري للمدير" });
        }

        if (password !== adminPassword) {
          return res.status(401).json({ message: "الرقم السري غير صحيح" });
        }

        // Find or create admin user
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
            principalName: "zayd",
          });
        }

        (req.session as any).userId = adminUser.id;
        (req.session as any).userRole = "admin";
        await new Promise<void>((resolve, reject) => {
          req.session.save((err) => {
            if (err) reject(err);
            else resolve();
          });
        });
        return res.json({ success: true, user: adminUser });
      }

      // Creator login - check creator password
      if (role === "creator") {
        const creatorPassword = process.env.CREATOR_PASSWORD;
        
        if (!creatorPassword) {
          return res.status(500).json({ message: "لم يتم تعيين الرقم السري لمنشئ الموقع" });
        }

        if (password !== creatorPassword) {
          return res.status(401).json({ message: "الرقم السري غير صحيح" });
        }

        // Find or create creator user
        let creatorUser = await storage.findUserByRole("creator");
        
        if (!creatorUser) {
          const uniqueId = `creator_${randomBytes(8).toString("hex")}`;
          creatorUser = await storage.upsertUser({
            id: uniqueId,
            firstName: "zayd",
            lastName: "",
            email: `creator@school.local`,
            role: "creator",
          });
        }

        (req.session as any).userId = creatorUser.id;
        (req.session as any).userRole = "creator";
        await new Promise<void>((resolve, reject) => {
          req.session.save((err) => {
            if (err) reject(err);
            else resolve();
          });
        });
        return res.json({ success: true, user: creatorUser });
      }

    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "حدث خطأ أثناء تسجيل الدخول" });
    }
  });

  // Logout endpoint
  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        console.error("Logout error:", err);
        return res.status(500).json({ message: "حدث خطأ أثناء تسجيل الخروج" });
      }
      res.clearCookie("connect.sid");
      res.json({ success: true });
    });
  });
  
  app.get("/api/user", async (req, res) => {
    try {
      // Check session-based auth first (custom login)
      const sessionUserId = (req.session as any)?.userId;
      if (sessionUserId) {
        const dbUser = await storage.getUser(sessionUserId);
        return res.json(dbUser);
      }

      // Fall back to Replit OAuth
      const user = req.user as any;
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

  app.post("/api/onboarding", isAuthenticated, async (req, res) => {
    try {
      const userId = await getUserIdFromRequest(req);
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const { fullNameArabic, jobNumber, specialization, schoolName, educationDepartment, educationalLevel, subject, mobileNumber, nationalId } = req.body;

      if (!fullNameArabic || !jobNumber || !specialization || !schoolName || !educationDepartment || !subject || !mobileNumber) {
        return res.status(400).json({ message: "جميع الحقول مطلوبة" });
      }

      if (!/^\d{4,}$/.test(jobNumber)) {
        return res.status(400).json({ message: "الرقم الوظيفي يجب أن يكون رقمياً" });
      }

      if (!nationalId || !/^\d{5,20}$/.test(nationalId)) {
        return res.status(400).json({ message: "رقم السجل المدني مطلوب ويجب أن يكون رقمياً (5 أرقام على الأقل)" });
      }
      const existingByNationalId = await storage.findUserByNationalId(nationalId);
      if (existingByNationalId && existingByNationalId.id !== userId) {
        return res.status(409).json({ message: "رقم السجل المدني مسجل مسبقاً، يرجى تسجيل الدخول" });
      }

      const nameParts = fullNameArabic.trim().split(" ");
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(" ");

      const profileData: any = {
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
        onboardingCompleted: true,
      };

      if (mobileNumber) {
        if (!/^05\d{8}$/.test(mobileNumber)) {
          return res.status(400).json({ message: "رقم الجوال يجب أن يبدأ بـ 05 ويتكون من 10 أرقام" });
        }
        
        const existingUser = await storage.findUserByMobile(mobileNumber);
        if (existingUser && existingUser.id !== userId) {
          // Update the existing user with the new profile data
          await storage.updateUser(existingUser.id, profileData);
          
          // Switch the session to the existing user
          (req.session as any).userId = existingUser.id;
          (req.session as any).userRole = existingUser.role || "teacher";
          
          // Delete the temporary/current user
          await storage.deleteUser(userId);
          
          await new Promise<void>((resolve, reject) => {
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

  app.patch("/api/user", isAuthenticated, async (req, res) => {
    try {
      const userId = await getUserIdFromRequest(req);
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const { firstName, lastName, fullNameArabic, jobNumber, specialization, educationalLevel, schoolName, educationDepartment, subject, yearsOfService, contactEmail, principalName, mobileNumber } = req.body;
      
      const updateData: any = {};
      if (firstName !== undefined) updateData.firstName = firstName;
      if (lastName !== undefined) updateData.lastName = lastName;
      if (fullNameArabic !== undefined) updateData.fullNameArabic = fullNameArabic;
      if (jobNumber !== undefined) updateData.jobNumber = jobNumber;
      if (specialization !== undefined) updateData.specialization = specialization;
      if (educationalLevel !== undefined) updateData.educationalLevel = educationalLevel;
      if (schoolName !== undefined) updateData.schoolName = schoolName;
      if (educationDepartment !== undefined) updateData.educationDepartment = educationDepartment;
      if (subject !== undefined) updateData.subject = subject;
      if (yearsOfService !== undefined) updateData.yearsOfService = yearsOfService;
      if (contactEmail !== undefined) updateData.contactEmail = contactEmail;
      if (principalName !== undefined) updateData.principalName = principalName;
      if (mobileNumber !== undefined) updateData.mobileNumber = mobileNumber;

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

  app.get("/api/stats", isAuthenticated, async (req, res) => {
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

  app.get("/api/indicators", isAuthenticated, async (req, res) => {
    try {
      const userId = await getUserIdFromRequest(req);
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const indicators = await storage.getIndicators(userId);
      const stripped = indicators.map(ind => ({
        ...ind,
        witnesses: ind.witnesses?.map(w => ({ id: w.id, fileType: w.fileType, title: w.title, link: w.link })),
      }));
      res.json(stripped);
    } catch (error) {
      console.error("Error fetching indicators:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/indicators", isAuthenticated, async (req, res) => {
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
        status: "pending",
      });

      if (criteriaList && Array.isArray(criteriaList)) {
        for (let i = 0; i < criteriaList.length; i++) {
          const criteriaTitle = criteriaList[i];
          if (criteriaTitle && typeof criteriaTitle === "string") {
            await storage.createCriteria({
              title: criteriaTitle,
              indicatorId: indicator.id,
              order: i + 1,
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

  app.get("/api/indicators/:id", isAuthenticated, async (req, res) => {
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

  app.patch("/api/indicators/:id", isAuthenticated, async (req, res) => {
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
      const safeUpdate: { title?: string; description?: string; status?: string; order?: number; type?: string; weight?: number; domain?: string | null; targetOutput?: string | null } = {};
      if (title !== undefined) safeUpdate.title = title;
      if (description !== undefined) safeUpdate.description = description;
      if (status !== undefined) safeUpdate.status = status;
      if (order !== undefined) safeUpdate.order = order;
      if (type !== undefined) safeUpdate.type = type;
      if (weight !== undefined) safeUpdate.weight = weight;
      if (domain !== undefined) safeUpdate.domain = domain;
      if (targetOutput !== undefined) safeUpdate.targetOutput = targetOutput;
      
      const updated = await storage.updateIndicator(req.params.id, safeUpdate);
      res.json(updated);
    } catch (error) {
      console.error("Error updating indicator:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete("/api/indicators/:id", isAuthenticated, async (req, res) => {
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

  app.patch("/api/indicators/:indicatorId/criteria/:criteriaId", isAuthenticated, async (req, res) => {
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
      const allCompleted = allCriteria.every(c => c.isCompleted);
      const anyCompleted = allCriteria.some(c => c.isCompleted);
      
      let status: "pending" | "in_progress" | "completed" = "pending";
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

  app.get("/api/indicators/:id/witnesses", isAuthenticated, async (req, res) => {
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
      const witnesses = await storage.getWitnesses(req.params.id);
      res.json(witnesses);
    } catch (error) {
      console.error("Error fetching witnesses:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/indicators/:id/witnesses", isAuthenticated, async (req, res) => {
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
      
      // Validation: Size check (Max 2MB)
      if (fileData && fileData.length > 2 * 1024 * 1024 * 1.37) { // 2MB + Base64 overhead
        return res.status(400).json({ message: "حجم الملف كبير جداً (الحد الأقصى 2 ميجابايت)" });
      }

      if (!fileData && !link) {
        return res.status(400).json({ message: "يجب اختيار ملف أو إضافة رابط" });
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
        fileUrl: fileData, // Storing Data URI directly in database
        fileName,
        link: link,
        userId,
      });
      
      res.json(witness);
    } catch (error) {
      console.error("Error creating witness:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete("/api/witnesses/:id", isAuthenticated, async (req, res) => {
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

  app.get("/api/strategies", isAuthenticated, async (req, res) => {
    try {
      const strategies = await storage.getStrategies();
      res.json(strategies);
    } catch (error) {
      console.error("Error fetching strategies:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/user-strategies", isAuthenticated, async (req, res) => {
    try {
      const userId = await getUserIdFromRequest(req);
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const strategies = await storage.getUserStrategies(userId);
      res.json(strategies);
    } catch (error) {
      console.error("Error fetching user strategies:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/user-strategies", isAuthenticated, async (req, res) => {
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
      const strategies = await storage.getUserStrategies(userId);
      res.json(strategies);
    } catch (error) {
      console.error("Error setting user strategies:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/capabilities", isAuthenticated, async (req, res) => {
    try {
      const capabilities = await storage.getCapabilities();
      res.json(capabilities);
    } catch (error) {
      console.error("Error fetching capabilities:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/changes", isAuthenticated, async (req, res) => {
    try {
      const changes = await storage.getChanges();
      res.json(changes);
    } catch (error) {
      console.error("Error fetching changes:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/indicators/re-evaluate", isAuthenticated, async (req, res) => {
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

  // =====================================================
  // SIGNATURE ROUTES - Teacher submits for approval
  // =====================================================

  // Teacher: Submit indicator for approval
  app.post("/api/signatures", isAuthenticated, async (req, res) => {
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
        status: "pending",
      });

      res.json(signature);
    } catch (error) {
      console.error("Error creating signature:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Teacher: Get my signatures
  app.get("/api/my-signatures", isAuthenticated, async (req, res) => {
    try {
      const userId = await getUserIdFromRequest(req);
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const signatures = await storage.getSignaturesByTeacher(userId);
      res.json(signatures);
    } catch (error) {
      console.error("Error fetching signatures:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // =====================================================
  // PRINCIPAL ROUTES - Admin access only
  // =====================================================

  // Principal: Get dashboard stats
  app.get("/api/principal/stats", isAuthenticated, isPrincipal, async (req, res) => {
    try {
      const stats = await storage.getPrincipalStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching principal stats:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Principal: Get all teachers with their stats
  app.get("/api/principal/teachers", isAuthenticated, isPrincipal, async (req, res) => {
    try {
      const teachers = await storage.getAllTeachers();
      res.json(teachers);
    } catch (error) {
      console.error("Error fetching teachers:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Principal: Get all indicators for a specific teacher
  app.get("/api/principal/teachers/:teacherId/indicators", isAuthenticated, isPrincipal, async (req, res) => {
    try {
      const indicators = await storage.getIndicators(req.params.teacherId);
      const stripped = indicators.map(ind => ({
        ...ind,
        witnesses: ind.witnesses?.map(w => ({ id: w.id, fileType: w.fileType, title: w.title, link: w.link })),
      }));
      res.json(stripped);
    } catch (error) {
      console.error("Error fetching teacher indicators:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/principal/indicators/:indicatorId/witnesses", isAuthenticated, isPrincipal, async (req, res) => {
    try {
      const witnesses = await storage.getWitnesses(req.params.indicatorId);
      res.json(witnesses);
    } catch (error) {
      console.error("Error fetching indicator witnesses:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Principal: Get pending signatures
  app.get("/api/principal/pending-signatures", isAuthenticated, isPrincipal, async (req, res) => {
    try {
      const signatures = await storage.getPendingSignatures();
      res.json(signatures);
    } catch (error) {
      console.error("Error fetching pending signatures:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Principal: Export school data as CSV
  app.get("/api/principal/export-csv", isAuthenticated, isPrincipal, async (req, res) => {
    try {
      const teachers = await storage.getAllTeachers();
      
      // Flatten data for CSV
      const csvRows = [
        ["الرقم الوظيفي", "الاسم الكامل", "التخصص", "عدد المؤشرات", "المؤشرات المكتملة", "بانتظار الاعتماد"], // Header in Arabic
      ];

      for (const t of teachers) {
        csvRows.push([
          t.jobNumber || "غير محدد",
          t.fullNameArabic || `${t.firstName} ${t.lastName}`,
          t.specialization || "غير محدد",
          t.indicatorCount.toString(),
          t.completedCount.toString(),
          t.pendingApprovalCount.toString()
        ]);
      }

      const csvContent = csvRows.map(row => 
        row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(",")
      ).join("\n");
      
      res.header("Content-Type", "text/csv; charset=utf-8");
      res.header("Content-Disposition", "attachment; filename=school_performance_report.csv");
      // Add UTF-8 BOM for Excel Arabic support
      res.send("\ufeff" + csvContent);
    } catch (error) {
      console.error("Error exporting CSV:", error);
      res.status(500).json({ message: "حدث خطأ أثناء تصدير التقرير" });
    }
  });

  // Principal: Approve a signature
  app.post("/api/principal/signatures/:id/approve", isAuthenticated, isPrincipal, async (req, res) => {
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

      // Email Notification
      const teacher = await storage.getUser(signature.teacherId!);
      if (teacher && teacher.contactEmail) {
        const html = emailService.generateTemplate(
          "تم اعتماد ميثاق الأداء الوظيفي",
          "تهانينا، قام مدير المدرسة باعتماد الشواهد والمؤشرات الخاصة بك.",
          `${req.protocol}://${req.get('host')}/home`
        );
        await emailService.sendNotification(teacher.contactEmail, "تم اعتماد ميثاق الأداء الوظيفي", html);
      }

      // Log & Notify
      await AuditService.log({
        userId: principalId,
        action: "APPROVE",
        entityType: "signature",
        entityId: signatureId,
        details: { notes },
        ipAddress: req.ip
      });

      await NotificationService.send({
        recipientId: signature.teacherId!,
        type: "success",
        title: "تم اعتماد الميثاق",
        message: "قام مدير المدرسة باعتماد ميثاق الأداء الخاص بك.",
        link: "/home"
      });
      
      res.json(signature);
    } catch (error) {
      console.error("Error approving signature:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Principal: Reject a signature
  app.post("/api/principal/signatures/:id/reject", isAuthenticated, isPrincipal, async (req, res) => {
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

      // Email Notification
      const teacher = await storage.getUser(signature.teacherId!);
      if (teacher && teacher.contactEmail) {
        const html = emailService.generateTemplate(
          "تنبيه: ميثاق الأداء بحاجة للتعديل",
          `قام المدير بإعادة الميثاق للمراجعة. الملاحظات: ${notes}`,
          `${req.protocol}://${req.get('host')}/home`
        );
        await emailService.sendNotification(teacher.contactEmail, "تنبيه: ميثاق الأداء بحاجة للتعديل", html);
      }

      // Log & Notify
      await AuditService.log({
        userId: principalId,
        action: "REJECT",
        entityType: "signature",
        entityId: signatureId,
        details: { reason: notes },
        ipAddress: req.ip
      });

      await NotificationService.send({
        recipientId: signature.teacherId!,
        type: "error",
        title: "تم رفض الميثاق",
        message: `تم إعادة الميثاق للمراجعة. السبب: ${notes}`,
        link: "/home"
      });
      
      res.json(signature);
    } catch (error) {
      console.error("Error rejecting signature:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Principal: Update user role (can only set admin, supervisor, teacher)
  app.patch("/api/principal/users/:userId/role", isAuthenticated, isPrincipal, async (req, res) => {
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

  // Creator-only routes (site management)
  
  // Creator: Get all users
  app.get("/api/creator/users", isAuthenticated, isCreator, async (req, res) => {
    try {
      const allUsers = await storage.getAllUsers();
      res.json(allUsers);
    } catch (error) {
      console.error("Error fetching all users:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Creator: Update any user role (can set any role including creator)
  app.patch("/api/creator/users/:userId/role", isAuthenticated, isCreator, async (req, res) => {
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

  // Creator: Get site statistics
  app.get("/api/creator/stats", isAuthenticated, isCreator, async (req, res) => {
    try {
      const allUsers = await storage.getAllUsers();
      const stats = {
        totalUsers: allUsers.length,
        creators: allUsers.filter(u => u.role === "creator").length,
        admins: allUsers.filter(u => u.role === "admin").length,
        supervisors: allUsers.filter(u => u.role === "supervisor").length,
        teachers: allUsers.filter(u => u.role === "teacher").length,
      };
      res.json(stats);
    } catch (error) {
      console.error("Error fetching creator stats:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Principal/Creator: Delete a teacher
  app.delete("/api/principal/teachers/:userId", isAuthenticated, isPrincipal, async (req, res) => {
    try {
      const targetUser = await storage.getUser(req.params.userId);
      
      if (!targetUser) {
        return res.status(404).json({ message: "المستخدم غير موجود" });
      }
      
      // Only allow deleting teachers (not admins or creators)
      if (targetUser.role !== "teacher") {
        return res.status(403).json({ message: "لا يمكن حذف هذا المستخدم" });
      }
      
      await storage.deleteUser(req.params.userId);
      res.json({ success: true, message: "تم حذف المعلم بنجاح" });
    } catch (error) {
      console.error("Error deleting teacher:", error);
      res.status(500).json({ message: "حدث خطأ أثناء حذف المعلم" });
    }
  });

  // Principal/Creator: Change teacher password
  app.patch("/api/principal/teachers/:userId/password", isAuthenticated, isPrincipal, async (req, res) => {
    try {
      const { password } = req.body;
      
      if (!password || password.length < 4) {
        return res.status(400).json({ message: "كلمة المرور يجب أن تكون 4 أحرف على الأقل" });
      }
      
      const targetUser = await storage.getUser(req.params.userId);
      
      if (!targetUser) {
        return res.status(404).json({ message: "المستخدم غير موجود" });
      }
      
      // Only allow changing password for teachers
      if (targetUser.role !== "teacher") {
        return res.status(403).json({ message: "لا يمكن تغيير كلمة مرور هذا المستخدم" });
      }
      
      const updated = await storage.updateUserPassword(req.params.userId, password);
      res.json({ success: true, message: "تم تغيير كلمة المرور بنجاح" });
    } catch (error) {
      console.error("Error changing password:", error);
      res.status(500).json({ message: "حدث خطأ أثناء تغيير كلمة المرور" });
    }
  });

  // Creator: Delete any user (including admins)
  app.delete("/api/creator/users/:userId", isAuthenticated, isCreator, async (req, res) => {
    try {
      const currentUserId = await getUserIdFromRequest(req);
      
      // Cannot delete yourself
      if (req.params.userId === currentUserId) {
        return res.status(403).json({ message: "لا يمكنك حذف حسابك الخاص" });
      }
      
      const targetUser = await storage.getUser(req.params.userId);
      
      if (!targetUser) {
        return res.status(404).json({ message: "المستخدم غير موجود" });
      }
      
      await storage.deleteUser(req.params.userId);
      res.json({ success: true, message: "تم حذف المستخدم بنجاح" });
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ message: "حدث خطأ أثناء حذف المستخدم" });
    }
  });

  // Creator: Change any user password
  app.patch("/api/creator/users/:userId/password", isAuthenticated, isCreator, async (req, res) => {
    try {
      const { password } = req.body;
      
      if (!password || password.length < 4) {
        return res.status(400).json({ message: "كلمة المرور يجب أن تكون 4 أحرف على الأقل" });
      }
      
      const targetUser = await storage.getUser(req.params.userId);
      
      if (!targetUser) {
        return res.status(404).json({ message: "المستخدم غير موجود" });
      }
      
      const updated = await storage.updateUserPassword(req.params.userId, password);
      res.json({ success: true, message: "تم تغيير كلمة المرور بنجاح" });
    } catch (error) {
      console.error("Error changing password:", error);
      res.status(500).json({ message: "حدث خطأ أثناء تغيير كلمة المرور" });
    }
  });

  // Performance Standards API
  app.get("/api/standards", isAuthenticated, async (req, res) => {
    try {
      const standards = await db.select().from(performanceStandards).orderBy(asc(performanceStandards.order));
      res.json(standards);
    } catch (error) {
      console.error("Error fetching standards:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // --- Teacher Evidence System Routes ---

  app.get("/api/evaluation-items", isAuthenticated, async (req, res) => {
    try {
      const items = await storage.getEvaluationItems();
      res.json(items);
    } catch (error) {
      console.error("Error fetching evaluation items:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/teacher-witnesses", isAuthenticated, async (req, res) => {
    try {
      const userId = await getUserIdFromRequest(req);
      if (!userId) return res.sendStatus(401);
      const witnesses = await storage.getTeacherWitnesses(userId);
      res.json(witnesses);
    } catch (error) {
      console.error("Error fetching teacher witnesses:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/teacher-witnesses", isAuthenticated, async (req, res) => {
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
      const evalItem = evalItems.find(e => e.id === evaluationItemId);
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
        status: "pending",
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
            order: i,
          });
        }
      }

      const created = await storage.getTeacherWitnessById(witness.id);
      res.json(created);
    } catch (error: any) {
      console.error("Error creating teacher witness:", error);
      if (error.message === "Maximum 10 files per witness") {
        return res.status(400).json({ message: error.message });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete("/api/teacher-witnesses/:id", isAuthenticated, async (req, res) => {
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

  app.get("/api/principal/teacher-witnesses", isAuthenticated, isPrincipal, async (req, res) => {
    try {
      const witnesses = await storage.getAllTeacherWitnesses();
      res.json(witnesses);
    } catch (error) {
      console.error("Error fetching all teacher witnesses:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/principal/teachers/:id/evidence", isAuthenticated, isPrincipal, async (req, res) => {
    try {
      const witnesses = await storage.getTeacherWitnesses(req.params.id);
      res.json(witnesses);
    } catch (error) {
      console.error("Error fetching teacher evidence:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  return createServer(app);
}
