/*
  Name: Oluwadamilola Adesola
  CU-ID: 101182761
  COMP-2406: Assignment 2
  Resatuarant Functionality JS
*/

/*==================== CHANGE BACKGROUND HEADER ====================*/
function scrollHeader() {
    const nav = document.getElementById('header')
    // When the scroll is greater than 200 viewport height, add the scroll-header class to the header tag
    if (this.scrollY >= 200) nav.classList.add('scroll-header'); else nav.classList.remove('scroll-header')
}
window.addEventListener('scroll', scrollHeader)

/*==================== SHOW SCROLL TOP ====================*/
function scrollTop() {
    const scrollTop = document.getElementById('scroll-top');
    // When the scroll is higher than 560 viewport height, add the show-scroll class to the a tag with the scroll-top class
    if (this.scrollY >= 560) scrollTop.classList.add('show-scroll'); else scrollTop.classList.remove('show-scroll')
}
window.addEventListener('scroll', scrollTop)

/*==================== SCROLL REVEAL ANIMATION ====================*/
const sr = ScrollReveal({
    origin: 'top',
    distance: '30px',
    duration: 2000,
    reset: true
});

sr.reveal(`.home__data, .home__img,
            .about__data, .about__img,
            .services__content, .menu__content,
            .app__data, .app__img,
            .contact__data, .contact__button,
            .footer__content`, {
    interval: 200
})

/*==================== ORDER PROCESSING FUNCTIONS ====================*/
function addOrderData(restaurantId,restaurantName,subtotal,total,DelFee,Tax) {
    let orderData = {};
    const order = document.getElementsByClassName('cd-cart__product');
    for (let i = 0; i <= order.length - 1; i++) {
        let name = order[i].getElementsByClassName('product-name')[0].textContent;
        let quantity = order[i].getElementsByClassName('product-quantity')[0].value;
        orderData[i] = {quantity: quantity, name: name};
    }
    var postData = {
        restaurantId: restaurantId,
        restaurantName: restaurantName,
        subtotal: subtotal,
        total: total,
        deliveryFee: DelFee,
        tax: Tax,
        order: orderData
    }
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open("POST", "/checkout",true);
    xmlhttp.setRequestHeader("Content-Type", "application/json");
    xmlhttp.send(JSON.stringify(postData));
    xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState === 4) {
            if (xmlhttp.status === 200) {
                window.location = "/checkout-success";
            } else {
                window.location = "/checkout-failure";
            }
        }
    }
}

function checkout() {
    const restName = document.getElementById('restaurant-name');
    const restID = restName.getAttribute('restID');
    const checkoutInfo = document.getElementById('checkout-info');
    const subtotal = document.getElementById('checkout-amount').textContent;
    const MinOrder = checkoutInfo.getAttribute('MinOrder');
    const restaurantName = checkoutInfo.getAttribute('restaurant');
    if (parseInt(subtotal) >= parseInt(MinOrder)) {
        var total = 0;
        const DelFee = checkoutInfo.getAttribute('DelFee');
        const Tax = (0.1 * Number(subtotal)).toFixed(2);
        total = (Number(subtotal) + Number(Tax) + Number(DelFee)).toFixed(2);
        if (confirm("Order Summary:\nSubtotal: $" + subtotal + "\nTax: $" + Tax + "\nDelivery Fee: $" + DelFee + "\nTotal: $" + total + "\nAre you sure you want to chekout ?")) {
            addOrderData(restID,restaurantName,subtotal,total,DelFee,Tax);
        }
    } 
    else {
        alert("You need to order at least $" + MinOrder + " to checkout");
    }


}