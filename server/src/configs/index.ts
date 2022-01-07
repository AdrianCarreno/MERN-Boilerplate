import env from './env'
import keys from './keys'
import dbConfig from './dbConfig'
import cors from './cors'
import log from './log'

const config = {
    env,
    dbConfig,
    keys,
    log,
    cors
}

export { env, dbConfig, keys, log, cors }
export default config
