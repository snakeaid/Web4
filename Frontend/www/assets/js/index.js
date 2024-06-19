// Declare pizzaInfo as a global variable
let pizzaInfo;
const contentNamesArray = [];

async function fetchPizzaData() {
    try {
        const response = await fetch('assets/pizza_info.json');
        pizzaInfo = await response.json();
        createPizzaElements(pizzaInfo);
    } catch (error) {
        console.error('Error fetching pizza data:', error);
    }
}

const pizzaCount = document.querySelector('.all-pizza-counter');

function updatePizzaCount(cnt) {
    pizzaCount.textContent = cnt.toString();
}

// Функція для створення та додавання елементів піци до DOM
function createPizzaElements(pizzaInfo) {
    const allItemsGrid = document.querySelector('.all-items-grid');

    for (let index = 0; index < pizzaInfo.length; index++){
        const pizza = pizzaInfo[index];
        const contentNames = Object.keys(pizza.content);
        contentNamesArray.push(contentNames);
        updatePizzaCount(parseInt(pizzaCount.textContent) + 1);
        // Create the main container for each pizza item
        const oneItemSection = document.createElement('section');
        oneItemSection.classList.add('one-item-section');
        // Add the 'data' attribute 'product-id' to the container
        oneItemSection.setAttribute('data-product-id', index);
        // Create the image section
        const imgSection = document.createElement('section');
        imgSection.classList.add('img-section');

        const pizzaImg = document.createElement('img');
        pizzaImg.classList.add('pizza-img');
        pizzaImg.src = pizza.icon;
        pizzaImg.alt = pizza.title;

        imgSection.appendChild(pizzaImg);

        // Create the state section(s)
        const stateSection = document.createElement('div');
        stateSection.classList.add('state-section');

        if (pizza.is_new) {
            const newStateSection = document.createElement('div');
            newStateSection.classList.add('state-section-new');
            newStateSection.textContent = 'Нова';
            stateSection.appendChild(newStateSection);
            if (!pizza.is_popular) {
                newStateSection.classList.add('one-state');
            }
        }

        if (pizza.is_popular) {
            const popularStateSection = document.createElement('div');
            popularStateSection.classList.add('state-section-popular');
            popularStateSection.textContent = 'Популярна';
            stateSection.appendChild(popularStateSection);
            if (!pizza.is_new) {
                popularStateSection.classList.add('one-state');
            }
        }

        imgSection.appendChild(stateSection);

        // Create the product info section
        const productInfoSection = document.createElement('section');
        productInfoSection.classList.add('product-info-section');

        const itemSection = document.createElement('section');
        itemSection.classList.add('item-section');

        const itemName = document.createElement('p');
        itemName.classList.add('item-name');
        itemName.textContent = pizza.title;

        const itemTypeProduct = document.createElement('p');
        itemTypeProduct.classList.add('item-type-product');
        itemTypeProduct.textContent = pizza.type;

        const itemDes = document.createElement('p');
        itemDes.classList.add('item-des');
        const contentItems = Object.values(pizza.content).flatMap((value) => value);
        itemDes.textContent = contentItems.join(', ');

        itemSection.appendChild(itemName);
        itemSection.appendChild(itemTypeProduct);
        itemSection.appendChild(itemDes);

        // Create the order section
        const orderSection = document.createElement('section');
        orderSection.classList.add('order-section');

        if (pizza.small_size && !pizza.big_size || !pizza.small_size && pizza.big_size) {
            orderSection.classList.add('one');
        }

        if (pizza.small_size) {
            const smallOrderSection = createPizzaOrderSection(pizza.small_size, pizza.icon, pizza.title, 'small');
            orderSection.appendChild(smallOrderSection);
        }

        if (pizza.big_size) {
            const bigOrderSection = createPizzaOrderSection(pizza.big_size, pizza.icon, pizza.title, 'big');
            orderSection.appendChild(bigOrderSection);
        }

        productInfoSection.appendChild(itemSection);
        productInfoSection.appendChild(orderSection);

        oneItemSection.appendChild(imgSection);
        oneItemSection.appendChild(productInfoSection);

        allItemsGrid.appendChild(oneItemSection);

    }
}

function createPizzaOrderSection(size, imgUrl, title, pizza_size) {
    const orderSection = document.createElement('section');
    orderSection.classList.add('small-order-section');

    const sizeText = document.createElement('p');
    sizeText.classList.add('size-text');
    sizeText.textContent = `⍉ ${size.size}`;

    const weightImg = document.createElement('p');
    weightImg.classList.add('size-text', 'weight-img');
    weightImg.innerHTML = `<img src="assets/images/weight.svg" alt="weight" /> ${size.weight}`;

    const priceText = document.createElement('p');
    priceText.classList.add('price-text');
    priceText.textContent = size.price;

    const currencyText = document.createElement('p');
    currencyText.classList.add('currency-text');
    currencyText.textContent = 'грн.';

    const buyButton = document.createElement('button');
    buyButton.classList.add('buy-button');
    buyButton.textContent = 'Купити';

    // Add event listener to the "Купити" (Buy) button
    buyButton.addEventListener('click', () => {
        addToCart(size, priceText.textContent, imgUrl, title, pizza_size);
    });

    orderSection.appendChild(sizeText);
    orderSection.appendChild(weightImg);
    orderSection.appendChild(priceText);
    orderSection.appendChild(currencyText);
    orderSection.appendChild(buyButton);

    return orderSection;
}

const orderAmountElement = document.querySelector('.order-amount');

function updateOrderAmount(quantity) {
    orderAmountElement.textContent = quantity.toString();
}

// Очищення замовлення
function clearOrder() {
    const productsSection = document.querySelector('.products-section');
    productsSection.innerHTML = '';
    updateOrderAmount(0);
    updatePrice();
}

function updateOrderAmountPrice(price) {
    const orderAmountPriceElement = document.querySelector('.order-amount-price');
    orderAmountPriceElement.textContent = price.toString() + ' грн';
}

// Функція для розрахунку суми замовлення
function calculateOrderAmountPrice() {
    const productsSection = document.querySelector('.products-section');
    const products = productsSection.getElementsByClassName('ordered-product-section');
    let totalPrice = 0;

    // Перебір всіх піц в кошику та додавання ціни кожної піци до загальної суми
    for (let i = 0; i < products.length; i++) {
        const product = products[i];

        const priceElement = product.querySelector('.price');
        const quantityElement = product.querySelector('.amount-ordered');

        const price = parseFloat(priceElement.textContent);
        const quantity = parseInt(quantityElement.textContent);

        totalPrice += price * quantity;
    }

    return totalPrice;
}

// Оновлення суми замовлення
function updatePrice() {
    const totalPrice = calculateOrderAmountPrice();
    updateOrderAmountPrice(totalPrice);
}

//  додати піцу в кошик
function addToCart(size, price, imgUrl, title, pizza_size) {
    const productsSection = document.querySelector('.products-section');
    const existingProducts = productsSection.getElementsByClassName('ordered-product-section');

    // Check if the pizza is already in the cart
    for (let i = 0; i < existingProducts.length; i++) {
        const product = existingProducts[i];
        const productNameElement = product.querySelector('.ordered-name');

        // If the pizza with the same name and size already exists, increase the quantity
        if (productNameElement.textContent === `${title} ${pizza_size === 'big' ? '(Велика)' : '(Мала)'}`) {
            const quantityElement = product.querySelector('.amount-ordered');
            const quantity = parseInt(quantityElement.textContent);
            quantityElement.textContent = (quantity + 1).toString();
            updateOrderAmount(parseInt(orderAmountElement.textContent) + 1);
            updatePrice();
            saveCartToLocalStorage(); // Save the updated cart to localStorage
            return; // Exit the function since the pizza is already in the cart
        }
    }

    const orderedProductSection = document.createElement('section');
    orderedProductSection.classList.add('ordered-product-section');
    updateOrderAmount(parseInt(orderAmountElement.textContent) + 1);
    const orderedProductInfo = document.createElement('section');
    orderedProductInfo.classList.add('ordered-product-info');

    const nameAndWeight = document.createElement('section');
    nameAndWeight.classList.add('name-and-weight');

    const orderedName = document.createElement('p');
    orderedName.classList.add('ordered-name');
    orderedName.textContent = `${title} ${pizza_size === 'big' ? '(Велика)' : '(Мала)'}`;

    const sizeTextOrdered = document.createElement('label');
    sizeTextOrdered.classList.add('size-text-ordered');
    sizeTextOrdered.textContent = `⍉ ${size.size}`;

    const weightTextOrdered = document.createElement('label');
    weightTextOrdered.classList.add('size-text-ordered');
    weightTextOrdered.innerHTML = `<img src="assets/images/weight.svg" alt="weight">${' ' + size.weight + ' '}`;

    nameAndWeight.appendChild(orderedName);
    nameAndWeight.appendChild(sizeTextOrdered);
    nameAndWeight.appendChild(weightTextOrdered);

    const orderedAmountSection = document.createElement('section');
    orderedAmountSection.classList.add('ordered-amount-section');

    const orderedLeftSection = document.createElement('section');
    orderedLeftSection.classList.add('ordered-left-section');

    const priceText = document.createElement('span');
    priceText.classList.add('price');
    priceText.textContent = price + ' грн';

    const orderedMiddleSection = document.createElement('section');
    orderedMiddleSection.classList.add('ordered-middle-section');

    const minusButton = document.createElement('button');
    minusButton.classList.add('minus-button');
    minusButton.textContent = '–';

    const amountOrdered = document.createElement('span');
    amountOrdered.classList.add('amount-ordered');
    amountOrdered.textContent = '1';

    const plusButton = document.createElement('button');
    plusButton.classList.add('plus-button');
    plusButton.textContent = '+';

    const orderedRightSection = document.createElement('section');
    orderedRightSection.classList.add('ordered-right-section');

    const removeButton = document.createElement('button');
    removeButton.classList.add('remove-button');
    removeButton.textContent = '✖';

    orderedLeftSection.appendChild(priceText);
    orderedMiddleSection.appendChild(minusButton);
    orderedMiddleSection.appendChild(amountOrdered);
    orderedMiddleSection.appendChild(plusButton);
    orderedRightSection.appendChild(removeButton);

    orderedAmountSection.appendChild(orderedLeftSection);
    orderedAmountSection.appendChild(orderedMiddleSection);
    orderedAmountSection.appendChild(orderedRightSection);

    orderedProductInfo.appendChild(nameAndWeight);
    orderedProductInfo.appendChild(orderedAmountSection);

    const orderedProductImage = document.createElement('section');
    orderedProductImage.classList.add('ordered-product-image');

    const orderedImage = document.createElement('img');
    orderedImage.classList.add('ordered-image');
    orderedImage.src = imgUrl;
    orderedImage.alt = size.title;

    orderedProductImage.appendChild(orderedImage);

    orderedProductSection.appendChild(orderedProductInfo);
    orderedProductSection.appendChild(orderedProductImage);

    // Event listener for plus button
    plusButton.addEventListener('click', () => {
        const quantity = parseInt(amountOrdered.textContent);
        amountOrdered.textContent = (quantity + 1).toString();
        updateOrderAmount(parseInt(orderAmountElement.textContent) + 1);
        updatePrice();
        saveCartToLocalStorage(); // Save the updated cart to localStorage
    });

    // Event listener for minus button
    minusButton.addEventListener('click', () => {
        let quantity = parseInt(amountOrdered.textContent);
        quantity -= 1;
        updateOrderAmount(parseInt(orderAmountElement.textContent) - 1);

        if (quantity <= 0) {
            // Remove the pizza from the cart if quantity becomes zero or negative
            orderedProductSection.remove();
            updatePrice();
            saveCartToLocalStorage(); // Save the updated cart to localStorage
        } else {
            amountOrdered.textContent = quantity.toString();
            updatePrice();
            saveCartToLocalStorage(); // Save the updated cart to localStorage
        }
    });

    // Event listener for remove button
    removeButton.addEventListener('click', () => {
        const quantity = parseInt(amountOrdered.textContent);
        orderedProductSection.remove();
        updatePrice();
        updateOrderAmount(parseInt(orderAmountElement.textContent) - quantity);
        saveCartToLocalStorage(); // Save the updated cart to localStorage
    });

    productsSection.appendChild(orderedProductSection);
    updatePrice();
    saveCartToLocalStorage(); // Save the updated cart to localStorage
}

function saveCartToLocalStorage() {
    const productsSection = document.querySelector('.products-section');
    const existingProducts = productsSection.getElementsByClassName('ordered-product-section');

    const cartData = [];
    for (let i = 0; i < existingProducts.length; i++) {
        const product = existingProducts[i];
        const productNameElement = product.querySelector('.ordered-name');
        const priceElement = product.querySelector('.price');
        const amountOrderedElement = product.querySelector('.amount-ordered');
        const orderedImage = product.querySelector('.ordered-image');

        const orderedProduct = {
            orderedName: productNameElement.textContent,
            price: priceElement.textContent,
            amountOrdered: amountOrderedElement.textContent,
            imgUrl: orderedImage.src
        };

        cartData.push(orderedProduct);
    }

    localStorage.setItem('cart', JSON.stringify(cartData));
    localStorage.setItem('orderAmount', orderAmountElement.textContent); // Save the order amount to localStorage
}


function loadCartFromLocalStorage() {
    const cartData = localStorage.getItem('cart');
    const orderAmount = localStorage.getItem('orderAmount');
    if (cartData) {
        const orderedProducts = JSON.parse(cartData);
        orderedProducts.forEach((product) => {
            addToCartFromLocalStorage(product);
        });
    }
    if (orderAmount) {
        updateOrderAmount(orderAmount);
    }
}

function addToCartFromLocalStorage(product) {
    const {orderedName, price, amountOrdered, imgUrl} = product;

    const productsSection = document.querySelector('.products-section');
    const orderedProductSection = document.createElement('section');
    orderedProductSection.classList.add('ordered-product-section');

    const orderedProductInfo = document.createElement('section');
    orderedProductInfo.classList.add('ordered-product-info');

    const nameAndWeight = document.createElement('section');
    nameAndWeight.classList.add('name-and-weight');

    const orderedNameElement = document.createElement('p');
    orderedNameElement.classList.add('ordered-name');
    orderedNameElement.textContent = orderedName;

    nameAndWeight.appendChild(orderedNameElement);

    const orderedAmountSection = document.createElement('section');
    orderedAmountSection.classList.add('ordered-amount-section');

    const orderedLeftSection = document.createElement('section');
    orderedLeftSection.classList.add('ordered-left-section');

    const priceText = document.createElement('span');
    priceText.classList.add('price');
    priceText.textContent = price;

    orderedLeftSection.appendChild(priceText);

    const orderedMiddleSection = document.createElement('section');
    orderedMiddleSection.classList.add('ordered-middle-section');

    const minusButton = document.createElement('button');
    minusButton.classList.add('minus-button');
    minusButton.textContent = '–';

    const amountOrderedElement = document.createElement('span');
    amountOrderedElement.classList.add('amount-ordered');
    amountOrderedElement.textContent = amountOrdered;

    const plusButton = document.createElement('button');
    plusButton.classList.add('plus-button');
    plusButton.textContent = '+';

    orderedMiddleSection.appendChild(minusButton);
    orderedMiddleSection.appendChild(amountOrderedElement);
    orderedMiddleSection.appendChild(plusButton);

    const orderedRightSection = document.createElement('section');
    orderedRightSection.classList.add('ordered-right-section');

    const removeButton = document.createElement('button');
    removeButton.classList.add('remove-button');
    removeButton.textContent = '✖';

    orderedRightSection.appendChild(removeButton);

    orderedAmountSection.appendChild(orderedLeftSection);
    orderedAmountSection.appendChild(orderedMiddleSection);
    orderedAmountSection.appendChild(orderedRightSection);

    const orderedProductImage = document.createElement('section');
    orderedProductImage.classList.add('ordered-product-image');

    const orderedImage = document.createElement('img');
    orderedImage.classList.add('ordered-image');
    orderedImage.src = imgUrl;

    orderedProductImage.appendChild(orderedImage);

    orderedProductInfo.appendChild(nameAndWeight);
    orderedProductInfo.appendChild(orderedAmountSection);

    orderedProductSection.appendChild(orderedProductInfo);
    orderedProductSection.appendChild(orderedProductImage);

    // Event listener for plus button
    plusButton.addEventListener('click', () => {
        const quantity = parseInt(amountOrderedElement.textContent);
        amountOrderedElement.textContent = (quantity + 1).toString();
        updateOrderAmount(parseInt(orderAmountElement.textContent) + 1);
        updatePrice();
        saveCartToLocalStorage(); // Save the updated cart to localStorage
    });

    // Event listener for minus button
    minusButton.addEventListener('click', () => {
        let quantity = parseInt(amountOrderedElement.textContent);
        quantity -= 1;
        updateOrderAmount(parseInt(orderAmountElement.textContent) - 1);

        if (quantity <= 0) {
            // Remove the pizza from the cart if quantity becomes zero or negative
            orderedProductSection.remove();
            updatePrice();
            saveCartToLocalStorage(); // Save the updated cart to localStorage
        } else {
            amountOrderedElement.textContent = quantity.toString();
            updatePrice();
            saveCartToLocalStorage(); // Save the updated cart to localStorage
        }
    });

    // Event listener for remove button
    removeButton.addEventListener('click', () => {
        const quantity = parseInt(amountOrderedElement.textContent);
        orderedProductSection.remove();
        updatePrice();
        updateOrderAmount(parseInt(orderAmountElement.textContent) - quantity);
        saveCartToLocalStorage(); // Save the updated cart to localStorage
    });

    productsSection.appendChild(orderedProductSection);
    updatePrice();
}

// Call this function to load the cart from localStorage when the page loads
loadCartFromLocalStorage();

document.querySelector('.clear-order-text').addEventListener('click', clearOrder);

// Call the function to fetch pizza data and create pizza elements
fetchPizzaData();

document.querySelector('.pizza-type-filter').addEventListener('click', (event) => {
    const selectedType = event.target.textContent.trim();
    let isMatch;
    // Get all pizza items
    const pizzaItems = document.querySelectorAll('.one-item-section');
    const pizzaCnt = document.querySelector('.all-pizza-counter');
    let cnt = 0;
    // Iterate over each pizza item
    for (const item of pizzaItems) {

        // Get the product ID from the data attribute
        const productId = item.getAttribute('data-product-id');
        // Get the corresponding content names array based on the product ID
        const contentNames = contentNamesArray[productId];
        switch (selectedType) {
            case 'Усі': {
                isMatch = selectedType === 'Усі'
                break;
            }
            case 'М\'ясна': {
                isMatch = contentNames.some((name) => name.includes('meat') || contentNames.some((name) => name.includes('chicken')));
                break;
            }
            case 'Ананас': {
                isMatch = contentNames.some((name) => name.includes('pineapple'));
                break;
            }
            case 'З грибами': {
                isMatch = contentNames.some((name) => name.includes('mushroom'));
                break;
            }
            case 'З морепродуктами': {
                isMatch = contentNames.some((name) => name.includes('ocean'));
                break;
            }
            case 'Веган': {
                isMatch = contentNames.every((name) => !name.includes('meat') && !name.includes('chicken') && !name.includes('ocean'));
                break;
            }
        }

        // Show or hide the pizza item based on the match result
        item.style.display = isMatch ? 'block' : 'none';
        if (isMatch) {
            cnt++;
        }
    }
    pizzaCnt.textContent = cnt.toString();
    // Toggle the 'selected' class on the clicked pizza type button
    const pizzaTypeButtons = document.querySelectorAll('.pizza-type-text');
    pizzaTypeButtons.forEach((button) => {
        button.classList.toggle('selected', button.textContent.trim() === selectedType);
    });
});