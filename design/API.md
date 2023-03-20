
# API

## Create account
`POST /api/accounts`

**expects**: 

```javascript
body: {
   account_type: `"customer" | "company"`
}
```

**returns**: 
```javascript
{
   account: `etherium account`,
   private_key: `etherium private key`
}
```

<hr>

## Check balance
`GET /api/accounts/{account}/balance`

**expects**:
```javascript
url: {
   account: `etherium account`
}
```

**returns**:
```javascript
body: {
   balance: `tokens amount`
}
```

<hr>

## Transfer tokens
`POST /api/accounts/{account}/transfer`

**expects**:
```javascript
headers: {
   'x-private-key': `etherium private key`
}

url: {
   account: `etherium account`
}

body: {
   recepient: `etherium account`,
   tokens: `number tokens`
}
```

<hr>

## Withdraw money
`POST /api/accounts/{account}/widthdrawal`

**expects**:
```javascript
headers: {
   'x-private-key': `etherium private key`
}

url: {
   account: `etherium account`
}

body: {
   tokens: `number tokens`
}
```

<hr>

## Set current price
`PUT /api/system/fuel-price`

**expects**:
```javascript
headers: {
   'x-private-key': `etherium private key`
}


body: {
   fuel_price: `float`
}
```

<hr>

## Retrieve current price
`GET /api/system/fuel-price`

**returns**:
```javascript
body: {
   fuel_price: `float`
}
```

<hr>

## Initiate payment
`POST /api/payments`

**expects**:
```javascript
body: {
   tokens: `float`
}
```

<hr>







