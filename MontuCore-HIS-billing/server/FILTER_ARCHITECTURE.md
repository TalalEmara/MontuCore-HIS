```
// ============================================================================
// FILTER ARCHITECTURE GUIDE - MontuCore Backend
// ============================================================================

/**
 * PHILOSOPHY: Use flexible base functions + convenience wrappers
 * 
 * Benefits:
 * ✅ Single source of truth (DRY principle)
 * ✅ Easy to add new filters without creating new functions
 * ✅ Self-documenting convenience functions
 * ✅ Better maintainability
 * ✅ No code duplication
 */

// ============================================================================
// PATTERN 1: CASES SERVICE EXAMPLE
// ============================================================================

// Base function with all available filters
export const getCases = async (filters: GetCasesFilterParams = {}) => {
  // Supports: clinicianId, athleteId, status, severity, page, limit, isToday
  // Example usages:
};

// Convenience wrappers (reuse the base function)
export const getCriticalCasesByClinicianId = async (clinicianId: number) => {
  return getCases({ clinicianId, severity: 'CRITICAL' });
};

export const getActiveCasesByClinicianId = async (clinicianId: number, page: number, limit: number) => {
  return getCases({ clinicianId, status: 'ACTIVE', page, limit });
};

// New requirement? Just add a convenience wrapper (NO new DB logic needed):
export const getCasesTodayByAthlete = async (athleteId: number) => {
  return getCases({ athleteId, isToday: true });
};

// ============================================================================
// PATTERN 2: APPOINTMENTS SERVICE EXAMPLE
// ============================================================================

export const getAppointments = async (filters: GetAppointmentsFilterParams = {}) => {
  // Supports: clinicianId, athleteId, status, page, limit, isToday, dateRange
};

export const getTodaysAppointmentsByClinicianId = async (clinicianId: number) => {
  const result = await getAppointments({ clinicianId, isToday: true });
  return result.appointments; // Return just the data, not pagination
};

// New requirement? Weekend appointments?
export const getWeekendAppointments = async (clinicianId: number) => {
  // Calculate Friday EOD to Sunday EOD
  const now = new Date();
  const daysUntilFriday = (5 - now.getDay() + 7) % 7;
  const friday = new Date(now);
  friday.setDate(friday.getDate() + daysUntilFriday);
  
  return getAppointments({
    clinicianId,
    dateRange: {
      startDate: friday,
      endDate: new Date(friday.getTime() + 2 * 24 * 60 * 60 * 1000)
    }
  });
};

// ============================================================================
// HOW TO USE IN CONTROLLERS
// ============================================================================

export const getPhysicianDashboard = async (req: Request, res: Response) => {
  const { clinicianId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  // Use base functions with filters OR convenience wrappers
  const [todaysAppointments, criticalCases, activeCases] = await Promise.all([
    // Option A: Use convenience wrapper (cleaner if it exists)
    ApptService.getTodaysAppointmentsByClinicianId(clinicianIdNum),

    // Option B: Use base function with filters (more flexible)
    CaseService.getCases({ clinicianId: clinicianIdNum, severity: 'CRITICAL' }),

    // Option C: Use convenience wrapper with pagination
    CaseService.getActiveCasesByClinicianId(clinicianIdNum, page, limit)
  ]);
};

// ============================================================================
// ADDING NEW FILTERS - STEP BY STEP
// ============================================================================

/**
 * Scenario: "We need to filter appointments by date range from frontend"
 * 
 * Step 1: Check if base function supports it
 *   ✅ getAppointments already supports: dateRange parameter
 * 
 * Step 2: Create convenience wrapper (if this will be used often)
 *   export const getAppointmentsInDateRange = async (
 *     clinicianId: number,
 *     startDate: Date,
 *     endDate: Date
 *   ) => {
 *     return getAppointments({ clinicianId, dateRange: { startDate, endDate } });
 *   };
 * 
 * Step 3: Use in controller
 *   const appointments = await ApptService.getAppointmentsInDateRange(
 *     clinicianId,
 *     req.body.startDate,
 *     req.body.endDate
 *   );
 */

// ============================================================================
// ADDING NEW FILTERS TO BASE FUNCTIONS - STEP BY STEP
// ============================================================================

/**
 * Scenario: "We need to filter by ICD10 code"
 * 
 * Step 1: Add to filter interface
 *   interface GetCasesFilterParams {
 *     // ... existing filters
 *     icd10Code?: string;
 *   }
 * 
 * Step 2: Add to where clause in base function
 *   if (icd10Code) where.icd10Code = icd10Code;
 * 
 * Step 3: Create convenience wrapper
 *   export const getCasesByICD10 = (clinicianId: number, icd10Code: string) =>
 *     getCases({ clinicianId, icd10Code });
 * 
 * Done! No changes needed elsewhere.
 */

// ============================================================================
// WHEN TO CREATE NEW FUNCTIONS VS USE BASE
// ============================================================================

// ❌ DON'T do this - creates unnecessary duplication
export const getActiveCasesByClinicianIdWithLimit = async (clinicianId: number, limit: number) => {
  const where = { managingClinicianId: clinicianId, status: 'ACTIVE' };
  return prisma.case.findMany({ where, take: limit }); // Duplicate logic!
};

// ✅ DO this instead - reuse base function
export const getActiveCasesByClinicianIdWithLimit = async (clinicianId: number, limit: number) => {
  return getCases({ clinicianId, status: 'ACTIVE', limit, page: 1 });
};

// ============================================================================
// FILTER PATTERN SUMMARY
// ============================================================================

/*
 * Rule 1: ONE base function per entity (getCases, getAppointments, etc)
 * Rule 2: Base function supports ALL common filters via filter object
 * Rule 3: Create convenience wrappers for frequently used filter combinations
 * Rule 4: Convenience wrappers ALWAYS reuse the base function
 * Rule 5: Controllers can use either base or convenience functions
 * Rule 6: Frontend flexibility = use base function. Frontend simplicity = use wrapper
 */
