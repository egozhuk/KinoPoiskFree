import puppeteer from 'puppeteer';

async function automateBrowserActions(url) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    await page.goto(url);

    await page.waitForSelector('.kinobox__menuItem:nth-child(3)');

    await page.click('.kinobox__menuItem:nth-child(3)');

    let frames = await page.frames();

    for (let i = frames.length - 1; i >= 0; i--) {
        const frame = frames[i];
        try {
            await frame.waitForSelector('video', { timeout: 10000 });

            let videoSrcs = await frame.$$eval('video', videos => videos.map(video => video.src));
            console.log(`Video srcs in frame: ${videoSrcs}`);
            console.log("https://m3u8play.dev/?url=" + encodeURIComponent(videoSrcs));
            break;
        } catch (error) {
            console.log('Video not found in this frame within 10 seconds, moving to the next one.');
        }
    }

    await browser.close();
    window.open("https://m3u8play.dev/?url=" + encodeURIComponent(videoSrcs));
}

// automateBrowserActions("https://flicksbar.club/film/251733");