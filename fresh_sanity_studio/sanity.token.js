require('dotenv').config()

const token = process.env.SANITY_AUTH_TOKEN

if (!token) {
  throw new Error('SANITY_AUTH_TOKEN is not defined in the environment variables.')
}

module.exports = {
  token
}