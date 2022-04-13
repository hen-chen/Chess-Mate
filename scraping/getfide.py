import asyncio
from pyppeteer import launch

FIDE_URL = 'https://ratings.fide.com/'

async def get_fide_ids(names: list[str]):
  browser = await launch()
  page = await browser.newPage()
  await page.goto(FIDE_URL)

  res = []

  for name in names:
    # clear search bar of previous text before typing
    search_bar = await page.querySelector("#dyn1")
    await search_bar.click({"clickCount": 3})
    await search_bar.press('Backspace')

    await search_bar.type(name)
    await search_bar.press("Enter")

    first_result = await page.waitForSelector("#table_results > tbody > tr > td:nth-child(1) > a")
    result_href = await page.evaluate('a => a.href', first_result)
    if result_href:
      fide_id = result_href.partition("https://ratings.fide.com/profile/")[2]
      res.append(fide_id)
  return res

asyncio.get_event_loop().run_until_complete(
  get_fide_ids(["Wang, Constance", "Xu, Jeffrey", "Lin, Benjamin", "Wang, Annie"])
)
