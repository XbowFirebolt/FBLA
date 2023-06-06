function userDetailsAreValid(username, email, password) {
    return (
        username &&
        username.trim() !== '' &&
        email &&
        email.includes('@') &&
        password &&
        password.trim().length >= 6
        )
}

function passwordIsConfirmed(password, confrimPassword) {
    return password === confrimPassword;
}

module.exports = {
    userDetailsAreValid: userDetailsAreValid,
    passwordIsConfirmed: passwordIsConfirmed
}