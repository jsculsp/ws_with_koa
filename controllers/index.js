/**
 * Created by linmu on 2017/6/19.
 */

const index = async function (ctx, next) {
    let user = ctx.state.user
    if (user) {
        ctx.render('room.html', {
            user: user
        })
    } else {
        ctx.response.redirect('/signin')
    }
}

module.exports = {
    'GET /': index,
}