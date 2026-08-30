// SPDX-License-Identifier: AGPL-3.0-or-later

import { ReactElement, useCallback, useMemo, useState } from 'react';
import { useAtom, WritableAtom } from 'jotai';

import { TinyColor } from '@ctrl/tinycolor';
import {
  AlphaSlider,
  Button,
  ColorArea,
  ColorPicker,
  ColorSlider,
  ColorSliderProps,
  Dialog,
  DialogBody,
  DialogContent,
  DialogSurface,
  DialogTitle,
  DialogTrigger,
  Dropdown,
  DropdownProps,
  Label,
  makeStyles,
  Option,
  SelectTabData,
  SelectTabEvent,
  Slider,
  SpinButton,
  SpinButtonChangeEvent,
  SpinButtonOnChangeData,
  Switch,
  Tab,
  TabList,
  TabValue,
} from '@fluentui/react-components';
import {
  SettingsFilled,
  WeatherMoonFilled,
  WeatherSunnyRegular,
} from '@fluentui/react-icons';

import { Strings } from './constants';
import {
  BotColorAtom,
  BotLengthAtom,
  BotShapeAtom,
  BotTinyColorAtom,
  BotWidthAtom,
  CoordinateVisibilityAtom,
  FieldVisibilityAtom,
  PathHeadingCountAtom,
  PathHeadingLengthAtom,
  PathHeadingThicknessAtom,
  PathPointSizeAtom,
  PathPointStyleAtom,
  PathPointThicknessAtom,
  PathThicknessAtom,
  ShowPathHeadingAtom,
  ThemeAtom,
} from './state/SavedSettings';
import { BotShapes, CtrlPtStyles } from './types';

function getCtrlPtName(s: CtrlPtStyles): string {
  switch (s) {
    case CtrlPtStyles.Circle:
      return 'Circle';
    case CtrlPtStyles.X:
      return 'X';
    case CtrlPtStyles.Crosshair:
      return 'Crosshair';
    case CtrlPtStyles.Triangle:
      return 'Triangle';
    case CtrlPtStyles.Square:
      return 'Square';
    case CtrlPtStyles.None:
      return 'Nothing';
  }
}

const ctrlPtStyles: CtrlPtStyles[] = [
  CtrlPtStyles.Circle,
  CtrlPtStyles.X,
  CtrlPtStyles.Crosshair,
  CtrlPtStyles.Triangle,
  CtrlPtStyles.Square,
  CtrlPtStyles.None,
];

function getBotShapeName(n: BotShapes): string {
  switch (n) {
    case BotShapes.Rectangle:
      return 'Rectangle';
    case BotShapes.Ellipse:
      return 'Ellipse';
    case BotShapes.Trapezoid:
      return 'Trapezoid';
    case BotShapes.Triangle:
      return 'Triangle';
  }
}

const botShapes: BotShapes[] = [
  BotShapes.Rectangle,
  BotShapes.Ellipse,
  BotShapes.Trapezoid,
  BotShapes.Triangle,
];

function useSpinnerAtom(
  atom: WritableAtom<number, [number], void>,
): [
  number,
  (_ev: SpinButtonChangeEvent, data: SpinButtonOnChangeData) => void,
] {
  const [val, setVal] = useAtom(atom);
  const callback = useCallback(
    (_ev: SpinButtonChangeEvent, data: SpinButtonOnChangeData) => {
      if (
        data.value !== undefined &&
        data.value !== null &&
        !Number.isNaN(data.value)
      ) {
        setVal(data.value);
      }
    },
    [setVal],
  );
  return [val, callback];
}

export function Settings(): ReactElement {
  const [theTheme, setTheme] = useAtom(ThemeAtom);
  const [fieldViz, setFieldViz] = useAtom(FieldVisibilityAtom);
  const [showBotHeading, setShowBotHeading] = useAtom(ShowPathHeadingAtom);
  const [coordViz, setCoordViz] = useAtom(CoordinateVisibilityAtom);
  const [pathThickness, changePathThickness] =
    useSpinnerAtom(PathThicknessAtom);
  const [ctrlPtThickness, changeCtrlPtThickness] = useSpinnerAtom(
    PathPointThicknessAtom,
  );
  const [ctrlPtSize, changeCtrlPtSize] = useSpinnerAtom(PathPointSizeAtom);
  const [headingLength, changeHeadingLength] = useSpinnerAtom(
    PathHeadingLengthAtom,
  );
  const [headingCount, changeHeadingCount] =
    useSpinnerAtom(PathHeadingCountAtom);
  const [headingThickness, changeHeadingThickness] = useSpinnerAtom(
    PathHeadingThicknessAtom,
  );
  const [ctrlPtStyle, setCtrlPtStyle] = useAtom(PathPointStyleAtom);
  const [ctrlPtName, setCtrlPtName] = useState(getCtrlPtName(ctrlPtStyle));
  const onCtlPtStyleSelect: DropdownProps['onOptionSelect'] = useCallback(
    (ev, data) => {
      if (data.selectedOptions.length > 0) {
        setCtrlPtStyle(data.selectedOptions[0] as CtrlPtStyles);
        setCtrlPtName(data.optionText ?? '');
      }
    },
    [setCtrlPtStyle, setCtrlPtName],
  );
  const [botShape, setBotShape] = useAtom(BotShapeAtom);
  const [botShapeName, setBotShapeName] = useState(getBotShapeName(botShape));
  const onBotShapeSelect: DropdownProps['onOptionSelect'] = useCallback(
    (ev, data) => {
      if (data.selectedOptions.length > 0) {
        setBotShape(data.selectedOptions[0] as BotShapes);
        setBotShapeName(data.optionText ?? '');
      }
    },
    [setBotShape, setBotShapeName],
  );
  const [botWidth, changeBotWidth] = useSpinnerAtom(BotWidthAtom);
  const [botLength, changeBotLength] = useSpinnerAtom(BotLengthAtom);
  const [botTinyColor, setBotTinyColor] = useAtom(BotTinyColorAtom);
  const onSliderChange: ColorSliderProps['onChange'] = (_, data) => {
    setBotTinyColor(new TinyColor(data.color));
  };
  const [selectedTab, setSelectedTab] = useState<TabValue>('General');
  const onTabSelect = (event: SelectTabEvent, data: SelectTabData) => {
    setSelectedTab(data.value);
  };

  const BotSettings = useMemo(
    () => (
      <div className="two-column">
        <Label htmlFor="botWidthId">Robot Width</Label>
        <SpinButton
          id="botWidthId"
          value={botWidth}
          onChange={changeBotWidth}
          step={0.5}
          min={4}
          max={18}
        />
        <Label htmlFor="botLengthId">Robot Length</Label>
        <SpinButton
          id="botLengthId"
          value={botLength}
          onChange={changeBotLength}
          step={0.5}
          min={4}
          max={18}
        />
        <Label htmlFor="botShapeId">Robot Shape</Label>
        <Dropdown
          style={{ minWidth: 50 }}
          id="botShapeId"
          value={botShapeName}
          selectedOptions={[botShape]}
          onOptionSelect={onBotShapeSelect}>
          {botShapes.map((s) => (
            <Option key={s} text={getBotShapeName(s)} value={s}>
              {getBotShapeName(s)}
            </Option>
          ))}
        </Dropdown>
        <div>
          <Label htmlFor="botColorId">Robot Color</Label>
          <div
            style={{
              justifySelf: 'center',
              width: '50px',
              height: '50px',
              borderRadius: '4px',
              backgroundColor: botTinyColor.toHexString(),
            }}
          />
        </div>
        <div className="two-column">
          <Label htmlFor="hueId">Hue</Label>
          <ColorSlider
            id="hueId"
            color={botTinyColor.toHsv()}
            onChange={onSliderChange}
          />
          <Label htmlFor="satId">Saturation</Label>
          <ColorSlider
            id="satId"
            color={botTinyColor.toHsv()}
            channel="saturation"
            onChange={onSliderChange}
          />
          <Label htmlFor="valId">Brightness</Label>
          <ColorSlider
            id="valId"
            color={botTinyColor.toHsv()}
            channel="value"
            onChange={onSliderChange}
          />
        </div>
      </div>
    ),
    [botWidth, botLength, botShape, botTinyColor],
  );
  const GeneralSettings = useMemo(
    (): ReactElement => (
      <div className="two-column">
        <Label htmlFor="setThemeId">Theme</Label>
        <span>
          <WeatherSunnyRegular />
          <Switch
            id="setThemeId"
            checked={theTheme === 'dark'}
            onChange={(_, data) => setTheme(data.checked ? 'dark' : 'light')}
          />
          <WeatherMoonFilled />
        </span>
        <Label htmlFor="fieldVisibilityId">Field Visibility Level</Label>
        <Slider
          aria-valuetext={`Value is ${fieldViz}%`}
          value={fieldViz}
          min={0}
          max={100}
          step={2.5}
          onChange={(_, data) => setFieldViz(data.value)}
          id="fieldVisibilityId"
        />
        <Label htmlFor="coordVizId">Field Key Visibility Level</Label>
        <Slider
          aria-valuetext={`Value is ${coordViz}%`}
          value={coordViz}
          min={0}
          max={100}
          step={2.5}
          onChange={(_, data) => setCoordViz(data.value)}
          id="coordVizId"
        />
        <Label htmlFor="resetPrefsId">Reset preferences</Label>
        <span>
          <Button
            id="resetPrefsId"
            onClick={() => {
              localStorage.clear();
              window.location.reload();
            }}>
            {Strings.Reset}
          </Button>
        </span>
      </div>
    ),
    [fieldViz, coordViz, theTheme],
  );
  const DrawingSettings = useMemo(
    () => (
      <div className="two-column">
        <Label htmlFor="pathThicknessId">Path Thickness</Label>
        <SpinButton
          id="pathThicknessId"
          value={pathThickness}
          onChange={changePathThickness}
          step={0.1}
          stepPage={1}
          min={0}
          max={2}
        />
        <Label htmlFor="ctrlPtSizeId">Control Point Size</Label>
        <SpinButton
          id="ctrlPtSizeId"
          value={ctrlPtSize}
          onChange={changeCtrlPtSize}
          step={0.25}
          stepPage={1}
          min={0.5}
          max={4}
        />
        <Label htmlFor="ctrlPtThicknessId">Control Point Thickness</Label>
        <SpinButton
          id="ctrlPtThicknessId"
          value={ctrlPtThickness}
          onChange={changeCtrlPtThickness}
          step={0.1}
          stepPage={1}
          min={0.1}
          max={2}
        />
        <Label htmlFor="ctrlPtStyleId">Control Point Style</Label>
        <Dropdown
          style={{ minWidth: 50 }}
          id="ctrlPtStyleId"
          value={ctrlPtName}
          selectedOptions={[ctrlPtStyle]}
          onOptionSelect={onCtlPtStyleSelect}>
          {ctrlPtStyles.map((s) => (
            <Option key={s} text={getCtrlPtName(s)} value={s}>
              {getCtrlPtName(s)}
            </Option>
          ))}
        </Dropdown>
        <Label htmlFor="showBotHeadingId">Show Robot Heading</Label>
        <Switch
          id="showBotHeadingId"
          checked={showBotHeading}
          onChange={(_, data) => setShowBotHeading(data.checked)}
        />
        <Label htmlFor="headingCountId">Heading Indicator Count</Label>
        <SpinButton
          id="headingCountId"
          disabled={!showBotHeading}
          value={headingCount}
          onChange={changeHeadingCount}
          step={1}
          stepPage={5}
          min={1}
          max={25}
        />
        <Label htmlFor="headingThicknessId">Heading Thickness</Label>
        <SpinButton
          id="headingThicknessId"
          disabled={!showBotHeading}
          value={headingThickness}
          onChange={changeHeadingThickness}
          step={0.1}
          stepPage={1}
          min={0.1}
          max={2}
        />
        <Label htmlFor="headingLengthId">Heading Length</Label>
        <SpinButton
          id="headingLengthId"
          disabled={!showBotHeading}
          value={headingLength}
          onChange={changeHeadingLength}
          step={1}
          stepPage={5}
          min={1}
          max={25}
        />
      </div>
    ),
    [
      pathThickness,
      showBotHeading,
      headingCount,
      ctrlPtSize,
      ctrlPtThickness,
      showBotHeading,
      headingThickness,
      headingLength,
      ctrlPtName,
      ctrlPtStyles,
    ],
  );
  return (
    <Dialog modalType="non-modal">
      <DialogTrigger disableButtonEnhancement>
        <Button icon={<SettingsFilled />} appearance="transparent" />
      </DialogTrigger>
      <DialogSurface>
        <DialogBody>
          <DialogTitle style={{ textAlign: 'center' }}>Settings</DialogTitle>
          <DialogContent className="two-column">
            <span>
              <TabList
                onTabSelect={onTabSelect}
                vertical
                size="large"
                defaultSelectedValue={'General'}>
                <Tab value="General">General</Tab>
                <Tab value="Robot">Robot</Tab>
                <Tab value="Paths">Paths</Tab>
              </TabList>
            </span>
            <span>
              {selectedTab === 'General' && GeneralSettings}
              {selectedTab === 'Robot' && BotSettings}
              {selectedTab === 'Paths' && DrawingSettings}
            </span>
          </DialogContent>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
}
