import { describe, expect, it } from 'vitest';
import type { ZodType } from 'zod';

import type {
  OnboardingChecklistPatch,
  OnboardingDraftPatch,
  OnboardingFinish,
  OnboardingState,
} from '../../packages/contracts/src/generated/types/public/tasks';
import {
  FinishOnboardingInternalBody,
  FinishOnboardingInternalResponse,
  GetOnboardingInternalResponse,
  UpdateOnboardingChecklistInternalBody,
  UpdateOnboardingInternalBody,
} from '../../packages/contracts/src/generated/validators/internal/task-service';
import {
  FinishOnboardingBody,
  FinishOnboardingResponse,
  GetOnboardingResponse,
  UpdateOnboardingBody,
  UpdateOnboardingChecklistBody,
} from '../../packages/contracts/src/generated/validators/public/tasks';

describe.each([
  {
    boundary: 'public',
    state: GetOnboardingResponse,
    draft: UpdateOnboardingBody,
    checklist: UpdateOnboardingChecklistBody,
    finish: FinishOnboardingBody,
    created: FinishOnboardingResponse,
  },
  {
    boundary: 'internal',
    state: GetOnboardingInternalResponse,
    draft: UpdateOnboardingInternalBody,
    checklist: UpdateOnboardingChecklistInternalBody,
    finish: FinishOnboardingInternalBody,
    created: FinishOnboardingInternalResponse,
  },
])(
  '$boundary onboarding contracts',
  ({
    state,
    draft,
    checklist,
    finish,
    created,
  }: Record<'state' | 'draft' | 'checklist' | 'finish' | 'created', ZodType>) => {
    const initial: OnboardingState = {
      version: 1,
      wizard: {
        status: 'in-progress',
        step: 'space',
        preset: 'dev',
        name: null,
        prefix: null,
        color: 'violet',
      },
      provisioning: null,
      checklist: {
        presentation: 'expanded',
        firstTaskCreated: false,
        invitationSent: false,
        boardTried: false,
      },
    };

    it('reads an unprovisioned wizard and its initial checklist', () => {
      expect(state.parse(initial)).toEqual(initial);
      expect(state.safeParse({ ...initial, version: 0 }).success).toBe(false);
    });

    it('saves partial draft choices and supports clearing the name and prefix', () => {
      const resume: OnboardingDraftPatch = {
        step: 'team',
        preset: 'mkt',
        name: 'Produit',
        prefix: 'CAD',
      };
      expect(draft.parse(resume)).toEqual(resume);
      expect(draft.parse({ name: null, prefix: null })).toEqual({ name: null, prefix: null });
      expect(draft.parse({ dismissed: true })).toEqual({ dismissed: true });
      expect(draft.safeParse({ dismissed: false }).success).toBe(false);
      expect(draft.safeParse({ preset: 'external' }).success).toBe(false);
      expect(draft.safeParse({ prefix: 'cad' }).success).toBe(false);
    });

    it('records personal presentation and outcomes as a partial patch', () => {
      const markers: OnboardingChecklistPatch = {
        presentation: 'collapsed',
        invitationSent: true,
        boardTried: true,
      };
      expect(checklist.parse(markers)).toEqual(markers);
      expect(checklist.parse({ invitationSent: true })).toEqual({ invitationSent: true });
      expect(checklist.safeParse({ invitationSent: false }).success).toBe(false);
      expect(checklist.safeParse({ boardTried: false }).success).toBe(false);
      expect(checklist.safeParse({ presentation: 'closed' }).success).toBe(false);
    });

    it('requires the usual space prefix and an existing preset to finish', () => {
      const blank: OnboardingFinish = { name: 'Produit', prefix: 'CAD', preset: 'blank' };
      expect(finish.parse(blank)).toEqual(blank);
      expect(finish.safeParse({ name: blank.name, preset: blank.preset }).success).toBe(false);
      expect(finish.safeParse({ ...blank, prefix: 'FRANCE' }).success).toBe(false);
      expect(finish.safeParse({ ...blank, preset: 'import' }).success).toBe(false);
    });

    it('keeps identities, provisioning and the first-task marker under server control', () => {
      expect(draft.safeParse({ step: 'team', organizationId: 'untrusted' }).success).toBe(false);
      expect(checklist.safeParse({ firstTaskCreated: true }).success).toBe(false);
      expect(
        checklist.safeParse({ invitationSent: true, email: 'invite@example.com' }).success,
      ).toBe(false);
      expect(
        finish.safeParse({ name: 'Produit', prefix: 'CAD', preset: 'blank', spaceId: 'untrusted' })
          .success,
      ).toBe(false);
    });

    it('returns both provisioned resource IDs in the same versioned state shape', () => {
      const provisioned: OnboardingState = {
        ...initial,
        version: 2,
        wizard: { ...initial.wizard, status: 'finished', name: 'Produit', prefix: 'CAD' },
        provisioning: {
          spaceId: '019a7000-1a2b-7c3d-8e4f-5a6b7c8d9e01',
          firstListId: '019a7001-2b3c-7d4e-8f5a-6b7c8d9e0f12',
        },
      };
      expect(created.parse(provisioned)).toEqual(provisioned);
      expect(
        created.safeParse({
          ...provisioned,
          provisioning: { spaceId: provisioned.provisioning?.spaceId },
        }).success,
      ).toBe(false);
    });
  },
);
