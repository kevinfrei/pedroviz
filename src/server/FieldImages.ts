// SPDX-License-Identifier: AGPL-3.0-or-later

import { promises as fsp } from 'node:fs';
import * as path from 'node:path';

import { isString } from '@freik/typechk';

import { GetRelativeRepoRoot } from './getpaths';

// Find field image(s) from the repo root
// .png's before .jpg's
// field-dark & field-light, or just one of them
// or field.[png/jpg]

const images: Map<string, string> = new Map();

export async function CheckForFieldImages(): Promise<boolean> {
  images.clear();
  const root = GetRelativeRepoRoot();
  const entries = await fsp.readdir(root, { withFileTypes: true });

  for (const entry of entries) {
    const ext = path.extname(entry.name).toLocaleLowerCase();
    if (ext === '.png' || ext === '.jpg') {
      const name = path.basename(entry.name).toLocaleLowerCase();
      if (name === 'field' || name === 'field-light' || name === 'field-dark') {
        images.set(entry.name.toLocaleLowerCase(), path.join(root, entry.name));
      }
    }
  }
  return images.size > 0;
}

export function HasFieldImage(): boolean {
  return images.size !== 0;
}

export function GetFieldImage(theme: 'dark' | 'light'): string | undefined {
  if (HasFieldImage()) {
    return;
  }
  return (
    images.get(`field-${theme}.png`) ||
    images.get(`field-${theme}.jpg`) ||
    images.get('field.png') ||
    images.get('field.jpg')
  );
}
