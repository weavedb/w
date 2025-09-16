import yargs from "yargs"
import { resolve } from "path"
import { readFileSync, writeFileSync } from "fs"
import { toAddr } from "wao/utils"
import { DB, wdb23 } from "wdb-sdk"
import schemas from "../db/schemas.js"
import auth from "../db/auth.js"
import indexes from "../db/indexes.js"
import triggers from "../db/triggers.js"

const {
  wallet,
  hb = "http://localhost:10001",
  db: url = "http://localhost:6364",
  id,
  invites = 100,
} = yargs(process.argv.slice(2)).argv
let jwk = null
try {
  jwk = JSON.parse(readFileSync(resolve(process.cwd(), wallet), "utf8"))
} catch (e) {
  console.log("the wrong wallet location")
  process.exit()
}

const main = async () => {
  const addr = toAddr(jwk.n)
  console.log(`HyperBEAM: ${hb}`)
  console.log(`DB Rollup: ${url}`)
  console.log(`Wallet: ${addr}`)
  console.log(`DB: ${id}`)
  const db = new DB({ jwk, hb, url, id })
  console.log(await db.cget("users"))
  // add owner
  const tx = await db.set("set:reg_owner", {}, "users", wdb23(addr))
  console.log(tx)

  const r = await db.set(
    "update:give_invites",
    { invites },
    "users",
    wdb23(addr),
  )
  console.log(r)
}

main()
