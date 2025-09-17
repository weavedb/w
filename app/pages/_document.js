import { Html, Head, Main, NextScript } from "next/document"

export default function Document() {
  const title = "W"
  const description = "Decentralized Social"
  const image = "https://w.weavedb.dev/images/cover.png"
  return (
    <Html lang="en">
      <Head>
        <title>{title}</title>
        <link rel="icon" type="image/svg" href="/images/favicon.svg" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta key="description" name="description" content={description} />
        <meta
          key="twitter:card"
          property="twitter:card"
          content="summary_large_image"
        />
        <meta key="twitter:title" property="twitter:title" content={title} />
        <meta
          key="twitter:description"
          property="twitter:description"
          content={description}
        />

        <meta key="twitter:image" property="twitter:image" content={image} />
        <meta key="og:title" property="og:title" content={title} />
        <meta
          key="og:description"
          property="og:description"
          content={description}
        />
        <meta key="og:image" property="og:image" content={image} />
        <link
          key="fontawesome"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.14.0/css/all.min.css"
          rel="stylesheet"
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
