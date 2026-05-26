declare const describe: (name: string, fn: () => void) => void;
declare const it: (name: string, fn: () => void) => void;
declare const expect: any;

import { agentLevels, allLevels } from "../../convex/levels_data";
import { buildLessonDefinitionsFromLegacyLevels } from "../../convex/questProductData";

type AgentLevel = (typeof agentLevels)[number];

const PASSING_BY_TIER: Record<string, number> = {
	easy: 60,
	medium: 70,
	hard: 78,
};

describe("agent challenge levels", () => {
	it("defines ten agent levels spread beginner -> advanced", () => {
		expect(agentLevels.length).toBe(10);

		const byDifficulty = agentLevels.reduce<Record<string, number>>(
			(acc, level) => {
				acc[level.difficulty] = (acc[level.difficulty] ?? 0) + 1;
				return acc;
			},
			{},
		);
		expect(byDifficulty).toEqual({
			beginner: 3,
			intermediate: 4,
			advanced: 3,
		});
	});

	it("derives passing scores from the id suffix tier (60/70/78)", () => {
		for (const level of agentLevels) {
			const tier = level.id.split("-").pop() as string;
			expect(level.passingScore).toBe(PASSING_BY_TIER[tier]);
		}
	});

	it("never uses a scaffold template — checklist for guided tiers, none for advanced", () => {
		for (const level of agentLevels) {
			expect((level as { scaffoldTemplate?: string }).scaffoldTemplate).toBeUndefined();
			if (level.difficulty === "advanced") {
				expect(level.scaffoldType).toBe("none");
				expect(level.checklistItems).toBeUndefined();
			} else {
				expect(level.scaffoldType).toBe("checklist");
				expect((level.checklistItems ?? []).length).toBeGreaterThan(0);
			}
		}
	});

	it("carries a visible agentBrief and a hidden whatUserSees rubric on every level", () => {
		for (const level of agentLevels) {
			expect(typeof level.agentBrief).toBe("string");
			expect((level.agentBrief ?? "").length).toBeGreaterThan(0);
			expect(typeof level.whatUserSees).toBe("string");
			expect((level.whatUserSees ?? "").length).toBeGreaterThan(0);
		}
	});

	it("grades purely by llm_judge with escalating, distinct criteria", () => {
		const seenCriteriaIds = new Set<string>();
		const criteriaSetSignatures = new Set<string>();

		for (const level of agentLevels as AgentLevel[]) {
			const grading = level.grading as {
				method?: string;
				criteria?: Array<{ id: string; method?: string }>;
			};
			expect(grading.method).toBe("llm_judge");
			const criteria = grading.criteria ?? [];
			expect(criteria.length).toBeGreaterThan(0);
			// Pure llm_judge — no static_analysis dimensions for agents.
			for (const criterion of criteria) {
				expect(criterion.method).toBe("llm_judge");
				// No criterion id is reused across the whole agent set.
				expect(seenCriteriaIds.has(criterion.id)).toBe(false);
				seenCriteriaIds.add(criterion.id);
			}
			// No two levels share an identical set of criteria ids.
			const signature = criteria
				.map((criterion) => criterion.id)
				.sort()
				.join("|");
			expect(criteriaSetSignatures.has(signature)).toBe(false);
			criteriaSetSignatures.add(signature);
		}

		// Criteria strictness rises with difficulty: advanced levels cover all
		// five dimensions, beginners fewer.
		const easy = agentLevels.find((l) => l.difficulty === "beginner")!;
		const hard = agentLevels.find((l) => l.difficulty === "advanced")!;
		const easyCount = (easy.grading as { criteria?: unknown[] }).criteria?.length ?? 0;
		const hardCount = (hard.grading as { criteria?: unknown[] }).criteria?.length ?? 0;
		expect(hardCount).toBeGreaterThan(easyCount);
	});

	it("is wired into the combined level pool and the agent quest track", () => {
		for (const level of agentLevels) {
			expect(allLevels.some((l) => l.id === level.id)).toBe(true);
		}

		const lessons = buildLessonDefinitionsFromLegacyLevels(allLevels);
		const agentLessons = lessons.filter((lesson) => lesson.trackId === "agent");
		expect(agentLessons.length).toBe(10);
		// The visible brief round-trips into the content payload for the client,
		// and the hidden rubric rides along in the target payload for the judge.
		for (const lesson of agentLessons) {
			expect(lesson.lessonType).toBe("agent");
			expect(typeof lesson.contentPayload.agentBrief).toBe("string");
			expect(typeof lesson.targetPayload.whatUserSees).toBe("string");
		}
	});
});
