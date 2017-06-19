/**
 * Created by linmu on 2017/6/19.
 */
const log = console.log.bind(console)
let index = 0

const signinPage = async function (ctx, next) {
    let names = '甲乙丙丁戊己庚辛壬癸'
    let name = names[index % 10]
    ctx.render('signin.html', {
        name: `路人${name}`
    })
}

const signin = async function (ctx, next) {
    index += 1
    let name = ctx.request.body.name || '路人甲'
    let user = {
        id: index,
        name: name,
        image: index % 10,
    }
    let value = Buffer.from(JSON.stringify(user)).toString('base64')
    log(`Set cookie value: ${value}`)
    ctx.cookies.set('name', value)
    ctx.response.redirect('/')
}

const signout = async function (ctx, next) {
    ctx.cookies.set('name', '')
    ctx.response.redirect('/signin')
}

module.exports = {
    'GET /signin': signinPage,
    'POST /signin': signin,
    'GET /signout': signout,
}