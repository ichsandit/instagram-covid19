const fs = require('fs')
const { promisify } = require('util')

const readFileAsync = promisify(fs.readFile)

const Canvas = require('canvas')
const { IgApiClient } = require('instagram-private-api')
const moment = require('moment-timezone')

const ig = new IgApiClient()
const { config } = require('./config')
const { helper_caption } = require('./helper')

const axios = require('axios').default
const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')

const adapter = new FileSync('db.json')
const db = low(adapter)

Canvas.registerFont(config.font.path, {
    family: config.font.family
})
const axiosInstance = axios.create({
    baseURL: 'https://covid-193.p.rapidapi.com',
    headers: {
        'X-RapidAPI-Host': 'covid-193.p.rapidapi.com',
        'X-RapidAPI-Key': 'e3bd066e3bmsh1971f9d5e2e81b6p1245f3jsnde396f2a72a2'
    }
})

db.defaults({
    lastUpdatedTime: '',
    cases: {},
    deaths: {}
}).write()

const IGLogin = async (username, password) => {
    ig.state.generateDevice(username)
    await ig.account.login(username, password)
}

const IGUploadPhoto = async (photoPath, caption) => {
    const publishRes = await ig.publish.photo({
        file: await readFileAsync(photoPath),
        caption: caption
    })

    console.log(publishRes, 'ini res publishRes')
    return publishRes
}

const generateContent = async (type, imagePath, payload) => {
    const canvas = Canvas.createCanvas(1080, 1080)
    const ctx = canvas.getContext('2d')

    var Image = Canvas.Image
    var img = new Image()
    img.src = imagePath

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

    //fillText Date
    ctx.font = '75pt ' + config.font.family
    ctx.fillStyle = 'white'
    ctx.fillText(payload.date, 0, 1060)

    //fillText Main
    ctx.font = '200pt ' + config.font.family
    ctx.fillStyle = 'black'
    ctx.textAlign = 'center'

    if (type === 'deaths') {
        ctx.fillText(payload.total, 540, 620)

        ctx.font = '55pt ' + config.font.family
        ctx.fillStyle = payload.new.includes('+') ? '#ff6961' : '#d8fca8'
        ctx.textAlign = ''
        ctx.fillText(payload.new, 735, 780)

        const contentPath = __dirname + '/deaths/' + payload.time + '.jpg'
        const out = await fs.createWriteStream(contentPath)
        const stream = await canvas.createJPEGStream({quality: 1})
        stream.pipe(out)
        out.on('finish', async () => {
            await IGUploadPhoto(contentPath, await helper_caption(config.instagram.caption.deaths, payload))
        })
        return true
    } else if (type === 'cases') {
        ctx.fillText(payload.total, 540, 620)

        ctx.font = '55pt ' + config.font.family
        ctx.fillStyle = payload.new.includes('+') ? '#ff6961' : '#d8fca8'
        ctx.textAlign = ''
        ctx.fillText(payload.new, 755, 780)

        const contentPath = __dirname + '/cases/' + payload.time + '.jpg'
        const out = await fs.createWriteStream(contentPath)
        const stream = await canvas.createJPEGStream({ quality: 1 })
        stream.pipe(out)
        out.on('finish', async () => {
            await IGUploadPhoto(contentPath, await helper_caption(config.instagram.caption.cases, payload))
        })
        return true
    } else {
        ctx.fillText(payload.recovered, 540, 620)

        const contentPath = __dirname + '/recovered/' + payload.time + '.jpg'
        const out = await fs.createWriteStream(contentPath)
        const stream = await canvas.createJPEGStream({ quality: 1 })
        stream.pipe(out)
        out.on('finish', async () => {
            await IGUploadPhoto(contentPath, await helper_caption(config.instagram.caption.recovered, payload))
        })
        return true
    }
}

const botAutoUploadCovid19 = async () => {
    const dataStatistics = await axiosInstance.get('/statistics', {
        params: {
            'country': 'indonesia'
        }
    })
        .then(async res => {
            if (res.data.response.length) {
                if (db.get('cases').value().total != res.data.response[0].cases.total) {
                    await db.set('lastUpdatedTime', res.data.response[0].time).write()
                    await db.set('cases', res.data.response[0].cases).write()
                    await db.set('deaths', res.data.response[0].deaths).write()
                    return res.data.response[0]
                } else {
                    return false;
                }
            } else {
                return false;
            }
        })
        .catch(err => {
            console.log(err, 'ini error get statistics')
            return false
        })
    if (dataStatistics) {
        await IGLogin(config.instagram.username, config.instagram.password)
        await generateContent('deaths', config.images.deaths.path, {
            ...dataStatistics.deaths,
            date: moment(dataStatistics.date).tz(config.timezone).format('DD MMMM YY'),
            time: dataStatistics.time
        })
        setTimeout(async () => {
            await generateContent('recovered', config.images.recovered.path, {
                ...dataStatistics.cases,
                date: moment(dataStatistics.date).tz(config.timezone).format('DD MMMM YY'),
                time: dataStatistics.time
            })
        }, 10000)
        setTimeout(async () => {
            await generateContent('cases', config.images.cases.path, {
                ...dataStatistics.cases,
                date: moment(dataStatistics.date).tz(config.timezone).format('DD MMMM YY'),
                time: dataStatistics.time
            })
        }, 20000)
        return true
    } else {
        console.log(`(${moment().tz(config.timezone).format('DD MMMM YY HH.mm.ss')}): Tidak ada data baru`)
        return false
    }
}

(async () => {
    await botAutoUploadCovid19()
    setInterval(async () => {
        await botAutoUploadCovid19();
    }, config.update_delay)
})()