import { host, port, database } from '@configs/dbConfig'

export const dbConnection = {
    url: `mongodb://${host}:${port}/${database}`,
    options: {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
        useCreateIndex: true
    }
}
