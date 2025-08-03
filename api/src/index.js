import * as dotenv from 'dotenv'
import express from 'express'
import cors from 'cors'
import {Axios} from 'axios'
dotenv.config()


const keycloakClient = new Axios({
  baseURL: 'http://host.docker.internal:8081/realms/reports-realm/protocol/openid-connect/token'
})

const app = express()

app.use(cors())
app.use(express.json())

app.get('/reports', async (req, res, next) => {
  const token = req.get("Authorization").replace('Bearer ', '')

  const response = await keycloakClient.post('/introspect', `token=${encodeURIComponent(token)}`, {
    headers: {
      "Authorization": `Basic ${Buffer.from(`${process.env.REACT_APP_KEYCLOAK_CLIENT_ID}:${process.env.KEYCLOAK_SECRET}`).toString('base64')}`,
      "Content-Type": "application/x-www-form-urlencoded",
    }
  })

  const result = JSON.parse(response?.data)

  if (result?.active !== true || result?.["realm_access"]?.["roles"]?.includes("prothetic_user") !== true) {
    res.status(401).end()
  } else {
    next()
  }

  
}, (_req, res) => {
  res.send({ reports: [{ id: 1, title: "report1" }, { id: 1, title: "report1" }]})
})

app.listen(3000)