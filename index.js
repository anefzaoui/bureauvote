const express = require('express')
const hbs = require('express-hbs');

const app = express()
const port = 3000
var vote = require('./vote.json');


String.prototype.contains = function(string){    
    var keywords = string.split(" ");
    var contain = true;

    for(var i = 0; i < keywords.length && contain; i++){
        if(keywords[i] == "") continue;

        var regex = new RegExp(keywords[i], "i");
        contain = contain && regex.test(this);
    }

    return contain;
}



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
    let q = req.query.q || '';
    let qT = q.toUpperCase().replace('مدرسة','').replace('مكتب','').trim();
    if (q == null || q == undefined || qT.length < 4) {
        res.render('search_error', {
            title: 'قاعدة بيانات مراكز الإقتراع - لا يوجد نائج',
            error: "رجاءا أدخل أكثر من 4 حروف أو أرقام في خانة البحث",
            layout: 'main'
        });
    } else {
        let result = vote.filter(element => (element[0].contains(qT) || element[1].contains(qT) || element[2].contains(qT) || element[3].contains(qT) || element[4].contains(qT) || element[5].contains(qT) || element[6].contains(qT)))
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
