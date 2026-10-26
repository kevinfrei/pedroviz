// SPDX-License-Identifier: AGPL-3.0-or-later

import { ReactElement, useEffect } from 'react';
import { useAtom, useAtomValue } from 'jotai';

import { Button, Label, Text } from '@fluentui/react-components';
import { ArrowDownloadRegular } from '@fluentui/react-icons';

import { Strings } from './Constants';
import {
  SelectedPathsAtom,
  SelectedTeamAtom,
  TeamsAtom,
} from './state/UserCode';
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

export function FileSelector(): ReactElement {
  const paths = useAtomValue(SelectedPathsAtom);
  return paths ? (
    <Text>{Strings.pedropaths_json_file_name}</Text>
  ) : (
    <Button
      icon={<ArrowDownloadRegular />}
      onClick={() => alert('not yet implemented')}>
      {Strings.install_files}
    </Button>
  );
}
