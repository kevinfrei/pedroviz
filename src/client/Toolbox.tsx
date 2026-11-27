// SPDX-License-Identifier: AGPL-3.0-or-later

import { ReactElement } from 'react';
import { useAtomValue } from 'jotai';

import {
  DraggableDialog,
  DraggableDialogHandle,
  DraggableDialogSurface,
} from '@fluentui-contrib/react-draggable-dialog';
import {
  Button,
  DialogBody,
  DialogContent,
  DialogTitle,
  DialogTrigger,
  Label,
} from '@fluentui/react-components';
import {
  CodeBlockFilled,
  DeleteFilled,
  Dismiss24Regular,
  ToolboxFilled,
} from '@fluentui/react-icons';
import { isUndefined } from 'node_modules/@freik/typechk/lib/esm';

import { Strings } from './Constants';
import { TeamSelector } from './FileChoosing';
import { CreatePedroVizJava, KillAdb } from './state/API';
import { SelectedTeamAtom } from './state/UserCode';

export function Toolbox(): ReactElement {
  const team = useAtomValue(SelectedTeamAtom);
  return (
    <DraggableDialog modalType="modal">
      <DialogTrigger disableButtonEnhancement>
        <Button appearance="primary" icon={<ToolboxFilled />}>
          Toolbox
        </Button>
      </DialogTrigger>
      <DraggableDialogSurface>
        <DialogBody>
          <DraggableDialogHandle>
            <DialogTitle
              action={
                <DialogTrigger action="close">
                  <Button
                    appearance="subtle"
                    aria-label="close"
                    icon={<Dismiss24Regular />}
                  />
                </DialogTrigger>
              }
              style={{ textAlign: 'center' }}>
              Settings
            </DialogTitle>
          </DraggableDialogHandle>
          <DialogContent className="two-column">
            <Label htmlFor="chooseTeam" style={{ fontWeight: 'bold' }}>
              {Strings.select_a_bot}
            </Label>
            <TeamSelector id="chooseTeam" />
            <Label htmlFor="removeUpload" style={{ fontWeight: 'bold' }}>
              {Strings.RemoveAdbFile}
            </Label>
            <Button
              id="removeUpload"
              appearance="primary"
              icon={<DeleteFilled />}
              onClick={() =>
                KillAdb().then((resp) => window.alert(resp.toString()))
              }>
              {Strings.delete_upload}
            </Button>
            <Label htmlFor="createJava" style={{ fontWeight: 'bold' }}>
              Create the PedroViz.java file
            </Label>
            <Button
              disabled={isUndefined(team)}
              id="createJava"
              appearance="primary"
              icon={<CodeBlockFilled />}
              onClick={() =>
                CreatePedroVizJava(team!).then((resp) =>
                  window.alert(resp.toString()),
                )
              }>
              {Strings.create_java}
            </Button>
          </DialogContent>
        </DialogBody>
      </DraggableDialogSurface>
    </DraggableDialog>
  );
}
