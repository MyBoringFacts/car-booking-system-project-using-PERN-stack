// customersessionManager.js

let customerCurrentSession = null;

function setCustomerSession(data) {
    customerCurrentSession  = data;
}

function getCustomerSession() {
  return customerCurrentSession ;
}

function clearCustomerSession() {
    customerCurrentSession  = null;
}

module.exports = {
    setCustomerSession,
  getCustomerSession,
  clearCustomerSession,
};
