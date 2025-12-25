import type { Request, Response } from 'express';
import { prisma } from '../../../config/db.js';

export const getManagerDashboard = async (req: Request, res: Response) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [
      totalSpend,
      totalCases,
      activeCases,
      recoveredCases,

      criticalCases,
      severeCases,
      moderateCases,
      mildCases,

      completedAppointments,
      cancelledAppointments,
      scheduledAppointments,

      athletes,
      clinicians
    ] = await Promise.all([
      prisma.invoice.aggregate({ _sum: { totalAmount: true } }),

      prisma.case.count(),
      prisma.case.count({ where: { status: 'ACTIVE' } }),
      prisma.case.count({ where: { status: 'RECOVERED' } }),

      prisma.case.count({ where: { severity: 'CRITICAL' } }),
      prisma.case.count({ where: { severity: 'SEVERE' } }),
      prisma.case.count({ where: { severity: 'MODERATE' } }),
      prisma.case.count({ where: { severity: 'MILD' } }),

      prisma.appointment.count({ where: { status: 'COMPLETED' } }),
      prisma.appointment.count({ where: { status: 'CANCELLED' } }),
      prisma.appointment.count({ where: { status: 'SCHEDULED' } }),

      prisma.user.findMany({
        where: { role: 'ATHLETE' },
        select: { id: true, fullName: true },
        skip,
        take: limit
      }),

      prisma.user.findMany({
        where: { role: 'CLINICIAN' },
        select: { id: true, fullName: true },
        skip,
        take: limit
      })
    ]);

    res.status(200).json({
      success: true,
      data: {
        financials: {
          totalSpend: totalSpend._sum.totalAmount || 0
        },
        cases: {
          total: totalCases,
          active: activeCases,
          recovered: recoveredCases,
          severity: {
            critical: criticalCases,
            severe: severeCases,
            moderate: moderateCases,
            mild: mildCases
          }
        },
        appointments: {
          completed: completedAppointments,
          cancelled: cancelledAppointments,
          scheduled: scheduledAppointments
        },
        athletes,
        clinicians,
        pagination: {
          page,
          limit
        }
      }
    });
  } catch (error: any) {
    console.error('Manager dashboard error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to load manager dashboard'
    });
  }
};
