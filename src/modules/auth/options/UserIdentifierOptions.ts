type UserIdentifierOptions = {
    identifierType: "id",
    identifier: string
} | 
 {
    identifierType: "email",
    identifier: string
}

export default UserIdentifierOptions