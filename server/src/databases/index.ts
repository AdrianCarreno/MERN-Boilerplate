import { connectionString, host, port, database } from '@configs/dbConfig'
import { ConnectOptions } from 'mongoose'

const options: ConnectOptions = {
    // useNewUrlParser: true,
    // useUnifiedTopology: true,
}

export const dbConnection = {
    url: connectionString || `mongodb://${host}:${port}/${database}`,
    options
}
