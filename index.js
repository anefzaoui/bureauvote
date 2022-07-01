const express = require('express')
const hbs = require('express-hbs');

const app = express()
const port = 3000
var vote = require('./vote.json');

app.use(express.static('public'))


app.engine('hbs', hbs.express4({
    partialsDir: __dirname + '/views/partials',
    layoutsDir: __dirname + '/views/layouts',
}));
app.set('view engine', 'hbs');
app.set('views', __dirname + '/views');


app.get('/', (req, res) => {
    res.render('home', {
        title: 'قاعدة بيانات مراكز الإقتراع - إبحث عن مركز إقتراع',
        layout: 'main'
    });

})

app.get('/search', (req, res) => {
    let q = req.query.q;
    if (q == null || q == undefined || q.length < 4) {
        res.render('search_error', {
            title: 'قاعدة بيانات مراكز الإقتراع - لا يوجد نائج',
            error: "رجاءا أدخل أكثر من 4 حروف أو أرقام في خانة البحث",
            layout: 'main'
        });
    } else {
        let result = vote.filter(element => (element[0].includes(q) || element[1].includes(q) || element[2].includes(q) || element[3].includes(q) || element[4].includes(q) || element[5].includes(q) || element[6].includes(q)))
        //console.log(result);

        if (result.length > 0) {
            res.render('search', {
                title: 'مكتب الإقتراع بعنوان ' + q,
                keyword: req.query.q,
                result: result,
                layout: 'main'
            });
        } else {
            res.render('search_error', {
                title: 'قاعدة بيانات مراكز الإقتراع - لا يوجد نتائج بعنوان ' + q,
                keyword: req.query.q,
                error: "لا يوجد نتائج",
                layout: 'main'
            });
        }
    }

})

app.listen(port, () => {
    console.log(`Bureau Vote app is now listening on port ${port}`)
})
