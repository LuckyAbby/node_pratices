var express = require('express')
var superagent = require('superagent')
var cheerio = require('cheerio')

var app = express()

app.get('/', (req, res, next) => {
  superagent.get('https://cnodejs.org/')
  .then(result => {
    const $ = cheerio.load(result.text)
    let items = []
    $('.cell').each((index, ele) => {
      const $ele = $(ele)
      const title = $ele.find('a.topic_title').attr('title')
      const href = `https://cnodejs.org${$ele.find('a.topic_title').attr('href')}`
      const author = $ele.find('a.user_avatar img').attr('title')
      items.push({
        'title': title,
        'href': href,
        'author': author
      })
    })
    res.send(items)
  })
  .catch(err => {
    return next(err)
  })
})

app.listen(3033, (req, res) => {
  console.log('app is listening at 3033')
})
