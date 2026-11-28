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
import { hasField, hasFieldOf, isNumber, isUndefined } from '@freik/typechk';

import { Strings } from './Constants';
import { TeamSelector } from './FileChoosing';
import { CreatePedroVizJava, KillAdb } from './state/API';
import { SelectedTeamAtom, TeamsAtom } from './state/UserCode';
import { useToast } from './ui-tools/NotificationToast';

export function Toolbox(): ReactElement {
  const setToast = useToast();
  const teams = useAtomValue(TeamsAtom); //['TeamCode', 'LearnBot'];
  const team = useAtomValue(SelectedTeamAtom);
  const showRes = (prom: Promise<unknown>, success: string) => {
    return prom.then((resp) => {
      if (hasFieldOf(resp, 'result', isNumber) && resp.result === 0) {
        setToast(success, 'success');
      } else if (hasField(resp, 'error')) {
        setToast(String(resp.error), 'error');
      } else {
        setToast('Unexpected error: ' + JSON.stringify(resp), 'error');
      }
    });
  };
  const teamSel =
    teams.length < 2 ? (
      <></>
    ) : (
      <>
        <Label htmlFor="chooseTeam" style={{ fontWeight: 'bold' }}>
          {Strings.select_a_bot}
        </Label>
        <TeamSelector id="chooseTeam" />
      </>
    );
  return (
    <DraggableDialog modalType="modal">
      <DialogTrigger disableButtonEnhancement>
        <Button appearance="primary" icon={<ToolboxFilled />}>
          {Strings.Toolbox}
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
              {Strings.Toolbox}
            </DialogTitle>
          </DraggableDialogHandle>
          <DialogContent className="two-column">
            {teamSel}
            <Label htmlFor="removeUpload" style={{ fontWeight: 'bold' }}>
              {Strings.RemoveAdbFile}
            </Label>
            <Button
              id="removeUpload"
              appearance="primary"
              icon={<DeleteFilled />}
              onClick={() => showRes(KillAdb(), Strings.KillSuccess)}>
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
                showRes(
                  CreatePedroVizJava(team!),
                  Strings.CreateJavaSuccess(team!),
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
