var mappings = require('../mappings.json');
var request = require('request');
var xml2js = require('xml2js');

signIn("Brett", "ucitableau", "UCI", function(err, token, siteId, userId) {
  if (err) throw err;

  queryWorkbooksForUser(token, siteId, userId, function(err, workbooks) {
    if (err) throw err;

    var workbookId = workbooks[3].$.id;

    downloadVis(token, siteId, workbookId, function(err, vis) {
      if (err) throw err;


     console.log(vis);
    });
  });
})


function signIn(name, password, site, callback) {
  request({
    method: 'POST',
    url: 'https://tableau.ics.uci.edu/api/2.3/auth/signin',
    body: `
    <tsRequest>
    <credentials name="${name}" password="${password}" >
    <site contentUrl="${site}" />
    </credentials>
    </tsRequest>
   ` 
  }, function (error, response, body) {
    if (error) return callback(error);
    if (response.statusCode !== 200) {
      return callback(new Error('not 200'));
    }
    xml2js.parseString(body, function (err, result) {
      try {
        var cred = result.tsResponse.credentials[0];
        var token = cred.$.token;
        var siteId = cred.site[0].$.id;
        var userId = cred.user[0].$.id;
        
        //console.log(JSON.stringify(cred, null, 4));
        
        callback(null, token, siteId, userId);
      } catch (e) {
        callback(e);
      }
    })
  })
}

function queryWorkbooksForUser(token, siteId, userId, callback) {
  request({
    url: `https://tableau.ics.uci.edu/api/2.3/sites/${siteId}/workbooks`,
    headers: {
      "X-Tableau-Auth": token
    }
  }, function (error, response, body) {
    if (error) return callback(error);
    if (response.statusCode !== 200) {
      console.log(response.statusCode);
    }
    xml2js.parseString(body, function(err, res) {
      //console.log(JSON.stringify(res, null, 4));

      callback(null, res.tsResponse.workbooks[0].workbook);
    });
  })
}

function downloadVis(token, siteId, workbook, callback) {
  request({
    url: `https://tableau.ics.uci.edu/api/2.3/sites/${siteId}/workbooks/${workbook}/previewImage`,
    headers: {
      "X-Tableau-Auth": token
    }
  }, function (error, response, body) {
    if (error) return callback(error);
    if (response.statusCode !== 200) {
      console.log(response.statusCode);
    }
    require('fs').writeFileSync('/tmp/image.png', body);
  })
}
