const express = require('express')
const superagent = require('superagent')
const cheerio = require('cheerio')
const eventproxy = require('eventproxy')

const app = express()
const ep = eventproxy()

app.get('/', (req, result) => {
  const url = 'https://cnodejs.org/'
  // 拿到当前页面的所有url
  let urlList = []
  let autList = []
  superagent.get(url).then(res => {
    const $ = cheerio.load(res.text)
    let resultList = []
    $('.topic_title').each((index, ele) => {
      const $ele = $(ele)
      const url = `https://cnodejs.org${$ele.attr('href')}`
      urlList.push(url)
    })
    console.log('urlList is', urlList)

    //爬一页会被封，自己mock了一些链接
    // todo:解决爬快被发现禁止访问
    urlList = ['https://cnodejs.org/topic/5a5ff20d9d371d4a059eebbe',
    'https://cnodejs.org/topic/59e86107a9a1e19f3634c871',
    'https://cnodejs.org/topic/5a6010e19d371d4a059eebd2',
    'https://cnodejs.org/topic/5a5ff20d9d371d4a059eebbe',
    'https://cnodejs.org/topic/5a60b106afa0a121784a8d72',
    'https://cnodejs.org/topic/5a618b95afa0a121784a8d99',
    'https://cnodejs.org/topic/5a580f57afa0a121784a8b40',
    'https://cnodejs.org/topic/5a61870c9288dc8153287f8c']
    // 访问所有url拿到url的内容
    urlList.forEach(url => {
      superagent.get(url).then(res => {
        console.log('访问第一个链接成功')
        ep.emit('getContextUrl', {'url': url, 'context':res.text})
      })
    })

    // 监听getUrl事件
    ep.after('getContextUrl', urlList.length, items => {
      items.map(item => {
        const href = item.url
        const context = item.context
        const $ = cheerio.load(context)
        const title = $('span.topic_full_title').text().trim()
        const comment1 = $('div.reply_item div.markdown-text p').eq(0).text()
        const author = $('div.changes span').eq(1).find('a').text()
        const autLink = `https://cnodejs.org${$('div.changes span').eq(1).find('a').attr('href')}`
        autList.push(autLink)
        superagent.get(autLink).then(res => {
          console.log('访问第二个链接成功')
          ep.emit('getAutLink', {href, title, comment1, author, 'context': res.text})
        })
      })
    })

    ep.after('getAutLink', urlList.length, items => {
      items.map(item => {
        const $ = cheerio.load(item.context)
        const href = item.href
        const title = item.title
        const comment1 = item.comment1
        const author = item.author
        const value = $('ul.unstyled span.big').text()
        resultList.push({
          href,
          title,
          comment1,
          author,
          value
        })
      })
      // console.log('resultList is', resultList)
      result.send(resultList)
    })
  })

})

app.listen(3033, (req, res) => {
  console.log('the app is listening at 3033')
})
