import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import { ListTaskGitLinksInternalResponse } from '../../packages/contracts/src/generated/validators/internal/integration-service';
import { ListTaskGitLinksResponse } from '../../packages/contracts/src/generated/validators/public/git-links';
import { GetTaskDetailResponse } from '../../packages/contracts/src/generated/validators/public/tasks';
import { dereference } from '../../scripts/lib/dereference.mjs';

// The public route, the internal route and the Development part of the task detail share one
// shape: the gateway relays Integration's page unchanged.

const repository = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const page = dereference('components/git-links.yaml', repository).components.examples.TaskGitLinks
  .value;

describe.each([
  { surface: 'public', response: ListTaskGitLinksResponse },
  { surface: 'internal', response: ListTaskGitLinksInternalResponse },
])('$surface Git link page validator', ({ response }) => {
  it('accepts the shared CAD-482 example', () => {
    expect(response.parse(page)).toEqual(page);
  });

  it('requires every recorded member, null when absent', () => {
    const [pullRequest] = page.items;
    const { branch: _branch, ...withoutBranch } = pullRequest;

    expect(response.safeParse({ ...page, items: [withoutBranch] }).success).toBe(false);
  });

  it('rejects an abbreviated head commit and a request number of zero', () => {
    const [pullRequest] = page.items;

    expect(
      response.safeParse({ ...page, items: [{ ...pullRequest, headSha: 'c4e1a9f2' }] }).success,
    ).toBe(false);
    expect(response.safeParse({ ...page, items: [{ ...pullRequest, number: 0 }] }).success).toBe(
      false,
    );
  });

  it('keeps provider, kind and state open to later values', () => {
    const [pullRequest] = page.items;
    const later = { ...pullRequest, provider: 'bitbucket', kind: 'commit', state: 'draft' };

    expect(response.safeParse({ ...page, items: [later] }).success).toBe(true);
  });
});

describe('task detail Development part', () => {
  const detail = dereference('openapi/public/tasks.yaml', repository).paths[
    '/v1/tasks/{taskKey}/detail'
  ].get.responses['200'].content['application/json'].example;

  it('is optional and named in partial when missing', () => {
    expect(GetTaskDetailResponse.safeParse({ ...detail, partial: ['development'] }).success).toBe(
      true,
    );
  });

  it('carries the first Git link page', () => {
    expect(GetTaskDetailResponse.safeParse({ ...detail, development: page }).success).toBe(true);
    expect(
      GetTaskDetailResponse.safeParse({ ...detail, development: { items: page.items } }).success,
    ).toBe(false);
  });
});
