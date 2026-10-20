import { PathsFile, Team } from '../ipcTypes';
import { Nominal } from '../typeHelpers';

export type FilePath = Nominal<string, 'FilePath'>;
export type PathsDatabase = {
  HasFieldImage: boolean;
  AllTeams: Set<Team>;
  LoadedFiles: Map<Team, PathsFile>;
};
