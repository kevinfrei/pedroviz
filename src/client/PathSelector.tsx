// SPDX-License-Identifier: AGPL-3.0-or-later

import { ReactElement, useEffect } from 'react';
import { useAtom, useAtomValue } from 'jotai';

import { Button, Label, Text } from '@fluentui/react-components';
import { ArrowDownloadRegular } from '@fluentui/react-icons';

import { Strings } from './constants';
import {
  PathForSelectedTeamAtom,
  SelectedTeamAtom,
  TeamsAtom,
} from './state/UserCode';
import { AutoSelector } from './ui-tools/AutoSelector';

export function TeamSelector(): ReactElement {
  const teams = useAtomValue(TeamsAtom); //['TeamCode', 'LearnBot'];
  const [team, setTeam] = useAtom(SelectedTeamAtom);
  useEffect(() => {
    if (teams.length === 1) {
      setTeam(teams[0]!);
    }
  }, [teams, setTeam]);
  return (
    <>
      <Label className="pathLabel">Robot:&nbsp;</Label>
      <AutoSelector
        prompt={Strings.select_a_bot}
        items={teams}
        selected={team}
        setSelected={setTeam}
      />
    </>
  );
}

export function FileSelector(): ReactElement {
  const file = useAtomValue(PathForSelectedTeamAtom);
  return file ? (
    <Text>{file}</Text>
  ) : (
    <Button
      icon={<ArrowDownloadRegular />}
      onClick={() => alert('not yet implemented')}>
      {Strings.install_files}
    </Button>
  );
}
