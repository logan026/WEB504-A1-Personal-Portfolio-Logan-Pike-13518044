const canteen = document.querySelector('.canteen');
const usernameInput = document.getElementById('username');
const loginButton = document.getElementById('login');
users = [
    { name: 'Staff', discount: 0.15 },
    { name: 'Student', discount: 0 },
];
function login() {
    const username = usernameInput.value.trim();
    const user = users.find(u => u.name.toLowerCase() === username.toLowerCase());
    if (user) {
        document.getElementById('welcome-message').textContent = `User set to ${user.name}.`;
        console.log(`User set to ${user.name}.`);
        document.getElementById('userNotFound').textContent = '';
        order.removeAttribute('hidden');
        return user;
    } else {
        document.getElementById('userNotFound').textContent = 'User not found.';
        return;
    }
}
function placeOrder() {
    const order = document.getElementById('order');
    order.style.display = `none`;
    const newOrder = document.getElementById('new-order');
    newOrder.removeAttribute('hidden');
    const orderSummary = document.getElementById('order-summary');
    orderSummary.removeAttribute('hidden');
    const user = login();
    if (!user) return;
    const largeMealQty = parseInt(document.getElementById('large-meal').value);
    const smallMealQty = parseInt(document.getElementById('small-meal').value);
    const largeMealPrice = 10.00;
    const smallMealPrice = 7.50;
    let total = (largeMealQty * largeMealPrice) + (smallMealQty * smallMealPrice);
    if(user === users[0]){
        document.getElementById('order-before-discount').textContent = `Total before discount: $${total.toFixed(2)}`;
        const staffDiscount = total * user.discount;
        document.getElementById('order-staff-discount').textContent = `Staff discount: $${staffDiscount.toFixed(2)}`;
        total *= (1 - user.discount);
    }
    if((largeMealQty + smallMealQty) >= 10){
        if(user === users[1]){
            document.getElementById('order-before-discount').textContent = `Total before discount: $${total.toFixed(2)}`;
        }
        const bulkDiscount = largeMealQty + smallMealQty;
        document.getElementById('order-bulk-discount').textContent = `Bulk discount: $${bulkDiscount.toFixed(2)}`;
        total -= bulkDiscount;
    }
    document.getElementById('order-after-discount').textContent = `Total: $${total.toFixed(2)}`;
}
function newOrder() {
    let largeMealQty = parseInt(document.getElementById('large-meal').value);
    let smallMealQty = parseInt(document.getElementById('small-meal').value);
    console.log(largeMealQty, smallMealQty);
    document.getElementById('large-meal').value = '';
    document.getElementById('small-meal').value = '';
    console.log(largeMealQty, smallMealQty);
    const newOrder = document.getElementById('new-order');
    newOrder.style.display = `none`;
    const order = document.getElementById('order');
    order.style.display = `block`;
    const orderSummary = document.getElementById('order-summary');
    orderSummary.style.display = `none`;
    const username = usernameInput.value.trim();
    const user = users.find(u => u.name.toLowerCase() === username.toLowerCase());
    if (user) {
        document.getElementById('welcome-message').textContent = `User set to ${user.name}.`;
        console.log(`User set to ${user.name}.`);
        document.getElementById('userNotFound').textContent = '';
        order.removeAttribute('hidden');
        return user;
    } else {
        document.getElementById('userNotFound').textContent = 'User not found.';
        return;
    }
}