import SDK from "weavedb-client"
import { DB, wdb23, wdb160 } from "wdb-sdk"
let db = null
let ndb = null
import {
  pluck,
  dissoc,
  append,
  concat,
  compose,
  difference,
  __,
  keys,
  uniq,
  indexBy,
  prop,
  isEmpty,
  mergeLeft,
  isNil,
} from "ramda"

import lf from "localforage"
import { nanoid } from "nanoid"
const contractTxId = process.env.NEXT_PUBLIC_TXID ?? "offchain"
const dbid = process.env.NEXT_PUBLIC_DB_ID
const rollup = process.env.NEXT_PUBLIC_ROLLUP
const hb = process.env.NEXT_PUBLIC_HB
const rpc = process.env.NEXT_PUBLIC_RPC

export const initDB = async () => {
  return new DB({
    id: dbid,
    url: rollup,
    hb,
  })
}

export const initNDB = async () => {
  ndb ??= new SDK({ rpc, contractTxId: `${contractTxId}#notifications` })
  return ndb
}

export const login = async () => {
  let identity = null
  if (window.arweaveWallet) {
    await window.arweaveWallet.connect(["ACCESS_ADDRESS", "SIGN_TRANSACTION"])
    const addr = await window.arweaveWallet.getActiveAddress()
    identity = { address: wdb23(addr) }
  }
  let user = null
  if (identity) {
    const db = await initDB()
    user =
      (await db.get("users", ["address", "==", identity.address]))[0] ?? null
    await lf.setItem("user", { identity, user })
    return { identity, user }
  } else {
    return { identity: null, user: null }
  }
}

export const inviteUser = async ({ addr }) => {
  const db = await initDB()
  const _invite = { address_full: addr }
  const res = await db.set("set:invite_user", _invite, "users", wdb23(addr))
  const {
    result: { data },
    success,
  } = res
  return { err: !success, doc: data }
}
export const postArticle = async ({
  description,
  title,
  address,
  user,
  body,
  cover,
  user: _user,
  editID,
}) => {
  const db = await initDB()
  const { identity } = await lf.getItem("user")
  const date = Date.now()
  let post = {
    title,
    description,
    body: db.data("body"),
  }
  if (!isNil(cover)) post.cover = db.data("cover")
  let sign = null
  if (isNil(editID)) {
    sign = await db.sign("query", "add:article", post, "posts", {
      ...identity,
      jobID: "article",
    })
  } else {
    sign = await db.sign("query", "update:edit", post, "posts", editID, {
      ...identity,
      jobID: "article",
    })
  }
  const __body = JSON.stringify({
    title,
    description,
    owner: user.address,
    date: post.date,
    type: "html",
    content: body,
  })
  let {
    tx: _tx,
    body: _body,
    cover: _cover,
  } = await fetch("/api/updateArticle", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ body: __body, query: sign, cover }),
  }).then(e => e.json())
  let new_post = _tx.result.data
  new_post.body = _body
  new_post.cover = _cover
  return { err: null, post: new_post }
}

export const updateProfile = async ({
  name,
  address,
  image,
  image_ar,
  cover,
  handle,
  intro,
  user: _user,
  hashes,
  mentions,
}) => {
  const db = await initDB()
  const { identity } = await lf.getItem("user")
  if (isNil(_user)) {
    const ex = (
      await db.get("users", ["handle", "==", handle.toLowerCase()])
    )[0]
    if (!isNil(ex)) return { err: "handle" }
  }
  const new_fields = {
    name,
    image,
    handle: handle.toLowerCase(),
    description: intro,
    cover,
    hashes,
    mentions,
  }
  let user = {}
  for (let k in new_fields) {
    const v = new_fields[k]
    if (!isNil(v) && (isNil(_user) || _user[k] !== v)) user[k] = v
  }
  if (isEmpty(user) && isNil(image)) return { err: "nothing to update" }
  let tx, __image, __cover
  if (!isNil(image) || !isNil(cover)) {
    if (!isNil(image)) user.image = db.data("image")
    if (!isNil(cover)) user.cover = db.data("cover")
    const sign = await db.sign(
      "query",
      "update:profile",
      user,
      "users",
      db.toBase64([address]),
      {
        ...identity,
        jobID: "profile",
      },
    )
    let {
      tx: _tx,
      image: _image,
      cover: _cover,
    } = await fetch("/api/updateProfile", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ image, query: sign, cover }),
    }).then(e => e.json())
    tx = _tx
    if (!isNil(_image)) __image = _image
    if (!isNil(_cover)) __cover = _cover
  } else {
    if (image_ar) user.image = image_ar
    tx = await db.set("update:profile", user, "users", identity.address)
  }
  if (tx.success) {
    if (!isNil(__image)) user.image = __image
    if (!isNil(__cover)) user.cover = __cover
    const new_user = mergeLeft(user, _user ?? {})
    await lf.setItem("user", { identity, user: new_user })
    return { err: null, user: new_user }
  } else {
    return { err: "unknown" }
  }
}

export const checkUser = async () => {
  return (await lf.getItem("user")) ?? { user: null, identity: null }
}

export const logout = async () => {
  await lf.removeItem("user")
}

export const likePost = async ({ user, tweet }) => {
  const db = await initDB()
  const { identity } = await lf.getItem("user")
  const like = { aid: tweet.id, user: user.address }
  await db.set("set:like", like, "likes", wdb160([tweet.id, user.address]))
  return { like }
}

export const repostPost = async ({ user, tweet }) => {
  const db = await initDB()
  const { identity } = await lf.getItem("user")
  const repost = { repost: tweet.id }
  console.log(repost)
  const res = await db.set("add:repost", repost, "posts")
  console.log(res)
  const {
    result: { data },
  } = res
  return { repost: data }
}

export const followUser = async ({ user, puser }) => {
  const db = await initDB()
  const { identity } = await lf.getItem("user")
  const follow = { from: user.address, to: puser.address }
  const id = wdb160([user.address, puser.address])
  await db.set("set:follow", follow, "follows", id)
  return { follow: { id, data: follow } }
}

export const unfollowUser = async ({ user, puser }) => {
  const db = await initDB()
  const { identity } = await lf.getItem("user")
  const id = wdb160([user.address, puser.address])
  await db.set("delete:unfollow", "follows", id)
  return { follow: { id, data: null } }
}

export const postStatus = async ({
  mode,
  title,
  article,
  body,
  user,
  replyTo,
  repost,
  tweet,
  cover,
  hashes = [],
  mentions = [],
}) => {
  const db = await initDB()
  const { identity } = await lf.getItem("user")
  let post = {
    description: body,
    hashes: uniq(hashes),
    mentions: uniq(mentions),
  }
  let op = "add:status"
  if (mode === "article") {
    op = "add:article"
    post.title = title
    post.body = article
  } else if (repost !== "") {
    op = "add:quote"
    post.repost = repost
  } else if (!isNil(replyTo)) {
    op = "add:reply"
    post.reply_to = replyTo
  }

  let new_post = null
  if (!isNil(cover)) {
    post.cover = db.data("cover")
    const sign = await db.sign("query", op, post, "posts", {
      ...identity,
      jobID: "article",
    })
    let { tx: _tx, cover: _cover } = await fetch("/api/updateArticle", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query: sign, cover }),
    }).then(e => e.json())
    new_post = _tx.result.data
    new_post.cover = _cover
  } else {
    const _tx = await db.set(op, post, "posts")
    new_post = _tx.result.data
  }
  return { err: null, post: new_post }
}

export const deletePost = async ({ tweet }) => {
  const db = await initDB()
  const { identity } = await lf.getItem("user")
  await db.set("update:del_post", {}, "posts", tweet.id)
  return { post: dissoc("date", tweet) }
}

let __tweets = {}
let __ids = []
export const getTweets = async ({ ids, tweets, setTweets }) => {
  if (ids.length === 0) return
  const db = await initDB()
  const new_ids = uniq(ids)
  const _ids = difference(new_ids, __ids)
  __ids = uniq(concat(__ids, new_ids))
  if (!isEmpty(_ids)) {
    const _tweets = indexBy(prop("id"))(
      await db.get("posts", ["id", "in", _ids]),
    )
    __tweets = mergeLeft(_tweets, __tweets)
  }
  setTweets(__tweets)
  return __tweets
}

let __users = {}
let __user_ids = []
export const getUsers = async ({ ids, users, setUsers }) => {
  const db = await initDB()
  const new_ids = uniq(ids)
  const _ids = difference(new_ids, __user_ids)
  if (!isEmpty(_ids)) {
    const _users = indexBy(prop("address"))(
      await db.get("users", ["address", "in", _ids]),
    )
    __users = mergeLeft(_users, __users)
  }
  setUsers(__users)
}

export const searchUsers = async (str, cb) => {
  const db = await initDB()
  const users = await db.get(
    "users",
    ["handle"],
    ["startAt", str.toLowerCase()],
    5,
  )
  cb(users)
}
