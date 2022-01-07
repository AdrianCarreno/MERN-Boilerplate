const environment: string = process.env.NODE_ENV || 'development'
const port: number = parseInt(process.env.PORT) || 5000
const locale: string = process.env.DEFAULT_LANGUAGE || 'es'
const env = { environment, port, locale }

export { environment, port, locale }
export default env
