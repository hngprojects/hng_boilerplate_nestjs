import UserInterface from "../../user/interfaces/UserInterface";

type CreateNewUserOptions = Pick<UserInterface, 'email' | 'first_name' | 'last_name' | 'password'>;
export default CreateNewUserOptions;