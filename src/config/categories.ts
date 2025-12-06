export interface ExpenseCategory {
  id: string;
  name: string;
  subcategories: string[];
}

export const EXPENSE_CATEGORIES: { [key: string]: ExpenseCategory } = {
  'Food & Dining': {
    id: 'food-dining',
    name: 'Food & Dining',
    subcategories: ['Foods', 'Grocery & Vegetables'],
  },
  'Home & Living': {
    id: 'home-living',
    name: 'Home & Living',
    subcategories: ['Maid', 'Bills', 'Home Maintaince', 'Interior Work'],
  },
  'Health & Wellness': {
    id: 'health-wellness',
    name: 'Health & Wellness',
    subcategories: ['Medical', 'Insurance', 'Grooming and Parlour', 'Vaccinations/Doctor'],
  },
  'Baby Care': {
    id: 'baby-care',
    name: 'Baby Care',
    subcategories: [
      'Baby essentials',
      'Nanny',
      'Childcare',
      'Baby/Mother Medicine',
      'Baby Toys/Shopping/Other',
    ],
  },
  Transportation: {
    id: 'transportation',
    name: 'Transportation',
    subcategories: [
      'Office Traveling',
      'Petrol',
      'Car/Bike/Scooty Service',
      'Insurance',
      'Parking',
    ],
  },
  Investments: {
    id: 'investments',
    name: 'Investments',
    subcategories: [
      'Other',
      'Mutual Funds/SIP/SWP/ELSS',
      'Gold/Diamond/Silver/Jewelry',
      'Retirement Funds',
      'Emergency Funds',
      'Other Investments',
      'Office Provident Fund',
      'PPF',
      'NPS',
    ],
  },
  Lifestyle: {
    id: 'lifestyle',
    name: 'Lifestyle',
    subcategories: ['Travels', 'Shopping', 'Entertainment', 'Gifts'],
  },
  'Debt & Loans': {
    id: 'debt-loans',
    name: 'Debt & Loans',
    subcategories: [
      'EMIs',
      'Loans',
      'Windsor Extra Loan Payment',
      'Aditya Extra Loan Payment',
      'Car Extra Loan Payment',
      'Loan or Saving Fees/Charges/Penalty',
    ],
  },
  Miscellaneous: {
    id: 'miscellaneous',
    name: 'Miscellaneous',
    subcategories: [
      'One Time Expense/Unexpected Others',
      'Extra Tax Payments/CA Payments',
      'Accidental',
      'Others',
    ],
  },
  Professional: {
    id: 'professional',
    name: 'Professional',
    subcategories: ['Software', 'Learning & Certifications', 'Domain/Hosting', 'Email', 'Others'],
  },
  'Personal & Family': {
    id: 'personal-family',
    name: 'Personal & Family',
    subcategories: ['Given To Papa', 'Credit Card Fees/GST/Other Charges', 'Donation'],
  },
  Income: {
    id: 'income',
    name: 'Income',
    subcategories: ['Salary', 'Software'],
  },
};

export const PAYMENT_METHODS = [
  'Credit Card',
  'Debit Card',
  'Cash',
  'UPI',
  'Net Banking',
  'Wallet',
  'User not provided payment method',
];
