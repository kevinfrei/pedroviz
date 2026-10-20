// SPDX-License-Identifier: AGPL-3.0-or-later

import { promises as fsp } from 'node:fs';

export async function isDirectory(path: string): Promise<boolean> {
  try {
    const stats = await fsp.stat(path);
    return stats.isDirectory();
  } catch {
    // An error is thrown if the path doesn't exist
    return false;
  }
}
