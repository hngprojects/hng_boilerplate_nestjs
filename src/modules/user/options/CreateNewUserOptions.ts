import UserInterface from '../../user/interfaces/UserInterface';

type CreateNewUserOptions = Pick<UserInterface, 'email' | 'first_name' | 'last_name' | 'password'> & {
  admin_secret?: string;
};
export default CreateNewUserOptions;
