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

app.use(bodyParser())

app.use(templating('views', {
    noCache: true,
    watch: true,
}))

app.use(controller())

const server = app.listen(3000)

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

const createWebsocketServer = function (server, onConnection, onMessage, onClose, onError) {
    let wss = new WebSocketServer({
        server: server
    })
    wss.broadcast = function (data) {
        wss.clients.forEach(client => client.send(data))
    }
    onConnection = onConnection || (() => log('[WebSocket] connected.'))
    onMessage = onMessage || (msg => log(`[WebSocket] message received: ${msg}`))
    onClose = onClose || ((code, message) => log(`[WebSocket] closed: ${code} - ${message}`))
    onError = onError || (err => {`[WebSocket] error: ${err}`})
    wss.on('connection', function (ws) {
        let location = url.parse(ws.upgradeReq.url, true)
        log('[WebSocketServer] connection: ' + location.href)
        ws.on('message', onMessage)
        ws.on('close', onClose)
        ws.on('error', onError)
        if (location.pathname != '/ws/chat') {
            ws.close(4000, 'Invalid URL!')
        }
        let user = parseUser(ws.upgradeReq)
        if (!user) {
            ws.close(4001, 'Invalid user')
        }
        ws.user = user
        ws.wss = wss
        onConnection.apply(ws)
    })
    log('WebSocketServer was attached.')
    return wss
}

let messageIndex = 0

const createMessage = function (type, user, data) {
    messageIndex += 1
    return JSON.stringify({
        id: messageIndex,
        type: type,
        user: user,
        data: data,
    })
}

const onConnect = function () {
    let user = this.user
    let msg = createMessage('join', user, `${user.name} joined.`)
    this.wss.broadcast(msg)
    let users = this.wss.clients.map(client => client.user)
    this.send(createMessage('list', user, users))
}

const onMessage = function (message) {
    log(message)
    if (message && message.trim()) {
        let msg = createMessage('chat', this.user, message.trim())
        this.wss.broadcast(msg)
    }
}

const onClose = function () {
    let user = this.user
    let msg = createMessage('left', user, `${user.name} is left.`)
    this.wss.broadcast(msg)
}

app.wss = createWebsocketServer(server, onConnect, onMessage, onClose)

log(`app started at port 3000...`)