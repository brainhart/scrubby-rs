import { Bench } from 'tinybench'

import { maskCreditCard } from '../index.js'

// Test data - various credit card numbers for benchmarking
const testCreditCards = [
  '4111111111111111', // Visa
  '5555555555554444', // MasterCard
  '378282246310005',  // American Express
  '6011111111111117', // Discover
  '30569309025904',   // Diners Club
  '3530111333300000', // JCB
  '5610591081018250', // Australian BankCard
]

const testTexts = [
  'My card number is 4111111111111111 and my backup is 5555555555554444',
  'Please charge 378282246310005 for the purchase',
  'Contact info: phone 123-456-7890, card 6011111111111117, email test@example.com',
  'Multiple cards: 4111111111111111, 5555555555554444, 378282246310005',
  'No credit cards here, just phone numbers: 555-123-4567 and 999-888-7777',
]

const b = new Bench()

b.add('maskCreditCard - single card number', () => {
  maskCreditCard('4111111111111111')
})

b.add('maskCreditCard - text with multiple cards', () => {
  maskCreditCard('My card number is 4111111111111111 and my backup is 5555555555554444')
})

b.add('maskCreditCard - text with no cards', () => {
  maskCreditCard('No credit cards here, just phone numbers: 555-123-4567 and 999-888-7777')
})

b.add('maskCreditCard - various card types', () => {
  testCreditCards.forEach(card => maskCreditCard(card))
})

b.add('maskCreditCard - mixed content batch', () => {
  testTexts.forEach(text => maskCreditCard(text))
})

await b.run()

console.table(b.table())
