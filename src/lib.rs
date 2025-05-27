#![deny(clippy::all)]

use napi_derive::napi;
use regex::Regex;

#[napi]
#[derive(Debug)]
pub enum CreditCardType {
  Unset,
  Visa,
  MasterCard,
  AmericanExpress,
  Discover,
  DinersClub,
  Jcb,
  AustralianBankCard,
}

pub fn luhn_check(cc_number: &str) -> bool {
  let mut sum = 0;
  let mut double = false;

  for c in cc_number.chars().rev() {
    if let Some(digit) = c.to_digit(10) {
      if double {
        let double_digit = digit * 2;
        sum += if double_digit > 9 {
          double_digit - 9
        } else {
          double_digit
        };
      } else {
        sum += digit;
      }
      double = !double;
    } else {
      continue;
    }
  }

  sum % 10 == 0
}

const CARD_PATTERNS: [&str; 7] = [
  r"4\d{3}(?:[ -]?\d{4}){3}",                  // Visa
  r"5[1-5]\d{2}(?:[ -]?\d{4}){3}",             // MasterCard
  r"(?:6011|65\d{2})(?:[ -]?\d{4}){3}",        // Discover
  r"3[47]\d{2}[ -]?\d{6}[ -]?\d{5}",           // Amex
  r"3[0689]\d{2}(?:[ -]?\d{6})(?:[ -]?\d{4})", // Diners Club
  r"(?:2131|1800|35\d{2})(?:[ -]?\d{4}){3}",   // JCB
  r"5610(?:[ -]?\d{4}){3}",                    // Australian BankCard
];

#[napi]
pub fn mask_credit_card(input: String) -> String {
  use regex::RegexSet;

  let regex_set = RegexSet::new(CARD_PATTERNS).unwrap();

  let matched_patterns: std::collections::HashSet<_> = regex_set
    .matches(&input)
    .into_iter()
    .map(|index| &CARD_PATTERNS[index])
    .collect();

  if matched_patterns.is_empty() {
    return input;
  }

  let mut result = input;

  for pattern in matched_patterns {
    let regex = Regex::new(pattern).expect("Failed to create regex");
    result = regex
      .replace_all(&result, |caps: &regex::Captures| {
        let matched = caps.get(0).unwrap().as_str();
        let clean_number = matched.replace(|c: char| !c.is_ascii_digit(), "");

        if luhn_check(&clean_number) {
          let len = clean_number.len();
          if len >= 4 {
            let first_four = &clean_number[..4];
            let last_four = &clean_number[len - 4..];
            let middle_stars = "*".repeat(len - 8);
            format!("{}{}{}", first_four, middle_stars, last_four)
          } else {
            matched.to_string()
          }
        } else {
          matched.to_string()
        }
      })
      .to_string();
  }

  result
}

#[napi]
pub fn classify_credit_card(input: String) -> bool {
  use regex::RegexSet;

  let regex_set = RegexSet::new(CARD_PATTERNS).expect("Failed to create regex set");

  let matched_patterns: std::collections::HashSet<_> =
    regex_set.matches(&input).into_iter().collect();

  if matched_patterns.is_empty() {
    return false;
  }

  for pattern_index in matched_patterns {
    let pattern = &CARD_PATTERNS[pattern_index];
    let regex = Regex::new(pattern).expect("Failed to create regex");
    if let Some(caps) = regex.captures(&input) {
      let matched = caps.get(0).unwrap().as_str();
      let clean_number = matched.replace(|c: char| !c.is_ascii_digit(), "");

      if luhn_check(&clean_number) {
        return true;
      }
    }
  }

  false
}
