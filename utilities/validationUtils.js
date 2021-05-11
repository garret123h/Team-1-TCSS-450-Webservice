
/**
 * Checks the parameter to see if it is a a String with a length greater than 0.
 * 
 * @param {string} param the value to check
 * @returns true if the parameter is a String with a length greater than 0, false otherwise
 */
let isStringProvided = (param) =>
  param !== undefined && param.length > 0

let isValidPassword = (password) => {
  let containsDigit = contains([...password], char => char >='0' && char <= '9')
  let containsUpperCase = contains([...password], char => char >= 'A' && char <= 'Z')
  let containsLowerCase = contains([...password], char => char >= 'a' && char <= 'z')
  let containsSpecialChar = contains([...password], char => char === '@')
  let containsNoWhiteSpace = contains([...password], char => char === ' ')
  return validLength(password) && containsDigit && containsUpperCase &&
  containsLowerCase && containsSpecialChar && !containsNoWhiteSpace
}

let isValidEmail = (email) => {
  let containsAtSymbol = contains([...email], char => char === '@')
  let containsDotCom = email.indexOf('.com') !== -1
  let containsEdu = email.indexOf('.edu') !== -1
  return email.length > 0 && containsAtSymbol && containsDotCom && containsEdu
}

let validLength = (param) =>
  param.length > 6

let contains = (param, containsValue) => {
  return param.filter(containsValue).length >= 1
}

module.exports = {
  isStringProvided, isValidPassword, isValidEmail
}