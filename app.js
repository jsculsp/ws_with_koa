/**
 * Created by linmu on 2017/6/16.
 */
const url = require('url')
const ws = require('ws')
const Cookies = require('cookies')
const Koa = require('koa')
const bodyParser = require('koa-bodyparser')
const controller = require('./controller')
const templating = require('./templating')
const staticFiles = require('./static_files')
const WebSocketServer = ws.Server
const app = new Koa()
const log = console.log.bind(console)

app.use(async (ctx, next) => {
    log(`Process ${ctx.request.method} ${ctx.request.url}...`)
    await next()
})

app.use(async (ctx, next) => {
    let obj = ctx.cookies.get('name')
    ctx.state.user = parseUser(obj)
    await next()
})

app.use(staticFiles('/static/', __dirname + '/static'))

const parseUser = function (obj = '') {
    if (!obj) {
        return
    }
    log(`try parse: ${obj}`)
    let s = ''
    if (typeof obj === 'string') {
        s = obj
    } else if (obj.headers) {
        let cookies = new Cookies(obj, null)
        s = cookies.get('name')
    }
    if (s) {
        try {
            let user = JSON.parse(Buffer.from(s, 'base64').toString())
            log(`User: ${user.name}, ID: ${user.id}`)
            return user
        } catch (e) {
            log(e)
        }
    }
}