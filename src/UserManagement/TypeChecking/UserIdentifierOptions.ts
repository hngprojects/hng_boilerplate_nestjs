type UserIdentifierOptions = {
    identifierType: "id",
    identifier: number
} | {
    identifierType: 'identifier',
    identifier: string
} | {
    identifierType: "email",
    identifier: string
}

export default UserIdentifierOptions