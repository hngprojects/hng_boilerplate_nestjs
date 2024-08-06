import { HelpCenter } from '../interface/help-center.interface';

export type HelpCenterSingleInstancResponseType = {
  status_code: number;

  message: string;

  data: HelpCenter;
};

export type HelpCenterMultipleInstancResponseType = {
  status_code: number;

  message: string;

  data: HelpCenter[];
};
