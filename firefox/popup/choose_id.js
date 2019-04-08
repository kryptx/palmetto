var logging_in = false;

function saveUser(userId) {
  var storageItem = browser.storage.local.get('accounts')
  storageItem.then(function(res) {
    var user = { id: userId };
    if(!res.accounts || !res.accounts.push) res.accounts = [];
    res.accounts.push(user);
    browser.storage.local.set(res);
    try {
      drawAccount(user);
    } catch (e) {
      alert(e);
    }
  })
  .catch(function(err) {
    alert(err);
  })
}

function drawAccount(user) {
  var acctLi = document.getElementById('user_').cloneNode(true);
  acctLi.id += user.id.replace(/[^\w]/, '');
  var usernames = acctLi.getElementsByClassName('username');
  var logins = acctLi.getElementsByClassName('login');
  var removes = acctLi.getElementsByClassName('remove');
  removes[0].addEventListener('click', function() { removeUser(user.id); });
  logins[0].addEventListener('click', function() { login(user.id); });
  usernames[0].innerText = user.id;
  acctLi.classList.remove('hidden');
  document.getElementById('accounts').appendChild(acctLi);
}

function removeUser(userId) {
  var storageItem = browser.storage.local.get('accounts')
  storageItem.then(function(res) {
      var newAccounts = res.accounts.filter(val => val.id !== userId);
      browser.storage.local.set({ accounts: newAccounts });
      itemId = userId.replace(/[^\w]/, '');
      var accountLi = document.getElementById("user_" + itemId);
      accountLi.style.display = "none"
      accountLi.parentNode.removeChild(accountLi);
    });
}

function login(userId) {
  logging_in = userId;
  browser.tabs.reload();
}

function restoreOptions() {
  var storageItem = browser.storage.local.get('accounts');
  storageItem.then(function(res) {
    for(var i = 0; i < res.accounts.length; i++) {
      drawAccount(res.accounts[i]);
    }
  });
}

document.querySelector('#btnAddAccount').addEventListener('click', function() {
  var newUserField = document.querySelector("#newId");
  var newId = newUserField.value;
  saveUser(newId);
});

document.addEventListener('DOMContentLoaded', restoreOptions);

// this is an imperfect implementation, in so many ways. do better.
browser.webRequest.onBeforeSendHeaders.addListener(
  function(details) {
    if(logging_in) {
      var headers = details.requestHeaders;
      headers.push({ name: 'Authorization', value: 'Palmetto ' + logging_in });
      return Promise.resolve({ requestHeaders: headers });
    }
  },
  { urls: ['<all_urls>'] },
  [ "blocking", "requestHeaders" ]
);

browser.webRequest.onHeadersReceived.addListener(function(details) {
  logging_in = null;
}, { urls: ['<all_urls>'] });