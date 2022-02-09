import { Client } from 'pg'
import { nanoid } from 'nanoid'
import NodeEnvironment from 'jest-environment-node'
import util from 'util'
import childProcess from 'child_process'

const exec = util.promisify(childProcess.exec)

const prisma = './node_modules/.bin/prisma'

class PrismaTestEnvironment extends NodeEnvironment {
  constructor(config) {
    super(config)
    this.schema = `test_${nanoid()}`
    this.connectionString = `postgresql://postgres:postgres@localhost:5432/node-starter?schema=${this.schema}`
  }

  async setup() {
    process.env.DATABASE_URL = this.connectionString
    this.global.process.env.DATABASE_URL = this.connectionString

    await exec(`${prisma} migrate dev --name ${this.schema}`)
    return super.setup()
  }

  async teardown() {
    const client = new Client({
      connectionString: this.connectionString,
    })
    await client.connect()
    await client.query(`DROP SCHEMA IF EXISTS "${this.schema}" CASCADE`)
    await client.end()
  }
}

module.exports = PrismaTestEnvironment
