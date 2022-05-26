const connectionString = process.env.DB_CONNECTION_STRING
const host: string = process.env.DB_HOST || 'localhost'
const database: string = process.env.DB_DATABASE || 'mongoose'
const port: number = parseInt(process.env.DB_PORT) || 27017
const dbConfig = { connectionString, host, database, port }

export { connectionString, host, database, port }
export default dbConfig
