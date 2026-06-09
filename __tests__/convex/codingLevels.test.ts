import { describe, expect, it } from "@jest/globals";

import { codeLevels, allLevels } from "../../convex/levels_data";

// Tier → passing score, mirroring mapCodingLessonToLevel (momentum-first easy,
// rising bar). If the mapper changes, this is the single source to update.
const PASSING_BY_TIER: Record<string, number> = {
	easy: 35,
	medium: 55,
	hard: 70,
};

describe("coding levels (30-level prompt-engineering track)", () => {
	it("exposes all 30 coding levels", () => {
		expect(codeLevels.length).toBe(30);
		const ids = codeLevels.map((l) => l.id);
		expect(new Set(ids).size).toBe(30); // no duplicate ids
		expect(ids).toContain("code-1-easy");
		expect(ids).toContain("code-30-hard");
	});

	it("every level is evaluable by the prompt-only judge (grading criteria + rubric)", () => {
		for (const level of codeLevels) {
			expect(level.type).toBe("code");
			expect(level.whatUserSees).toBeTruthy();
			const grading = level.grading as { criteria?: unknown[] } | undefined;
			expect(Array.isArray(grading?.criteria)).toBe(true);
			expect((grading?.criteria ?? []).length).toBeGreaterThan(0);
		}
	});

	it("derives difficulty + passing score from the id tier", () => {
		for (const level of codeLevels) {
			const tier = level.id.split("-").pop() as string;
			expect(level.passingScore).toBe(PASSING_BY_TIER[tier]);
		}
	});

	it("marks the final hard level as the boss capstone", () => {
		const boss = codeLevels.filter(
			(l) => (l as { lessonMode?: string }).lessonMode === "boss",
		);
		expect(boss.map((l) => l.id)).toEqual(["code-30-hard"]);
	});

	it("is live in the seeded pool, with image hidden", () => {
		const types = new Set<string>(allLevels.map((l) => l.type));
		expect(types.has("code")).toBe(true);
		expect(types.has("agent")).toBe(true);
		// Image is hidden for launch — no image levels are seeded.
		expect(types.has("image")).toBe(false);
		// All 30 coding levels made it into the seeded set.
		const codeInAll = allLevels.filter((l) => l.type === "code");
		expect(codeInAll.length).toBe(30);
	});
});
