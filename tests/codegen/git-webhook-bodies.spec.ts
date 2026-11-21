import { describe, expect, it } from 'vitest';

import {
  ReceiveGitHubWebhookInternalBody,
  ReceiveGitLabWebhookInternalBody,
} from '../../packages/contracts/src/generated/validators/internal/integration-service';
import {
  ReceiveGitHubWebhookBody,
  ReceiveGitLabWebhookBody,
} from '../../packages/contracts/src/generated/validators/public/webhooks';

describe('generated Git webhook body validators', () => {
  it.each([
    ReceiveGitHubWebhookBody,
    ReceiveGitLabWebhookBody,
    ReceiveGitHubWebhookInternalBody,
    ReceiveGitLabWebhookInternalBody,
  ])('preserves an Express Buffer and accepts the generated browser type', (schema) => {
    const json: string = '{ "action" : "opened", "title" : "Révision" }\n';
    const buffer: Buffer = Buffer.from(json);
    const blob: Blob = new Blob([json], { type: 'application/json' });

    expect(schema.parse(buffer)).toBe(buffer);
    expect(schema.parse(blob)).toBe(blob);
    expect(schema.safeParse({ action: 'opened' }).success).toBe(false);
    expect(schema.safeParse(json).success).toBe(false);
  });
});
