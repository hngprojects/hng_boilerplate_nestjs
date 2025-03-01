import UserIdentifierOptionsType from './UserIdentifierOptions';
import UserInterface from '../interfaces/UserInterface';
import { UpdateRecordGeneric } from '@shared/helpers/UpdateRecordGeneric';

type UserUpdateRecord = Partial<UserInterface>;

type UpdateUserRecordOption = UpdateRecordGeneric<UserIdentifierOptionsType, UserUpdateRecord>;

export default UpdateUserRecordOption;
