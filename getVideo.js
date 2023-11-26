import { playwright } from '@pipedream/browsers';

async function getFullHtmlWithFrames(url) {
    const browser = await playwright.launch();
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });

    const frames = page.frames();
    let fullHtml = await page.content();

    for (const frame of frames) {
        const frameHtml = await frame.content();
        fullHtml = fullHtml.replace('</body>', `${frameHtml}</body>`);
    }

    const regex = /https?:\/\/[^\s"]+\.m3u8/g;
    const matches = fullHtml.match(regex);
    const m3u8Links = [];
    if (matches) {
        matches.forEach(match => {
            if (match.endsWith("/master.m3u8")) {
                m3u8Links.push(match);
            }
        });
    }

    await browser.close();

    return m3u8Links;
}


(async () => {
    const m3u8Links = await getFullHtmlWithFrames("https://www.kinopoisk.gg/film/435/");
    console.log(m3u8Links);
})();