// SPDX-License-Identifier: AGPL-3.0-or-later

export function SavePath(team: string, path: string, data: string): Response {
  return Response.json({
    message: `Data received for ${team}: ${data}`,
  });
}
