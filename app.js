import express from "express";
import mongoose, { Schema } from 'mongoose';
import date from './logic.js';

let day = date();

const uri = 'mongodb+srv://admin-nayan:LVc2XIAuXDY3vWZk@todolistapp.qhonjjt.mongodb.net/todoListDB?retryWrites=true&w=majority';
mongoose.connect(uri);

const app = express();
app.use(express.static('public'));

//set our view engine to ejs
app.set('view engine', 'ejs');

app.use(express.urlencoded({extended: true}));

const itemSchema = new Schema({
    name: String
});

const Item = mongoose.model('item', itemSchema);

//items which shows in todolist app by default
const item1 = new Item({
    name: 'Welcome to your To-Do List!'
});
const item2 = new Item({
    name: 'Hit the + button to add items.'
});
const item3 = new Item({
    name: '<-- Hit this button to remove items.'
});

let defaultItems = [item1, item2, item3];


app.get('/', async(req, res) => {
    let items = await Item.find()
    

    if (items.length === 0) {  
        await Item.insertMany(defaultItems)
        res.redirect('/')
    } else {
        //render method is send ejs files.
        //render(fileName, send variables as key value pairs).
        res.render('index', {title : day, items: items}) 
    }
})

app.post('/', async(req, res) => {
    let listName = req.body.submit;
    let newItem = req.body.list;

    //add new item to Item collection
    let addedItem = new Item({
        name: newItem
    });

    if (listName != day) {
        //if it is custom page other than home page
        let foundItem = await CustomList.findOne({name: listName});
        foundItem.items.push(addedItem);
        foundItem.save();
        res.redirect(`/${listName}`)
    } else {
        //if it is our home page ('/') of todolist
       addedItem.save();
       res.redirect('/');
    }
});

app.post('/delete', async(req, res) => {
    const docId = req.body.checkbox;
    const listName = req.body.title;

    if (listName == day) {
        await Item.findByIdAndDelete(docId);
        res.redirect('/');

    } else {
        //using mongoDB update Operator.
        await CustomList.findOneAndUpdate({'items._id': docId}, {$pull: {items: {_id: docId}}});
        //using mongoose array methods.
        // let doc = await CustomList.findOne({'items._id': docId});
        // doc.items.pull({_id: docId})
        // doc.save();
        res.redirect(`${listName}`);
    }
}); 

//New Collection setup
let customListSchema = new Schema({
    name: String,
    //Establishing relationship between CustomList and Item.
    items: [itemSchema]
});
let CustomList = mongoose.model('customList', customListSchema);


app.get('/:custom', async(req, res) => {
    let customRouteName = req.params.custom;

    //Every single document made in CutomList collection are now handling our new entire custom path
    let customListItem = await CustomList.findOne({name: customRouteName})
    if (!customListItem) {
        //create new custom page
        let customList1 = new CustomList({
            name: customRouteName,
            items: defaultItems
        });
        customList1.save();
        res.redirect(`/${customRouteName}`)
    } else {
        //show existing page
        res.render('index', {title: customRouteName, items: customListItem.items})
    }
})

app.post('/other', (req, res) => {
    let customPath = req.body.list;
    customPath = customPath.toLowerCase();
    res.redirect(`/${customPath}`);
})

app.get('/about', (req, res) => {
    res.render('about');
})

app.listen(3000, () => {
    console.log('server is running on 3000 port');
})