var mappings = require('../mappings.json');
var request = require('request');
var xml2js = require('xml2js');

signIn("keyvan", "ucitableau", "UCI", function(err, token, siteId, userId) {
  if (err) throw err;

  queryWorkbooksForUser(token, siteId, userId, function(err, workbooks) {
    if (err) throw err;

    console.log(workbooks);
    return;

    var workbookId = "5ddd96b6-0682-47d1-b121-4141dce4ae86";

    downloadVis(token, workbookId,, function(err, vis) {
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
      console.log(JSON.stringify(res, null, 4));
    });
  })
}

function downloadVis(token, workbook, callback) {
  var site = "7bf28ce0-5d61-440a-91ee-ce26102c2738";
  request({
    url: `https://tableau.ics.uci.edu/api/2.3/sites/${site}/workbooks/${workbook}/previewImage`,
    headers: {
      "X-Tableau-Auth": token
    }
  }, function (error, response, body) {
    if (error) return callback(error);
    if (response.statusCode !== 200) {
      console.log(response.statusCode);
    }
    console.log(body)
  })
}
