import { Browser, Page } from 'puppeteer'
import puppeteer from 'puppeteer-extra'
import StealthPlugin from 'puppeteer-extra-plugin-stealth'
import { getXPathMessage } from '../utils/getXPathMessage';
import { timeStamp } from "../utils/timeStamp"
const TelegramBot = require('node-telegram-bot-api');
import dotenv from "dotenv"
import { monitor } from '../utils/monitorLog'
const {executablePath} = require('puppeteer')
const settingsJSON = require('../../config/settings.json')
//=============================================
//            Monitor Config
const runHeadless = settingsJSON["config"]["runHeadless"]
dotenv.config()
const apiKey = process.env.TELEGRAM_BOT_API_KEY
const userID = process.env.TELEGRAM_USER_ID
//            Webhook Config
//            Other Config
//=============================================


const bot = new TelegramBot(apiKey, {polling: true})

const startMonitor = (URL: string) => {
    puppeteer.use(StealthPlugin()).launch({ headless: runHeadless, defaultViewport: null, args: ['--window-size=1920,1080'], executablePath: executablePath(),}).then(async browser => {
        const page = await browser.newPage()
        runMonitor(page, browser, URL)
    })
}

const runMonitor = async (page: Page, browser: Browser, url: string) => {
    await accessWebsite(page, browser, url)
}

const accessWebsite = async (page: Page, browser: Browser, url: string) => {
    try {
        await page.goto(url, {timeout: 30000})
        await selectService(page)
        
        const availableDates = await checkIfDatesAreAvailable(page, browser)
        await sendTelegramMessage(availableDates)
        
        await page.waitForTimeout(10000)
        await process.exit()
    }
    catch(e){
        monitor.log(`Error, website ${url} unavailable: ${e}`)
        await page.waitForTimeout(10000)
        await process.exit()
    }
}


const selectService = async (page: any) => {
    //await page.select("select#casetype_165", "1") //Real One
    await page.select("select#casetype_170", "1") //Test One
    await buttonClicker(page, '/html/body/div/div[1]/form/fieldset/input', 'Weiter')
    await page.waitForTimeout(3000)
}

const sendTelegramMessage = async (availableDates: any) => {
    if (availableDates[0]) {
        monitor.log(`Available Dates: '${availableDates}'`)
        bot.sendMessage(userID, 'Es sind wieder Termine im Stadthaus Bonn verfügbar: ' + availableDates)
    } else {
        monitor.log(`No Dates Available`)
    }
}

const checkIfDatesAreAvailable = async (page: any, browser: Browser) => {
   await page.waitForTimeout(30000)

   const calenderXPathes = [
    //Line 1
    '/html/body/div/div[1]/table/tbody/tr[2]/td[1]',
    '/html/body/div/div[1]/table/tbody/tr[2]/td[2]',
    '/html/body/div/div[1]/table/tbody/tr[2]/td[3]',
    '/html/body/div/div[1]/table/tbody/tr[2]/td[4]',
    '/html/body/div/div[1]/table/tbody/tr[2]/td[5]',
    '/html/body/div/div[1]/table/tbody/tr[2]/td[6]',
    '/html/body/div/div[1]/table/tbody/tr[2]/td[7]',
    //Line 2
    '/html/body/div/div[1]/table/tbody/tr[3]/td[1]',
    '/html/body/div/div[1]/table/tbody/tr[3]/td[2]',
    '/html/body/div/div[1]/table/tbody/tr[3]/td[3]',
    '/html/body/div/div[1]/table/tbody/tr[3]/td[4]',
    '/html/body/div/div[1]/table/tbody/tr[3]/td[5]',
    '/html/body/div/div[1]/table/tbody/tr[3]/td[6]',
    '/html/body/div/div[1]/table/tbody/tr[3]/td[7]',
    //Line 3
    '/html/body/div/div[1]/table/tbody/tr[4]/td[1]',
    '/html/body/div/div[1]/table/tbody/tr[4]/td[2]',
    '/html/body/div/div[1]/table/tbody/tr[4]/td[3]',
    '/html/body/div/div[1]/table/tbody/tr[4]/td[4]',
    '/html/body/div/div[1]/table/tbody/tr[4]/td[5]',
    '/html/body/div/div[1]/table/tbody/tr[4]/td[6]',
    '/html/body/div/div[1]/table/tbody/tr[4]/td[7]',
    //Line 4
    '/html/body/div/div[1]/table/tbody/tr[5]/td[1]',
    '/html/body/div/div[1]/table/tbody/tr[5]/td[2]',
    '/html/body/div/div[1]/table/tbody/tr[5]/td[3]',
    '/html/body/div/div[1]/table/tbody/tr[5]/td[4]',
    '/html/body/div/div[1]/table/tbody/tr[5]/td[5]',
    '/html/body/div/div[1]/table/tbody/tr[5]/td[6]',
    '/html/body/div/div[1]/table/tbody/tr[5]/td[7]',
    //Line 5
    '/html/body/div/div[1]/table/tbody/tr[6]/td[1]',
    '/html/body/div/div[1]/table/tbody/tr[6]/td[2]',
    '/html/body/div/div[1]/table/tbody/tr[6]/td[3]',
    '/html/body/div/div[1]/table/tbody/tr[6]/td[4]',
    '/html/body/div/div[1]/table/tbody/tr[6]/td[5]',
    '/html/body/div/div[1]/table/tbody/tr[6]/td[6]',
    '/html/body/div/div[1]/table/tbody/tr[6]/td[7]',
    //Line 6
    '/html/body/div/div[1]/table/tbody/tr[7]/td[1]',
    '/html/body/div/div[1]/table/tbody/tr[7]/td[2]',
    '/html/body/div/div[1]/table/tbody/tr[7]/td[3]',
    '/html/body/div/div[1]/table/tbody/tr[7]/td[4]',
    '/html/body/div/div[1]/table/tbody/tr[7]/td[5]',
    '/html/body/div/div[1]/table/tbody/tr[7]/td[6]',
    '/html/body/div/div[1]/table/tbody/tr[7]/td[7]',
   ]

    const productsPromises: Array<any> = calenderXPathes.map(calenderDateXPath => {
    const promiseA = new Promise(async (resolve, reject) => {
        let data = await returnClassName(page, calenderDateXPath)
        resolve(data)
        });
    return (promiseA)
    })


    const rawProductData = await Promise.all(productsPromises).then((productData) => {
        return productData
    })


    const productsData = await rawProductData.filter(productData => {
        return productData !== undefined;
    })

    return productsData

}

const returnClassName = async (page: any, xPath: string) => {
    try {
        const element = await page.$x(xPath)
        const className = await page.evaluate((el: { className: any; }) => el.className, element[0]);
        if (className == 'nat_calendar nat_calendar_weekday_bookable') {
            const availableDateText = await getXPathMessage(page, xPath)
            return String(availableDateText)
        }
        else {
            return undefined
        }
    } catch (error) {
        return undefined
    }
}

const buttonClicker = async (page: any, xpathButton: string, buttonName: string) => {
    try {
        await page.waitForXPath(xpathButton)
        monitor.log(`Click '${buttonName}'`)
        const elements = await page.$x(xpathButton)
        await elements[0].click()
    } catch (error) {
        monitor.log(`Error while Clicking button: '${buttonName}'`)
        await page.waitForTimeout(10000)
        await process.exit()
    }
}

startMonitor('https://onlinetermine.bonn.de/index.php?company=stadtbonn')