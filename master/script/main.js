const mysql   = require('mysql');
const envs    = require('envs');
const express = require('express');

const port = 6789;

var app = express();

var pool      =    mysql.createPool({
    connectionLimit : 10, //important
    host     : envs('DB_HOST'),
    user     : envs('DB_USER'),
    password : envs('DB_PASSWORD'),
    database : 'my_db',
    debug    :  false
});

app.use('/static', express.static('public'));

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.get('/report',  (req, res) => {
  pool.getConnection((error,connection) => {
    var param = req.query;
    console.log(param);
    connection.query('SELECT * FROM `slaves` WHERE `host` = ?', [param.host], (err, rows, fields) => {
      if (err) throw err;
      param.updatedAt = new Date;
      if( param.ip instanceof Array ) {
        param.ip = param.ip.join(',');
      }
      if(rows.length == 0) {
        param.createdAt = param.updatedAt;
        connection.query('INSERT INTO `slaves` SET ?', param, (err1, result1) => {
          if (err1) throw err1;
          res.send('Report OK');
        });
      } else {
        connection.query('UPDATE `slaves` SET ? where host = ?', [param, param.host], (err1, result1) => {
          if (err1) throw err1;
          res.send('Report OK');
        });
      }
    });
  });
});

app.get('/list',  (req, res) => {
  pool.getConnection((error,connection) => {
    connection.query('SELECT * FROM `slaves` ORDER BY `updatedAt` DESC', (err, rows, fields) => {
      if (err) throw err;

      if( rows.length == 0 ) {
        res.send("Empty");
        return;
      }
      var out = "<table border=1>";
      out += "<thead>";
      var keys = Object.keys(rows[0])
      for (var idx in keys) {
        out += "<th>" + keys[idx] + "</th>";
      }
      out += "</thead>";
      out += "<tbody>";
      for (var idx in rows) {
        var row = rows[idx];
        out += "<tr>";
        for(var idy in keys) {
          var key = keys[idy];
          var val = row[key];
          if(key == 'ip') {
            val = val.split(',').join('<br />');
          }
          out += "<td>" + val + "</td>";
        }
        out += "</th>";
      }
      out += "</tbody>";
      out += "</table>";
      // res.end(JSON.stringify(rows));
      res.send(out);
    });
  });
});

app.get('/profile',  (req, res) => {
  pool.getConnection((error,connection) => {
    connection.query('SELECT * FROM `slaves` ORDER BY `updatedAt` DESC', (err, rows, fields) => {
      if (err) throw err;

      var out = [];
      for(var idx in rows) {
        const row = rows[idx];
        var ips = row.ip.split(',');
        for(var idy in ips) {
          var ip = ips[idy];
          if( ip.match(/^10\.14\.137.*$/) != null) {
            out.push(ip);
          }
        }
      }
      res.send(out.join(','));
    });
  });
});

app.listen(port, () => {
  console.log('Server listening on port ' + port);
});
