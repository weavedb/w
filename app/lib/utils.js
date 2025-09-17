const icon = puser => {
  let icon = puser?.image ?? "/images/default-icon.png"
  if (puser?.image && /^[a-zA-Z0-9_-]{43}$/.test(puser.image)) {
    icon = `https://arweave.net/${puser.image}`
  }
  return icon
}

function id(num) {
  let result = ""
  num = +num
  try {
    if (num === 0) return "A"

    const base64urlChars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_"

    while (num > 0) {
      result = base64urlChars[num % 64] + result
      num = Math.floor(num / 64)
    }

    return result
  } catch (e) {
    return num
  }
}

function num(str) {
  let result = 0

  try {
    const cleanBase64url = str.replace(/=/g, "")

    const base64urlChars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_"

    const base = 64

    for (let i = 0; i < cleanBase64url.length; i++) {
      const char = cleanBase64url[i]
      const charValue = base64urlChars.indexOf(char)

      if (charValue === -1) {
        throw new Error(`Invalid base64url character: ${char}`)
      }

      result = result * base + charValue
    }

    return result
  } catch (e) {
    console.log(e)
    return str
  }
}

export { icon, id, num }
