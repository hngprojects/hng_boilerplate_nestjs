import { UpdateRecordGeneric } from 'src/helpers/UpdateRecordGeneric';
import UserIdentifierOptionsType from './UserIdentifierOptions';
import UserInterface from '../interfaces/UserInterface';

type UserUpdateRecord = Partial<UserInterface>;

type UpdateUserRecordOption = UpdateRecordGeneric<UserIdentifierOptionsType, UserUpdateRecord>;

export default UpdateUserRecordOption;
