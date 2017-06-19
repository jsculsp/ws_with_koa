/**
 * Created by linmu on 2017/6/16.
 */
const fs = require('fs')
const log = console.log.bind(console)

let apiGet = (url, router, mapping) => {
    let path = url.substring(4)
    router.get(path, mapping[url])
}

let apiPost = (url, router, mapping) => {
    let path = url.substring(5)
    router.post(path, mapping[url])
}

let apiPut = (url, router, mapping) => {
    let path = url.substring(4)
    router.put(path, mapping[url])
}

let apiDelete = (url, router, mapping) => {
    let path = url.substring(7)
    router.del(path, mapping[url])
}

let apiOthers = (url, router, mapping) => {
    log(`invalid URL: ${url}`)
}

let addMapping = (router, mapping) => {
    let mapDict = {
        'GET ': apiGet,
        'POST ': apiPost,
        'PUT ': apiPut,
        'DELETE ': apiDelete,
        'OTHERWISE ': apiOthers,
    }
    for (let url in mapping) {
        for (let method in mapDict) {
            if (url.startsWith(method)) {
                let apiMethod = mapDict[method]
                apiMethod(url, router, mapping)
                break
            }
        }
    }
}

let addControllers = (router, dir) => {
    let fileAll = fs.readdirSync(`${__dirname}/${dir}`)
    let fileFiltered = fileAll.filter(f => f.endsWith('.js'))
    fileFiltered.forEach(f => {
        let mapping = require(`${__dirname}/${dir}/${f}`)
        addMapping(router, mapping)
    })
}

module.exports = (dir = 'controllers') => {
    let controllers_dir = dir
    let router = new require('koa-router')()
    addControllers(router, controllers_dir)
    return router.routes()
}