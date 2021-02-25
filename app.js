const express = require("express");
const app = express();
const body_parser = require("body-parser")

const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("./db.sqlite");

// db init [create table if not exist]
db.run(`
CREATE TABLE IF NOT EXISTS prod(
    id integer NOT NULL PRIMARY KEY UNIQUE, 
    pd_name text NOT NULL UNIQUE,
    pd_price float,
    pd_qty integer default 0 NOT NULL )
`);

app.use(body_parser.urlencoded({extended: false}));
app.use(body_parser.json());

// serve root page
app.get('/', function (req, res) {
    res.send("API specifics.<br><br> List all => GET /product <br> View Product => GET /product/id <br> Add Product => POST /product <br> Update Product => PUT /product/id <br> Delete Product => DEL /product/id <br> Prodcut Structure { id, name, price, qty }");
});

// list products
app.get('/product', function (req, res) {
    db.all(
        "SELECT * FROM prod",
        function (err, rows) {
            if (err) res.send(err);
            res.send(rows);
        }
    );
});

// add product
app.post("/product", function (req, res) {
    if (req.body.name) {
        db.run(
            "INSERT INTO prod (id, pd_name, pd_price, pd_qty) VALUES (?,?,?,?)",
            [
                req.body.id,
                req.body.name,
                req.body.price,
                req.body.qty
            ],
            function (err) {
                if (err) {
                    console.log(err);
                    res.send({"error": err});
                }
                else { res.send({"success": true}); }
            }
        );
    } else {
        res.send({"error": "name is required"})
    }
});

// modify product
app.put("/product/:id", function (req, res) {
    db.get(
        "SELECT pd_name, pd_price, pd_qty FROM prod WHERE id=?", [req.params.id],
        function (err, rows) {
            console.log(rows);
            db.run(
                "UPDATE prod SET pd_name=?, pd_price=?, pd_qty=? WHERE id=?",
                [
                    req.body.name  || rows["pd_name"],
                    req.body.price || rows["pd_price"],
                    req.body.qty   || rows["pd_qty"],
                    req.params.id
                ],
                function (err) {
                    if (err) {
                        console.log(err);
                        res.send({"error": err});
                    }
                    else res.send({"success": true});
                }
            );
        }
    );
});

//delete product
app.delete("/product/:id", function (req, res) {
    db.run("delete from prod where id=?", [req.params.id], function (err) {
        if (err) {
            console.log(err);
            res.send({"success": true});
        } else res.send({"success": true});
    });
});

app.listen(3000);
