interface UserInterface {
  identifier: string;

  email: string;

  firstName: string;

  lastName: string;

  password: string;

  createdAt: Date;

  updatedAt: Date;
}

type CreateUserOptions = Pick<UserInterface, 'email' | 'firstName' | 'lastName' | 'identifier' | 'password'>;
export default CreateUserOptions;
