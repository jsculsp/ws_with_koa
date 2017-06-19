/**
 * Created by linmu on 2017/6/16.
 */
const nunjucks = require('nunjucks')

const createEnv = function (path, opts) {
    let autoescape = opts.autoescape === undefined ? true: autoescape
    let noCache = opts.noCache || false
    let watch = opts.watch || false
    let throwOnUndefined = opts.throwOnUndefined || false
    let fileSystemLoaderOpts = {
        noCache: noCache,
        watch: watch,
    }
    let fileSystemLoader = new nunjucks.FileSystemLoader(path, fileSystemLoaderOpts)
    let customLoader = {
        autoescape: autoescape,
        throwOnUndefined: throwOnUndefined,
    }
    let env = new nunjucks.Environment(fileSystemLoader, customLoader)
    if (opts.filters) {
        for (let f in opts.filters) {
            env.addFilter(f, opts.filters[f])
        }
    }
    return env
}

const templating = function (path, opts) {
    let env = createEnv(path, opts)
    return async (ctx, next) => {
        ctx.render = function (view, model) {
            ctx.response.body = env.render(view, Object.assign({}, ctx.state || {}, model || {}))
            ctx.response.type = 'text/html'
        }
        await next()
    }
}

module.exports = templating
