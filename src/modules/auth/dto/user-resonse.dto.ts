import UserInterface from "../../user/interfaces/UserInterface";

type UserResponseDTO = Pick<UserInterface, "email" | "first_name" | "last_name" | "id" | "is_active" | "attempts_left" | "created_at" | "updated_at">
export default UserResponseDTO