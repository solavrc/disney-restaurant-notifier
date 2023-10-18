import { launch } from 'puppeteer'
import { execSync } from 'child_process'
import axios from 'axios'

process.on('SIGTERM', () => process.exit(0))
export const sleep = (ms: number = 1000) => new Promise(resolve => setTimeout(resolve, ms));

(async () => {
  const url = 'https://reserve.tokyodisneyresort.jp/restaurant/search/?useDate=20231117&adultNum=2&childNum=0&childAgeInform=&restaurantType%5B1%5D=5&nameCd=&wheelchairCount=0&stretcherCount=0&keyword=&reservationStatus=1'
  const executablePath = await new Promise<string | undefined>(resolve => { try { resolve(execSync('which chromium').toString().trimEnd()) } catch { resolve(undefined) } })
  while (true) {
    const browser = await launch({
      headless: 'new',
      defaultViewport: {
        width: 1920,
        height: 1080,
        isMobile: false,
      },
      protocolTimeout: 300_000,
      executablePath,
      args: [
        '--user-agent=Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36',
        '--no-sandbox',
        '--disable-setuid-sandbox'
      ]
    })
    const [page] = await browser.pages()
    page.setDefaultTimeout(300_000)
    try {
      await page.goto(url)
      await page.waitForSelector('.hasNoReservation')
      const restaurants = await page.evaluate(() => Array.from(document.querySelectorAll('.hasGotReservation > .header > .heading')).map(node => node.textContent?.trim()))
      console.log(new Date().toISOString(), restaurants)
      /**
       * `Array.from(document.querySelectorAll('.hasNoReservation > .header')).map(node => node.textContent.trim())`
       * ['マゼランズ', 'リストランテ・ディ・カナレット', 'Ｓ.Ｓ.コロンビア･ダイニングルーム', 'テディ・ルーズヴェルト・ラウンジ', 'レストラン櫻', 'ホライズンベイ・レストラン']
       */
      if (restaurants.includes('マゼランズ') || restaurants.includes('Ｓ.Ｓ.コロンビア･ダイニングルーム')) {
        await axios.post('https://discord.com/api/webhooks/1163858647504404510/epAj6JQ_NcRs6-b3ELXOnc-R4__dflkYEYReW1fRd6B8pNuGNrYKdd6SVliucFqRycGa', { content: `予約可能なレストランが見つかりました。(${JSON.stringify(restaurants)})\n${url}` }, { headers: { 'Content-Type': 'application/json' } })
      }
    } catch (error) {
      console.error(error)
    } finally {
      await browser.close()
    }
    await sleep(30_000)
  }
})()
