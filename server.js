var fetch = require("node-fetch");
var cheerio = require("cheerio");
var express = require('express')

let up = 
(term) =>Promise.all(
'1,2,3,4,5,6,7,8,9,10,11'.split(',')
.map((num)=>
 fetch(`http://www.secretflying.com/usa-deals/page/${num}`)
    .then(res => res.text())
    .then(body =>{ 

        let $ = cheerio.load(body);
        let parsed = $('article .entry-title a');

        let articles = 
        Object.keys(parsed)
              .filter(x=>parseInt(x+1)?x:false)
              .map(x=>{ 
                return {title: parsed[x].children[0].data,link: parsed[x].attribs.href }
                });

        return articles; 
    })
))
.then(x=>x.reduce((a,y)=>{ return a.concat(y) },[]))
.then(x=>x.filter(x=>( x.title.search(term) > -1) ))
.then(x=>x.map(x=>`<li><a target="_blank" href="${x.link}">${x.title}</a></li>`))
.then(a=>`<html>
                <header><title>SecretFlying List</title></header>
                <body>
                    <div><ol>${a.join('')}</ol></div>
                </body>
            </html>`)



var app = express()

app.get('/', function (req, res) {
  up().then((r)=>{ res.send(r) }) 
})

app.get('/:city', function (req, res) {
  var term = req.params.city;
  up(term).then((r)=>{ res.send(r) }) 
})

app.listen(process.env.PORT, function () {
  console.log('Example');
})
