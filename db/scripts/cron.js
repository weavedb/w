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
  await db.set("upsert:cron", { del_pt: { _$: "ts" } }, "crons", "timeline")
  await db.set("upsert:cron", { calc_pt: { _$: "ts" } }, "crons", "timeline")
  console.log(await db.get("posts", ["ptts"]))
}

main()
