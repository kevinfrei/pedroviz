// SPDX-License-Identifier: AGPL-3.0-or-later

import { spawn } from 'node:child_process';
import { promises as fsp } from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const isWin = () => process.platform === 'win32';
const isMac = () => process.platform === 'darwin';
const adbName = () => (isWin() ? 'adb.exe' : 'adb');

export async function resolveAdbExecutable(
  configuredPath?: string,
): Promise<string> {
  const candidates: string[] =
    configuredPath && configuredPath.trim().length ? [configuredPath] : [];
  const home = os.homedir();

  if (isWin()) {
    const localAppData =
      process.env.LOCALAPPDATA ?? path.join(home, 'AppData', 'Local');
    candidates.push(
      path.join(localAppData, 'Android', 'Sdk', 'platform-tools', adbName()),
      path.join('C:', 'Android', 'android-sdk', 'platform-tools', adbName()),
    );
  } else if (isMac()) {
    candidates.push(
      path.join(home, 'Library', 'Android', 'sdk', 'platform-tools', adbName()),
      path.join('/', 'opt', 'homebrew', 'bin', adbName()),
      path.join('/', 'usr', 'local', 'bin', adbName()),
    );
  } else {
    candidates.push(
      path.join(home, 'Android', 'Sdk', 'platform-tools', adbName()),
      path.join('/', 'usr', 'lib', 'android-sdk', 'platform-tools', adbName()),
    );
  }

  for (const candidate of candidates) {
    if (await fsp.exists(candidate)) {
      return candidate;
    }
  }

  return adbName();
}

async function adbPath(): Promise<string> {
  // TODO: Find an ADB for the platform we're on:
  return await resolveAdbExecutable();
}

type Listener = (text: string) => void;

// This lets us tee the stuff to as many places as you want
async function readStream(
  stream: AsyncIterable<Buffer>,
  ...listeners: Listener[]
): Promise<void> {
  for await (const chunk of stream) {
    const text = chunk.toString('utf8');
    listeners.map((fn) => fn(text));
  }
}

export async function runAdb(
  args: string[],
): Promise<{ code: number; stdout: string; stderr: string }> {
  const child = spawn(await adbPath(), args, {
    stdio: ['ignore', 'pipe', 'pipe'],
    shell: false,
  });

  let stdout = '';
  let stderr = '';

  // Stream stdout and stderr concurrently so neither blocks the other
  await Promise.all([
    readStream(
      child.stdout,
      (t) => process.stdout.write(t),
      (t) => (stdout += t),
    ),
    readStream(
      child.stderr,
      (t) => process.stderr.write(t),
      (t) => (stderr += t),
    ),
  ]);

  const code = await new Promise<number>((resolve, reject) => {
    child.once('error', reject);
    child.once('close', (exitCode) => resolve(exitCode ?? -31415));
  });

  return { code, stdout, stderr };
}

/*
// Examples for uploading and removing a file on the robot:
const remotePath = "/sdcard/Android/data/com.qualcomm.ftcrobotcontroller/files/paths/my_path.json";

// Upload
const pushResult = await runAdb(["push", "./pedropaths.json", remotePath]);
if (pushResult.code !== 0) {
  throw new Error(`adb push failed (${pushResult.code}): ${pushResult.stderr}`);
}

// Remove
const rmResult = await runAdb(["shell", "rm", "-f", remotePath]);
if (rmResult.code !== 0) {
  throw new Error(`adb shell rm failed (${rmResult.code}): ${rmResult.stderr}`);
}
*/
