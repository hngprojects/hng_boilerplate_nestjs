import { Express } from 'express';
import { ONLY_IMAGE_FILES_ACCEPTED } from '../../helpers/SystemMessages';

export const validateFileType = (req: any, file: Express.Multer.File, callback: any) => {
  if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
    throw callback(new Error(ONLY_IMAGE_FILES_ACCEPTED), false);
  }
  callback(null, true);
};
