import * as chromeLauncher from 'chrome-launcher';
import * as httpServer from 'http-server';
import { startFlow } from 'lighthouse';
import puppeteer from 'puppeteer';

async function useHttpServer(host, port, path, func)
{
    var server;
    try
    {
        server = httpServer.createServer({ root: path });
        await new Promise(resolve =>
        {
            server.listen({ host: host, port: port, path: path }, () => resolve());
        });

        try
        {
            await func();
        }
        catch (error)
        {
            console.error('Error during run', error);
        }
    }
    catch (error)
    {
        console.error('Error while running http-server', error);
    }
    if (server)
    {
        // comment this if you do not want to close the HTTP server
        server.close();
    }
}

async function useChrome(func)
{
    var chrome;
    try
    {
        chrome = await chromeLauncher.launch({ chromeFlags: [] });

        try
        {
            await func(chrome);
        }
        catch (error)
        {
            console.error('Error during chrome run', error);
        }
    }
    catch (error)
    {
        console.error('Error from chromeLauncher', error);
    }
    finally
    {
        /*if (chrome)
        {
            chrome.kill();
        }*/
    }
}

async function attachPuppeteer(chrome, viewport)
{
    const resp = await fetch(`http://localhost:${chrome.port}/json/version`);
    const { webSocketDebuggerUrl } = await resp.json();
    const browser = await puppeteer.connect({ browserWSEndpoint: webSocketDebuggerUrl, defaultViewport: viewport });
    const page = await browser.newPage();
    return page;
}

async function runTests()
{
    await useHttpServer('localhost', 8080, './example-angular-build-output/', async () =>
    {
        console.log('listening on port 8080');
        await useChrome(async (chrome) =>
        {
            // lighthouse options
            const lhOptions = {
                extends: 'lighthouse:default',
                logLevel: 'info',
                output: 'html',
                onlyCategories: [
                    'performance',
                    'accessibility',
                    'best-practices',
                    'seo'
                ],
                audits: [
                    'first-meaningful-paint',
                    'first-cpu-idle',
                    'byte-efficiency/uses-optimized-images',
                ],
                port: chrome.port
            };

            console.log('attaching puppeeer');
            const page = await attachPuppeteer(chrome);

            console.log('starting flow');
            const flow = await startFlow(page, lhOptions);

            console.log('navigating to first url');
            await flow.navigate('http://localhost:8080');

            console.log('waiting for browser close');
        });
    });

};

await runTests();
