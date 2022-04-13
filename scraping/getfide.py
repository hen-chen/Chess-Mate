import asyncio
from pyppeteer import launch

FIDE_URL = 'https://ratings.fide.com/'

async def main():
  browser = await launch({"headless": False})
  page = await browser.newPage()
  await page.goto(FIDE_URL)
  search_bar = await page.querySelector("#dyn1")
  await search_bar.type("Wang, Constance")
  await search_bar.press("Enter")
  await page.waitFor(10000)

asyncio.get_event_loop().run_until_complete(
  main()
)
