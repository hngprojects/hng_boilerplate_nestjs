const appConfig = {
    jwt: {
        jwtSecret: process.env.JWT_SECRET,
        jwtExpiry: process.env.JWT_EXPIRY

    }
}

export default appConfig