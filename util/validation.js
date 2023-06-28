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

function schoolDetailsAreValid(name, password, address, postal, city, state, country) {
    return (
        name &&
        name.trim() !== '' &&
        password &&
        password.trim().length >= 6 &&
        address &&
        address.trim() !== '' &&
        postal &&
        postal.trim().length == 5 &&
        city &&
        city.trim() !== '' &&
        state &&
        state.trim() !== '' &&
        country &&
        country.trim() !== ''
        )
}

function studentDetailsAreValid(name, grade, points) {

    const intGrade = parseInt(grade);
    const intPoints = parseInt(points);

    return (
        name &&
        name.trim() !== '' &&
        grade &&
        grade.trim() !== '' &&
        Number.isInteger(intGrade) &&
        points &&
        points.trim() !== '' &&
        Number.isInteger(intPoints)
        )
}

function editStudentDetailsAreValid(name, grade) {

    const intGrade = parseInt(grade);

    return (
        name &&
        name.trim() !== '' &&
        grade &&
        grade.trim() !== '' &&
        Number.isInteger(intGrade)
        )
}

function prizeDetailsAreValid(name, points_required) {

    const intPoints_required = parseInt(points_required);

    return (
        name &&
        name.trim() !== '' &&
        points_required &&
        points_required.trim() != '' &&
        Number.isInteger(intPoints_required)
    )
}

function eventDetailsAreValid(name, date, reward) {

    const intReward = parseInt(reward);

    return (
        name &&
        name.trim() !== '' &&
        date &&
        date.trim() != '' &&
        reward &&
        reward.trim() != '' &&
        Number.isInteger(intReward)
    );
}

function passwordIsConfirmed(password, confrimPassword) {
    return password === confrimPassword;
}

module.exports = {
    userDetailsAreValid: userDetailsAreValid,
    schoolDetailsAreValid: schoolDetailsAreValid,
    studentDetailsAreValid: studentDetailsAreValid,
    passwordIsConfirmed: passwordIsConfirmed,
    prizeDetailsAreValid: prizeDetailsAreValid,
    eventDetailsAreValid: eventDetailsAreValid,
    editStudentDetailsAreValid: editStudentDetailsAreValid
}