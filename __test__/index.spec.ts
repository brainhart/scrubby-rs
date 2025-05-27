import test from 'ava'

import { maskCreditCard, classifyCreditCard } from '../index'

// https://www.paypalobjects.com/en_GB/vhelp/paypalmanager_help/credit_card_numbers.htm
const test_card_numbers = [
  {
    type: 'American Express',
    number: '378282246310005',
  },

  {
    type: 'American Express',
    number: '371449635398431',
  },
  {
    type: 'American Express Corporate',
    number: '378734493671000',
  },
  {
    type: 'Australian BankCard',
    number: '5610591081018250',
  },
  {
    type: 'Diners Club',
    number: '30569309025904',
  },
  {
    type: 'Diners Club',
    number: '38520000023237',
  },
  {
    type: 'Discover',
    number: '6011111111111117',
  },
  {
    type: 'Discover',
    number: '6011000990139424',
  },
  {
    type: 'JCB',
    number: '3530111333300000',
  },
  {
    type: 'JCB',
    number: '3566002020360505',
  },
  {
    type: 'MasterCard',
    number: '5555555555554444',
  },
  {
    type: 'MasterCard',
    number: '5105105105105100',
  },
  {
    type: 'Visa',
    number: '4111111111111111',
  },
  {
    type: 'Visa',
    number: '4012888888881881',
  },
]

function formatCreditCardNumber(number: string, type: string, separator: ' ' | '-'): string {
  if (type.includes('American Express')) {
    // Amex: 4-6-5 format
    return `${number.slice(0, 4)}${separator}${number.slice(4, 10)}${separator}${number.slice(10)}`
  } else if (type === 'Diners Club') {
    // Diners Club: 4-6-4 format
    return `${number.slice(0, 4)}${separator}${number.slice(4, 10)}${separator}${number.slice(10)}`
  } else {
    // Visa, MasterCard, Discover, JCB: 4-4-4-4 format
    return `${number.slice(0, 4)}${separator}${number.slice(4, 8)}${separator}${number.slice(8, 12)}${separator}${number.slice(12)}`
  }
}

function generateFormattedTestCases() {
  return test_card_numbers.flatMap(({ type, number }) => {
    const spaceFormatted = formatCreditCardNumber(number, type, ' ')
    const dashFormatted = formatCreditCardNumber(number, type, '-')
    const miscPrefix = Math.random().toString(36).substring(2, 15)
    const miscSuffix = Math.random().toString(36).substring(2, 15)
    const randomPrefixSuffix = `${miscPrefix}${number}${miscSuffix}`

    const len = number.length
    const first_four = number.slice(0, 4)
    const last_four = number.slice(len - 4)
    const middle_stars = '*'.repeat(len - 8)
    const expected = `${first_four}${middle_stars}${last_four}`

    return [
      { type, input: number, expected },
      { type, input: spaceFormatted, expected },
      { type, input: dashFormatted, expected },
      { type, input: randomPrefixSuffix, expected: `${miscPrefix}${expected}${miscSuffix}` }
    ]
  })
}

const creditCardTestCases = generateFormattedTestCases()


creditCardTestCases.forEach(({ type, input, expected }, index) => {
  test(`masks credit card format: ${type} ${index + 1}: ${input}`, (t) => {
    const result = maskCreditCard(input)
    t.is(result, expected)
  })

  test(`classifies credit card format ${index + 1}: ${input}`, (t) => {
    const result = classifyCreditCard(input)
    t.is(result, true)
  })
})
