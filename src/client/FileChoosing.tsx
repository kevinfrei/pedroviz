// SPDX-License-Identifier: AGPL-3.0-or-later

import { ReactElement, useEffect } from 'react';
import { useAtom, useAtomValue } from 'jotai';

import { Button } from '@fluentui/react-components';
import { BotAddFilled, SaveFilled } from '@fluentui/react-icons';

import { Strings } from './Constants';
import { AdbPaths, PutPaths } from './state/API';
import { pathsFileFamily, SelectedTeamAtom, TeamsAtom } from './state/UserCode';
import { AutoSelector } from './ui-tools/AutoSelector';
import { useToast } from './ui-tools/NotificationToast';

export function TeamSelector({ id }: { id?: string }): ReactElement {
  const teams = useAtomValue(TeamsAtom); //['TeamCode', 'LearnBot'];
  const [selectedTeam, selectTeam] = useAtom(SelectedTeamAtom);

  useEffect(() => {
    if (teams.length === 1) {
      selectTeam(teams[0]!);
    }
  }, [teams, selectTeam]);
  return teams.length > 1 ? (
    <AutoSelector
      id={id}
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
  const setToast = useToast();
  return (
    <Button
      appearance="primary"
      icon={<SaveFilled />}
      disabled={!team}
      onClick={() => {
        if (get && team) {
          PutPaths(team, get).then((res) => {
            refresher();
            if (res === '{"result":0}') {
              setToast(Strings.SaveSuccess, 'success');
            } else {
              setToast(res, 'error');
            }
          });
        }
      }}>
      {Strings.save_json}
    </Button>
  );
}

export function UploadToRobot(): ReactElement {
  const team = useAtomValue(SelectedTeamAtom);
  const pf = useAtomValue(pathsFileFamily(team!));
  const setToast = useToast();
  return (
    <Button
      appearance="primary"
      icon={<BotAddFilled />}
      onClick={() => {
        if (pf && team) {
          AdbPaths(pf).then((res) => {
            if (res === '') {
              setToast(Strings.UploadSuccess, 'success');
            } else {
              setToast(res, 'error');
            }
          });
        }
      }}>
      {Strings.upload_to_bot}
    </Button>
  );
}
