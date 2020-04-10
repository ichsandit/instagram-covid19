const { config } = require('./config')
const moment = require('moment-timezone')

exports.helper_caption = (caption, data = {}) => {
    const keys = Object.keys(data)
    if (keys.length) {
        for (const key of keys) {
            if (caption.indexOf(`[${key}]`) > 0) {
                if (key === 'time') {
                    caption = caption.split(`[${key}]`).join(moment(data[key]).tz(config.timezone).format(config.caption_time_format))
                } else if (key === 'date') {
                    caption = caption.split(`[${key}]`).join(moment(data[key], 'DD MMMM YY').tz(config.timezone).format(config.caption_date_format))
                } else {
                    caption = caption.split(`[${key}]`).join(data[key])
                }
            }
        }
        return caption
    } else {
        return caption
    }
}