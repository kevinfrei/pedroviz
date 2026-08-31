// SPDX-License-Identifier: AGPL-3.0-or-later

// I'm trying to see if I can detect Bun doing a hot-module reload on the server side,
// because I'm changing the CWD, and I shouldn't do that upon HMR.

let HMR = false;

export function isHMR(): boolean {
  console.log('HMR State: ', HMR);
  const res = HMR;
  HMR = true;
  return res;
}
