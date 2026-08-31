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
    if (ext === '.png' || ext === '.jpg' || ext === '.jpeg') {
      const name = path.basename(entry.name.toLocaleLowerCase(), ext);
      if (name === 'field' || name === 'field-light' || name === 'field-dark') {
        images.set(name + ext, path.join(root, entry.name));
      }
    }
  }
  return images.size > 0;
}

export function HasFieldImage(): boolean {
  return images.size !== 0;
}

export function GetFieldImagePath(theme: 'dark' | 'light'): string | undefined {
  if (!HasFieldImage()) {
    return;
  }
  return (
    images.get(`field-${theme}.png`) ||
    images.get(`field-${theme}.jpg`) ||
    images.get(`field-${theme}.jpeg`) ||
    images.get('field.png') ||
    images.get('field.jpg') ||
    images.get('field.jpeg')
  );
}

const darkFg = '#ccc';
const liteFg = '#333';

const svg = `<svg viewBox="5 5 1130 1130" version="1.1" xmlns="http://www.w3.org/2000/svg">
<!--
Copyright (C) 2026 Kevin Frei
Licensed under the GNU Affero General Public License v3.0 or later.
See https://www.gnu.org/licenses/agpl-3.0.html
-->
<defs>
<clipPath id="bounds">
<rect x="5" y="5" width="1130" height="1130"/>
</clipPath>
<path id="ln" fill="none" stroke="%%%FG%%%" stroke-width="0.8" stroke-linejoin="round" d="M0,4L5,8L7,8L5,0L17,0L15,8L27,8L25,0L37,0L35,8L47,8L45,0L57,0L55,8L67,8L65,0L77,0L75,8L87,8L85,0L93,0L94.25,4"/>
<g id="corner">
<use href="#ln" x="4" y="0"/>
<use href="#ln" x="-192.5" y="-8" transform="rotate(180)"/>
<use href="#ln" x="4" y="-8" transform="rotate(90)"/>
<use href="#ln" x="-192.5" y="0" transform="rotate(-90)"/>
</g>
<g id="row">
<use href="#corner" x="0"/>
<use href="#corner" x="188.5"/>
<use href="#corner" x="377"/>
<use href="#corner" x="565.5"/>
<use href="#corner" x="754"/>
<use href="#corner" x="942.5"/>
<use href="#corner" x="1131"/>
</g>
</defs>
<g clipPath="url(#bounds)">
<use href="#row"/>
<use href="#row" y="188.5"/>
<use href="#row" y="377"/>
<use href="#row" y="565.5"/>
<use href="#row" y="754"/>
<use href="#row" y="942.5"/>
<use href="#row" y="1131"/>
</g>
</svg>`;
export function GetThemedSVG(theme: 'dark' | 'light'): string {
  return svg.replace('%%%FG%%%', theme === 'light' ? liteFg : darkFg);
}
