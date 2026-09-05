import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Fetch all payments that have a recovery action, with their audit logs
    const payments = await prisma.payment.findMany({
      where: {
        recoveryAction: { isNot: null },
      },
      include: {
        recoveryAction: {
          include: {
            auditLogs: {
              orderBy: { createdAt: "asc" },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Transform into the shape the frontend expects
    const jobs = payments.map((p) => ({
      payment: {
        id: p.id,
        orderId: p.orderId ?? "",
        amount: p.amount,
        currency: p.currency,
        status: p.status,
        method: p.method ?? "",
        errorCode: p.errorCode ?? "",
        errorReason: p.errorReason ?? "",
        errorDescription: p.errorDescription ?? "",
        email: p.email ?? "",
        contact: p.contact ?? "",
        createdAt: p.createdAt.toISOString(),
      },
      recoveryAction: {
        id: p.recoveryAction!.id,
        rootCause: p.recoveryAction!.rootCause,
        confidence: p.recoveryAction!.confidence,
        aiReasoning: p.recoveryAction!.aiReasoning,
        strategy: p.recoveryAction!.strategy,
        status: p.recoveryAction!.status,
        recoveryAmount: p.recoveryAction!.recoveryAmount,
        createdAt: p.recoveryAction!.createdAt.toISOString(),
      },
      auditLogs: p.recoveryAction!.auditLogs.map((log) => ({
        id: log.id,
        stage: log.stage,
        message: log.message,
        metadata: log.metadata,
        createdAt: log.createdAt.toISOString(),
      })),
    }));

    return NextResponse.json({ jobs, source: "database" });
  } catch (error) {
    // If DB is not available (not created yet, etc.), return empty
    console.error("Database query failed, returning empty:", error);
    return NextResponse.json({ jobs: [], source: "database", error: "DB unavailable" });
  }
}
