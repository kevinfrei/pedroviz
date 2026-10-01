import { makeStyles, shorthands, tokens } from '@fluentui/react-components';

export const useWrappedRegionStyle = makeStyles({
  field: {
    display: 'inlineBlock',
    marginTop: '-1.3em',
    padding: '0 6px',
  },
  label: {
    backgroundColor: tokens.colorNeutralBackground1,
    paddingLeft: '0.5em',
    paddingRight: '.5em',
    fontWeight: 'bold',
  },
  wrapper: {
    marginTop: '1em',
    ...shorthands.borderWidth('1px'),
    ...shorthands.borderStyle('solid'),
    ...shorthands.borderColor(tokens.colorNeutralForeground3),
    borderRadius: '4px',
    padding: '8px',
  },
});
