// SPDX-License-Identifier: AGPL-3.0-or-later

import { ReactElement, useEffect } from 'react';
import { useAtom, useAtomValue } from 'jotai';

import { Button } from '@fluentui/react-components';
import { BotAddFilled, DeleteFilled, SaveFilled } from '@fluentui/react-icons';

import { Strings } from './Constants';
import { AdbPaths, KillAdb, PutPaths } from './state/API';
import { pathsFileFamily, SelectedTeamAtom, TeamsAtom } from './state/UserCode';
import { AutoSelector } from './ui-tools/AutoSelector';

export function TeamSelector(): ReactElement {
  const teams = useAtomValue(TeamsAtom); //['TeamCode', 'LearnBot'];
  const [selectedTeam, selectTeam] = useAtom(SelectedTeamAtom);
  useEffect(() => {
    if (teams.length === 1) {
      selectTeam(teams[0]!);
    }
  }, [teams, selectTeam]);
  return teams.length > 1 ? (
    <AutoSelector
      prompt={Strings.select_a_bot}
      items={[...teams]}
      selected={selectedTeam || ''}
      setSelected={selectTeam}
    />
  ) : (
    <></>
  );
}

export function SaveButton(): ReactElement {
  const team = useAtomValue(SelectedTeamAtom);
  const [get, refresher] = useAtom(pathsFileFamily(team!));
  return (
    <Button
      appearance="primary"
      icon={<SaveFilled />}
      disabled={!team}
      onClick={() => {
        if (get && team) {
          PutPaths(team, get).then(() => refresher());
        }
      }}>
      {Strings.save_json}
    </Button>
  );
}

export function UploadToRobot(): ReactElement {
  const team = useAtomValue(SelectedTeamAtom);
  const pf = useAtomValue(pathsFileFamily(team!));
  return (
    <Button
      appearance="primary"
      icon={<BotAddFilled />}
      onClick={() => {
        if (pf && team) {
          AdbPaths(pf).then((resp) => window.alert(resp.toString()));
        }
      }}>
      {Strings.upload_to_bot}
    </Button>
  );
}

export function RemoveUpload(): ReactElement {
  return (
    <Button
      appearance="primary"
      icon={<DeleteFilled />}
      onClick={() => KillAdb().then((resp) => window.alert(resp.toString()))}>
      {Strings.delete_upload}
    </Button>
  );
}
