const express = require('express');
const puppeteer = require('puppeteer');
const replace = require('absolutify');
const path = require('path');

const app = express();

const PORT = 3000;

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/proxy', async (req, res) => {
    let { url } = req.query;

    if (!url) {
        return res.send('No URL found');
    } 

    // URL'ning http:// yoki https:// bilan boshlanishini tekshirish
    if (!/^https?:\/\//i.test(url)) {
        url = 'https://' + url; // HTTPS bilan boshlatish
    }

    try {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();

        await page.goto(url, { waitUntil: 'networkidle2' });

        let document = await page.evaluate(() => document.documentElement.outerHTML);
        document = replace(document, `/proxy?url=${encodeURIComponent(url)}`);

        await browser.close();

        return res.send(document);
    } catch (error) {
        console.log(error);
        return res.send(`Error: ${error.message}`);
    }
});

app.listen(PORT, () => console.log(`\n 🗽🗽🗽 \n Server listening on port ${PORT}`, `\n \n http://localhost:${PORT}`));
