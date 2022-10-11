import Head from 'next/head'
import Link from 'next/link'
import styles from '../styles/Home.module.css'

export default function Home() {
  return (
    <div className={styles.container}>
      <Head>
        <title>Bluescape.com Blog RSS Feed</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
          RSS Blog feed for <a href="https://bluescape.com/blog">Bluescape.com</a>
        </h1>

        <p className={styles.description}>
          RSS function in {' '}
          <code className={styles.code}>functions/rss.js</code>
       
        </p>

        
          <div className={styles.card}>
            <Link href="/.netlify/functions/rss">
              <a>View RSS</a>
            </Link>
          </div>

      </main>
    </div>
  )
}
