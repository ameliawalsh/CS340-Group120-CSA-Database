// nodeBackbone.js

// This javascript file, along with the other documents that make up this website and database, were generated by David Kaff and Amelia Walsh in CS 340 at Oregon State in the Winter of 2021.

// The following resources were referenced in the creation of this database driven website:

    // expressjs.com
    // CS 290 Coursework
    // CS 340 Coursework
    // bootstrap.com
    // stackoverflow.com
    // eloquentjavascript.net
    // udemy.com
    //amelia is awesome!

         ///////////////////////////////////////////////////////////////
        // in order for this website to run, node must be installed, //
       //     along with the following packages:                    //
      //        express, express-handlebars, express-session,      //
     //         body-parser, and mysql                            //
    ///////////////////////////////////////////////////////////////

//================================================================//

      ///////////////////////////////////////////
     // set up express and other dependencies //
    ///////////////////////////////////////////

const express = require('express');
const app = express();

const handlebars = require('express-handlebars').create({defaultLayout:'main'});

app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');
app.use('/source', express.static('resources'));

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

// magic from Millie
const CORS = require('cors');
app.use(CORS());


// const session = require('express-session');
// app.use(session({secret: 'verySecretPassword'}));

const mysql = require('mysql');
const pool = mysql.createPool({
    connectionLimit:    10,
    host:               'classmysql.engr.oregonstate.edu',
    user:               'cs340_kaffs',
    password:           'sP6ptfbWuXAU54w',
    database:           'cs340_kaffs'
});
module.exports.pool = pool;

//================================================================//

      //~~~//////////////////////////////////~~~//
     //    express backbone for node server    //
    //~~~//////////////////////////////////~~~//

const port = 28394;
app.set('port', port);

    /////////////
   // content //
  /////////////

app.get('/', funcHome);

//routes for farmer and planting pages
app.get('/farmer', funcFarmer);
app.get('/farmer-plant-new-row', func_farmer_new_crop_rows);
app.get('/farmer-harvest-new-row', func_farmer_new_harvest);
app.get('/farmer-view-planted-rows', func_farmer_view_rows);
app.get('/farmer-view-produce-on-hand', func_farmer_view_produce);
app.get('/farmer-add-new-crop-type', func_add_new_crop_type)

//routes for box packer
app.get('/box-packer', funcBoxPacker);

//routes for admin page and sub-pages
app.get('/admin', funcAdmin);
app.get('/admin-add-cust',func_add_cust);
app.get('/admin-updt-cust',func_updt_cust);
app.get('/admin-boxes-view',func_boxes_view);

function funcHome(req, res){
    content = {
        title: 'Rubyfruit Farm',
        page_name: 'home'
    };
    res.render('home', content);
}

          //////////////////
//=======// farmer pages //================================//
        //////////////////

function funcFarmer(req, res){
    content = {
        title: 'Rubyfruit Farm – Farmer',
        page_name: 'farmer',
        breadcrumbs: [
            {link: '/', page_name: 'home'}
        ]
    };
    res.render('farmer', content);
}

function func_farmer_new_crop_rows(req, res){
    content = {
        title: 'Rubyfruit Farm – Track Newly Planted Row',
        page_name: 'plant new row',
        breadcrumbs: [
            {link: '/', page_name: 'home'},
            {link: '/farmer', page_name: 'farmer'}
        ]
    };
    // get the crop type names before rendering
    pool.query(
        get_crop_types_query,
        function(err, result){
            // on return:
                // push results into content
                // render farmer-plant-new-row
            content.crop_types = result;
            res.render('farmer-plant-new-row', content);
        }
    )
}

function func_farmer_new_harvest(req, res){
    content = {
        title: 'Rubyfruit Farm – Enter Row Harvested',
        page_name: 'harvest new row',
        breadcrumbs: [
            {link: '/', page_name: 'home'},
            {link: '/farmer', page_name: 'farmer'}
        ]
    };
    // get the crop rows before rendering
    pool.query(
        get_crop_rows_query,
        function(err, result){
            content.crop_rows = result;
            for (i in content.crop_rows) {
                var date = new Date(content.crop_rows[i].mature_date);
                content.crop_rows[i].mature_date = Intl.DateTimeFormat('en-US').format(date);
            }
            res.render('farmer-harvest-new-row', content);
        }
    )
}

function func_farmer_view_rows(req, res){
    content = {
        title: 'Rubyfruit Farm – View Rows',
        page_name: 'view planted rows',
        breadcrumbs: [
            {link: '/', page_name: 'home'},
            {link: '/farmer', page_name: 'farmer'}
        ]
    };
    // get the crop rows before rendering
    pool.query(
        get_crop_rows_query,
        function(err, result){
            // on return:
                // push results into content
                // convert the dates to DateStrings for js
                // render farmer-view-planted-rows
            content.crop_rows = result;
                    // for (r in content.crop_rows) {
                    //     console.log(content.crop_rows[r]);
                    // }
            for (i in content.crop_rows) {
                var date = new Date(content.crop_rows[i].mature_date);
                content.crop_rows[i].mature_date = Intl.DateTimeFormat('en-US').format(date);
            }
            res.render('farmer-view-planted-rows', content);
        }
    )
}

function func_farmer_view_produce(req, res){
    content = {
        title: 'Rubyfruit Farm – View Produce',
        page_name: 'view produce on hand',
        breadcrumbs: [
            {link: '/', page_name: 'home'},
            {link: '/farmer', page_name: 'farmer'}
        ]
    };
    // get the harvests before rendering
    pool.query(
        get_harvests_query,
        function(err, result){
            // on return:
                // push results into content
                // convert the dates to DateStrings for js
                // render farmer-view-planted-rows
            content.harvests = result;
                    // for (r in content.crop_rows) {
                    //     console.log(content.crop_rows[r]);
                    // }
            for (i in content.harvests) {
                var date1 = new Date(content.harvests[i].harvest_date);
                content.harvests[i].harvest_date = Intl.DateTimeFormat('en-US').format(date1);
                var date2 = new Date(content.harvests[i].expiration_date);
                content.harvests[i].expiration_date = Intl.DateTimeFormat('en-US').format(date2);
            }
            res.render('farmer-view-produce-on-hand', content);
        }
    )
}

function func_add_new_crop_type(req, res){
    content = {
        title: 'Rubyfruit Farm – Add Crop Type',
        page_name: 'add new crop type',
        breadcrumbs: [
            {link: '/', page_name: 'home'},
            {link: '/farmer', page_name: 'farmer'}
        ]
    };
    res.render('farmer-add-new-crop-type', content);
}

          /////////////////////
//=======// box packer page //================================//
        /////////////////////

function funcBoxPacker(req, res){
    content = {
        title: 'Rubyfruit Farm – Box Packer',
        page_name: 'box packer',
        breadcrumbs: [
            {link: '/', page_name: 'home'}
        ]
    };
    res.render('boxPacker', content);
}

// Amelia's Pages: include pages that manage box packer & Admin

// ***ADMIN PAGES***

function funcAdmin(req, res){
  content = {
    title: 'Rubyfruit Farm – Administrator',
    page_name: 'admin',
    breadcrumbs: [
        {link: '/', page_name: 'home'}
    ]
  };
  res.render('admin', content);
}

function func_add_cust(req, res){
  content = {
    title: 'Rubyfruit Farm - Customer',
    page_name: 'add new customer',
    breadcrumbs: [
        {link: '/', page_name: 'home'},
        {link: '/admin', page_name: 'admin'}
    ]
  };
  res.render('admin_add_cust', content);
}

function func_updt_cust(req, res){
  content = {
    title: 'Rubyfruit Farm - Customer',
    page_name: 'update customer subscription',
    breadcrumbs: [
        {link: '/', page_name: 'home'},
        {link: '/admin', page_name: 'admin'}
    ]
  };
  res.render('admin_update_cust', content);
}

function func_boxes_view(req, res){
  content = {
    title: 'Rubyfruit Farm - Boxes',
    page_name: 'view and add boxes',
    breadcrumbs: [
        {link: '/', page_name: 'home'},
        {link: '/admin', page_name: 'admin'}
    ]
  };
  res.render('adminBoxView', content);
}



          /////////////////
//=======// SQL Queries //================================//
        /////////////////

const get_crop_types_query = 'SELECT crop_name, crop_id FROM Crop_Types;';
const add_crop_row_query = "INSERT INTO Crop_Rows (`crop_id`, `mature_date`) VALUES (?, ?);";
const get_crop_rows_query = 'SELECT row_id, Crop_Rows.crop_id, mature_date, crop_name FROM Crop_Rows LEFT JOIN Crop_Types ON Crop_Rows.crop_id = Crop_Types.crop_id;';
const add_harvest_query = "INSERT INTO Harvests (`row_id`, `quantity_harvested`, `harvest_date`, `expiration_date`) VALUES (?, ?, ?, ?);";
const get_harvests_query = 'SELECT harvest_id, crop_name, quantity_harvested, harvest_date, expiration_date FROM Harvests LEFT JOIN Crop_Rows ON Harvests.row_id = Crop_Rows.row_id LEFT JOIN Crop_Types ON Crop_Rows.crop_id = Crop_Types.crop_id;';
const add_crop_type_query = "INSERT INTO Crop_Types (`crop_name`) VALUES (?);"



          /////////////////////////////
//=======// Database AJAX Functions //================================//
        /////////////////////////////

app.post('/INSERT-crop-rows', func_INSERT_crop_rows);
function func_INSERT_crop_rows(req, res, next) {
    var {crop_id, mature_date} = req.body;
    pool.query(
        add_crop_row_query,
        [crop_id, mature_date],
        function(err, result){
            if(err){
                res.type('text/plain');
                res.status(401);
                res.send('401 - bad INSERT');
                console.log(err);
                return;
            }
            // on return, send good response back
            res.type('text/plain');
            res.status(200);
            res.send('200 - good INSERT');
        }
    )
}

app.post('/INSERT-harvests', func_INSERT_harvests);
function func_INSERT_harvests(req, res, next) {
    var {row_id, quantity, harvest_date, expiration_date} = req.body;
    pool.query(
        add_harvest_query,
        [row_id, quantity, harvest_date, expiration_date],
        function(err, result){
            if(err){
                res.type('text/plain');
                res.status(401);
                res.send('401 - bad INSERT');
                console.log(err);
                return;
            }
            // on return, send good response back
            res.type('text/plain');
            res.status(200);
            res.send('200 - good INSERT');
        }
    )
}


app.post('/INSERT-crop-types', func_INSERT_crop_types);
function func_INSERT_crop_types(req, res, next) {
    var {crop_name} = req.body;
    pool.query(
        add_crop_type_query,
        [crop_name],
        function(err, result){
            if(err){
                res.type('text/plain');
                res.status(401);
                res.send('401 - bad INSERT');
                console.log(err);
                return;
            }
            // on return, send good response back
            res.type('text/plain');
            res.status(200);
            res.send('200 - good INSERT');
        }
    )
}

    ////////////
   // errors //
  ////////////

app.use(function(req,res){
  res.type('text/plain');
  res.status(404);
  res.send('404 - Not Found');
});

app.use(function(err, req, res, next){
  console.error(err.stack);
  res.type('plain/text');
  res.status(500);
  res.send('500 - Server Error');
});

//======================================================================//

      //////////////////////////////////////////////////////////////
     // Start listening to port, readout to log what's going on. //
    //////////////////////////////////////////////////////////////

app.listen(app.get('port'), function(){
  console.log('Express started on http://localhost:' + app.get('port') + '; press CMD-. to terminate.')
});

// check one two

// extra comment


//======================================================================//

      ///////////////////////////////////////
     // Working on UPDATE Boxes_Harvests. //
    ///////////////////////////////////////


function get_next_box_helper(results) {
    var today = getTheCorrectToday();
    var next_box;
    var next_box_date = 0;
    for (r in results) {
        var box_date = new Date(results[r].box_date);
        if (box_date.valueOf() > today.valueOf()) {
            if (box_date.valueOf() < next_box_date.valueOf() || next_box_date == 0) {
                next_box = results[r];
                next_box_date = box_date;
            }
        }
    }
    return next_box;
}


function get_next_box() {
    return new Promise(function(resolve, reject) {
        pool.query(
            "SELECT * FROM Boxes",
            function(err, result){
                if (err) reject(err);
                else resolve(get_next_box_helper(result));
            }
        )
    });

}


function get_relevant_harvests(next_box) {
    return new Promise(function(resolve, reject) {
        var date = new Date(next_box.box_date);
        date = new Date(date.valueOf() + (14 * 24 * 60 * 60 * 1000));
        harvest_finalizer_date = `'` + date.toISOString().substring(0,10) + `'`;
        console.log(`Distribution of Harvests expiring b4 ${harvest_finalizer_date} is finalized, don't update.`);
        pool.query(
            "SELECT * FROM Harvests WHERE expiration_date >= " + harvest_finalizer_date,
            function(err, result) {
                if (err) reject(err);
                else resolve(result);
            }
        );
    });
}


function get_customer_counts(relevant_boxes) {
    // console.log(relevant_boxes);
    customer_counts = relevant_boxes.map(box =>
        {return new Promise(function(resolve, reject) {
            pool.query(
                "SELECT Count(*) AS number_of_customers FROM Boxes_Customers WHERE box_id = " + box.box_id + ";",
                function(err, result) {
                    if (err) reject(err);
                    else {resolve(result[0].number_of_customers);}
                }
            );
        });}
    );
    return Promise.all(customer_counts).then(counts => {return counts})
}


function parse_boxes_for_dist(boxes, qty_left) {
    // console.log(`boxes in parse_boxes_for_dist`);
    // console.log(boxes);
    var today = getTheCorrectToday();
    today = today.valueOf();
    let linked_box_ids = [];
    for (b in boxes) {
        var box_date = new Date(boxes[b].box_date);
        box_date = box_date.valueOf();
        if (box_date > today + (7 * 24 * 60 * 60 * 1000)) {
            // console.log('one box bigger than today + 7');
            linked_box_ids.push(boxes[b].box_id);
        }
        else if (box_date >= today) {
            // console.log('one box bigger than today but smaller than today + 7');
            let allocated = boxes[b].qty_per * (boxes[b].number_of_customers - boxes[b].number_packed);
            qty_left -= allocated;
        }
        // else console.log('one box smaller than today');
    }
    return [linked_box_ids, qty_left];
}


function get_boxes_in_window(expiration_date) {
    // console.log(`getting boxes in window for ${expiration_date.toISOString().substring(0,10)}`);
    let today = getTheCorrectToday();
    let date0 = new Date(today.getTime() + (8 * 24 * 60 * 60 * 1000));
    date0 = `'` + date0.toISOString().substring(0,10) + `'`;
    // console.log(date0);
    expiration_date = new Date(expiration_date);
    let date1 = new Date(expiration_date.getTime() - (8 * 24 * 60 * 60 * 1000));
    date1 = `'` + date1.toISOString().substring(0,10) + `'`;
    // console.log(date1);
    return new Promise(function(resolve, reject) {
        pool.query(
            "SELECT * FROM Boxes WHERE box_date BETWEEN " + date0 + " AND " + date1 + ";",
            function(err, result) {
                if (err) reject(err);
                else {
                    // console.log(`boxes for ${expiration_date.toISOString().substring(0,10)}`);
                    // console.log(result);
                    resolve(result);
                }
            }
        );
    });
}


function upd_B_H(box, harvest, qty_per) {
    return new Promise(function(resolve, reject) {
        pool.query(
            "UPDATE Boxes_Harvests SET `qty_per` = ? WHERE `box_id` = ? AND `harvest_id` = ?",
            [qty_per, box, harvest],
            function (err, result) {
                if(err) reject(err);
                else resolve(result);
            }
        );
    });
}

function add_B_H(box, harvest, qty_per) {
    return new Promise(function(resolve, reject) {
        pool.query(
            "INSERT INTO Boxes_Harvests (`box_id`, `harvest_id`, `qty_per`) VALUE (?,?,?)",
            [box, harvest, qty_per],
            function (err, result) {
                if(err) reject(err);
                else resolve(result);
            }
        );
    });
}

function rmv_B_H(box, harvest) {
    return new Promise(function(resolve, reject) {
        pool.query(
            "DELETE FROM Boxes_Harvests WHERE `box_id` = ? AND `harvest_id` = ?;",
            [box, harvest],
            function (err, result) {
                if(err) reject(err);
                else resolve(result);
            }
        );
    });
}


function audit_B_H_for_harvest(harvest, box_ids_and_qty_left) {
    let qty_left = box_ids_and_qty_left[1];
    let linked_box_ids = box_ids_and_qty_left[0];
    let harvest_id = harvest.harvest_id;
    // console.log(`box_ids_and_qty_left in audit for harvest ${harvest_id}`);
    // console.log(box_ids_and_qty_left);
    // console.log(`qty_left in audit for harvest ${harvest_id}`);
    // console.log(qty_left);


    let got_boxes = get_boxes_in_window(harvest.expiration_date);
    got_boxes.then(boxes => {
        // console.log(`boxes`);
        // console.log(boxes);
        counted_boxes = get_customer_counts(boxes);
        counted_boxes.then( counts => {
            console.log(`==-==-==-==-==`);
            console.log(`for harvest ${harvest.harvest_id}`);
            console.log(`--=--=--=--=--`);
            console.log(`counts`);
            console.log(counts);
            let boxes_to_serve = counts.reduce((a, b) => a + b, 0);
            console.log(`boxes_to_serve`);
            console.log(boxes_to_serve);
            if (boxes_to_serve == 0) return;
            let base_amount = Math.floor(qty_left/boxes_to_serve);
            console.log(`base_amount`);
            console.log(base_amount);
            console.log(`qty_left before base_amount_served reduction`);
            console.log(qty_left);
            qty_left -= base_amount * boxes_to_serve;
            console.log(`after`);
            console.log(qty_left);
            for (b in boxes) {
                if (linked_box_ids.includes(boxes[b].box_id)) {
                    removeItemOnce(linked_box_ids, boxes[b].box_id);
                    if (qty_left > counts[b]) {
                        upd_B_H(boxes[b].box_id, harvest_id, base_amount + 1);
                    } else {
                        upd_B_H(boxes[b].box_id, harvest_id, base_amount)
                    }
                } else {
                    if (qty_left > counts[b]) {
                        add_B_H(boxes[b].box_id, harvest_id, base_amount + 1);
                    } else {
                        add_B_H(boxes[b].box_id, harvest_id, base_amount)
                    }
                }
            }
            for (l in linked_box_ids) {
                rmv_B_H(linked_box_ids[l], harvest_id);
            }
        })
    })
}


function get_relevant_boxes_with_counts(harvest) {   //*** rename ***
    let qty_left = harvest.quantity_harvested - harvest.quantity_distributed;
    // console.log(`qty_left for harvest ${harvest.harvest_id}`);
    // console.log(qty_left);
    return new Promise(function(resolve, reject) {
        pool.query(
            "SELECT Boxes_Harvests.box_id, box_date, number_packed, qty_per FROM Boxes_Harvests LEFT JOIN Boxes ON Boxes_Harvests.box_id = Boxes.box_id WHERE harvest_id = " + harvest.harvest_id + ";",
            function(err, result) {
                if (err) reject(err);
                else if (result.length == 0) {
                    audit_B_H_for_harvest(harvest, [[],qty_left]);
                    resolve([]);
                }
                else {
                    count = get_customer_counts(result);
                    count.then(value => {
                        for (r in result) {
                            result[r].number_of_customers = value[r];
                        }
                        // console.log(`results after customer counts for harvest ${harvest.harvest_id}`);
                        // console.log(result);
                        let box_ids_and_qty_left = parse_boxes_for_dist(result, qty_left);
                        // console.log(`res of parser for harvest ${harvest.harvest_id}`);
                        // console.log(box_ids_and_qty_left);
                        audit_B_H_for_harvest(harvest, box_ids_and_qty_left);
                        resolve();
                    });
                }
            }
        );
    });
}


function audit_boxes_harvests_ALGORITHM() {
    let next_box = get_next_box();
    let relevant_harvests = next_box.then(value => get_relevant_harvests(value));

    let update_return_code = relevant_harvests.then(harvests => {
        distribution_updates = harvests.map(harvest => {
            return get_relevant_boxes_with_counts(harvest);
        });
        return Promise.all(distribution_updates).then(statuses => {return statuses})
    });

    // update_return_code.then(value => console.log(value));
}

audit_boxes_harvests_ALGORITHM();




function add_B_C(box, customer) {
    return new Promise(function(resolve, reject) {
        pool.query(
            "INSERT INTO Boxes_Customers (box_id,customer_id) VALUES (?, ?);",
            [box, customer],
            function (err, result) {
                if (err) reject(err);
                else resolve(result);
            }
        )
    });
}

function rmv_B_C(box, customer) {
    return new Promise(function(resolve, reject) {
        pool.query(
            "DELETE FROM Boxes_Customers WHERE `box_id` = ? AND `customer_id` = ?;",
            [box, customer],
            function (err, result) {
                if (err) reject(err);
                else resolve(result);
            }
        )
    });
}

function update_B_C_on_customer(customer, boxes) {
    var date_paid = new Date(customer.date_paid);
    date_paid = date_paid.valueOf();
    for (b in boxes) {
        var box_date = new Date(boxes[b].box_date);
        box_date = box_date.valueOf();
        if (date_paid > box_date) {
            if (boxes[b].linked_customers.includes(customer.customer_id)) {
                continue;
            } else {
                add_B_C(boxes[b].box_id, customer.customer_id);
                continue;
            }
        }
        else {
            if (boxes[b].linked_customers.includes(customer.customer_id)) {
                rmv_B_C(boxes[b].box_id, customer.customer_id);
                continue;
            } else {
                continue;
            }
        }
    }
}

function get_relevant_customers() {
    date = new Date();
    today = `'` + date.toISOString().substring(0,10) + `'`;
    return new Promise(function(resolve, reject) {
        pool.query(
            "SELECT * FROM Customers WHERE date_paid > " + today + ";",
            function(err, result) {
                if (err) reject(err);
                else resolve(result);
            }
        );
    });
}

function get_boxes_B_C_links(boxes) {
    customer_links = boxes.map(box =>
        {return new Promise(function(resolve, reject) {
            pool.query(
                "SELECT customer_id FROM Boxes_Customers WHERE box_id = " + box.box_id + ";",
                function(err, result) {
                    if (err) reject(err);
                    else {
                        linked_customers = [];
                        for (r in result) {
                            linked_customers.push(result[r].customer_id);
                        }
                        resolve(linked_customers);
                    }
                }
            );
        });}
    );
    return Promise.all(customer_links).then(customers => {return customers})
}

function get_relevant_boxes() {
    let date = getTheCorrectToday();
    let today = `'` + date.toISOString().substring(0,10) + `'`;
    return new Promise(function(resolve, reject) {
        pool.query(
            "SELECT * FROM Boxes WHERE box_date > " + today + ";",
            function(err, result) {
                if (err) reject(err);
                else {
                    links = get_boxes_B_C_links(result);
                    links.then(value => {
                        for (r in result) {
                            result[r].linked_customers = value[r];
                        }
                        resolve(result)
                    });
                }
            }
        );
    });
}

function UPDATE_boxes_customers_ALGORITHM(){
    let data = [get_relevant_boxes(), get_relevant_customers()];
    Promise.all(data).then(data => {
        for (customer in data[1]) {
            update_B_C_on_customer(data[1][customer], data[0]);
        }
    });
}

// UPDATE_boxes_customers_ALGORITHM();



function getTheCorrectToday() {
    let date = new Date();
    let offset = date.getTimezoneOffset() * 60 * 1000;
    return new Date(date.getTime() - offset);
}


function zzz(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
async function sleep() {
    await zzz(2000);
}
async function slep() {
    await zzz(200);
}

// stackoverflow_5767325
function removeItemOnce(arr, value) {
  var index = arr.indexOf(value);
  if (index > -1) {
    arr.splice(index, 1);
  }
  return arr;
}

