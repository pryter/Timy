import * as dotenv from 'dotenv'

dotenv.config()

export default {
        type: process.env.FCERT_TYPE,
        projectId: process.env.FCERT_PROJECT_ID,
        private_key_id: process.env.FCERT_PRIVATE_KEY_ID,
        private_key: process.env.FCERT_PRIVATE_KEY,
        client_email: process.env.FCERT_CLIENT_EMAIL,
        client_id: process.env.FCERT_CLIENT_ID,
        auth_uri: process.env.FCERT_AUTH_URI,
        token_uri: process.env.FCERT_TOKEN_URI,
        auth_provider_x509_cert_url: process.env.FCERT_AUTH_PROVIDER_X509_CERT_URL,
        client_x509_cert_url: process.env.FCERT_CLIENT_X509_CERT_URL
    }

