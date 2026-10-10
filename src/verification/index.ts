import { z } from "zod";
import type { VerificationType } from "@/types/quest";


export const SubmissionSchema = z.object({
    checkedSteps: z.number().int().min(0).optional(),
    text: z.string().max(1000).optional(),
    confirmed: z.boolean().optional(),
});


export const CompleteQuestRequestSchema = z.object({
    submission: SubmissionSchema.optional(),
});

export type Submission = z.infer<typeof SubmissionSchema>;

export type VerificationResult = { ok: true } | { ok: false; error: string };


export interface VerifyContext {
    type: VerificationType;
    submission: Submission;
    totalSteps: number;
    durationMin: number;
    startedAt: Date;
    now: Date;
}



const TIMER_MIN_RATIO = Number(process.env.TIMER_MIN_RATIO ?? 0.5);


export function verifyCompletion(ctx: VerifyContext): VerificationResult {
    const { type, submission } = ctx;

    switch (type) {
        case "checklist": {
            if ((submission.checkedSteps ?? 0) < ctx.totalSteps) {
                return { ok: false, error: "Please check off every step first." };
            }
            return { ok: true };
        }

        case "timer": {
            const elapsedMin = (ctx.now.getTime() - ctx.startedAt.getTime()) / 60_000;
            const requiredMin = ctx.durationMin * TIMER_MIN_RATIO;
            if (elapsedMin < requiredMin) {
                const left = Math.ceil(requiredMin - elapsedMin);
                return { ok: false, error: `Timer is not finished. About ${left} more minute(s) to go.` };

            }
            return { ok: true };
        }

        case "text": {
            if ((submission.text ?? "").trim().length < 10) {
                return { ok: false, error: "Write at least a sentence (10+ characters) about what you did." };
            }
            return { ok: true }
        }

        case "self_report": {
            if (!submission.confirmed) {
                return { ok: false, error: "Please confirm that you completed the quest." };
            }
            return { ok: true };
        }

        case "photo": {
            // TODO (good first issue): real photo upload + optional AI vision check.
            // For now it behaves like self-report.
            if (!submission.confirmed) {
                return { ok: false, error: "Please confirm that you completed the quest." };
            }
            return { ok: true };
        }
    }
}